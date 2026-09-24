"use client";

import { useMemo, useState } from "react";
import { CheckCircleIcon, DownloadSimpleIcon, FloppyDiskIcon, PlugIcon } from "@phosphor-icons/react";
import YAML from "yaml";
import { useAppState } from "@/components/app-state";
import { PageHeader } from "@/components/ui";
import { downloadJson, normalizeRemote } from "@/lib/client-utils";
import { parserManifestSchema } from "@/lib/schemas";
import type { AllowedTransform, ConcreteLogFormat, NormalizationBatch, ParserManifest } from "@/lib/types";

const builtins = [
  ["builtin.cef", "ArcSight CEF", "Palo Alto, Check Point, Cisco", "CEF"], ["builtin.leef", "IBM LEEF", "QRadar-compatible sources", "LEEF"],
  ["builtin.syslog", "RFC 5424", "Routers, firewalls, gateways", "SYSLOG"], ["builtin.json", "JSON / NDJSON", "Suricata EVE and cloud logs", "JSON"],
  ["builtin.kv", "Key-value", "Fortinet and appliance text", "KV"], ["builtin.csv-xml", "Tabular / XML", "Legacy exports and archives", "CSV + XML"],
] as const;

const CUSTOM_SAMPLE = "src=203.0.113.14 dst=10.0.4.7 spt=49002 dpt=22 proto=TCP verdict=denied risk=high note=SSH_probe";
const DEFAULT_MAPPINGS = "src -> src_endpoint.ip -> ip\ndst -> dst_endpoint.ip -> ip\nspt -> src_endpoint.port -> integer\ndpt -> dst_endpoint.port -> integer\nproto -> connection_info.protocol_name -> protocol\nverdict -> action -> lowercase\nrisk -> severity_id -> severity\nnote -> message -> string";

export function SourceRegistry() {
  const { manifests, saveManifest, addBatch } = useAppState();
  const [step, setStep] = useState(1);
  const [id, setId] = useState("custom.edge-gateway");
  const [name, setName] = useState("Edge Gateway Text");
  const [vendor, setVendor] = useState("Demo Vendor");
  const [product, setProduct] = useState("Border Gateway");
  const [format, setFormat] = useState<ConcreteLogFormat>("kv");
  const [sample, setSample] = useState(CUSTOM_SAMPLE);
  const [pattern, setPattern] = useState("");
  const [mappingText, setMappingText] = useState(DEFAULT_MAPPINGS);
  const [preview, setPreview] = useState<NormalizationBatch | null>(null);
  const [error, setError] = useState("");

  const draft = useMemo((): ParserManifest => ({
    id, name, version: "1.0.0", vendor, product, format, detection: { contains: vendor },
    extraction: pattern ? { pattern } : undefined, ocsfClassUid: 4001,
    mappings: mappingText.split(/\r?\n/).filter(Boolean).map((line) => {
      const [from = "", to = "", transform = "string"] = line.split("->").map((part) => part.trim());
      return { from, to, transform: transform as AllowedTransform };
    }),
  }), [id, name, vendor, product, format, pattern, mappingText]);

  async function validatePreview() {
    setError(""); setPreview(null);
    const parsed = parserManifestSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(" | ")); return; }
    try { const result = await normalizeRemote({ text: sample, format, sourceId: id, manifest: parsed.data }); setPreview(result); addBatch(result); setStep(4); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Manifest validation failed."); }
  }

  function save() {
    const parsed = parserManifestSchema.safeParse(draft);
    if (!parsed.success || !preview) return;
    saveManifest(parsed.data);
  }

  return (
    <div className="page">
      <PageHeader code="04 / SOURCES" title="Onboard without code." description="Describe how a source identifies and maps its fields. The same deterministic pipeline handles the rest." action={<button className="button primary" onClick={() => document.getElementById("onboarding")?.scrollIntoView({ behavior: "smooth" })}><PlugIcon /> NEW SOURCE</button>} />
      <div className="source-grid">
        {builtins.map(([sourceId, sourceName, description, sourceFormat]) => <div className="source-card" key={sourceId}><div className="source-card-top"><code>{sourceId}</code><span className="format-chip">{sourceFormat}</span></div><h3>{sourceName}</h3><p>{description}</p></div>)}
        {manifests.map((manifest) => <div className="source-card" key={manifest.id}><div className="source-card-top"><code>{manifest.id}</code><span className="format-chip">CUSTOM / {manifest.format.toUpperCase()}</span></div><h3>{manifest.name}</h3><p>{manifest.vendor} / {manifest.product} / {manifest.mappings.length} mappings</p></div>)}
      </div>

      <section className="wizard" id="onboarding">
        <div className="wizard-steps">{[[1,"Identify"],[2,"Extract"],[3,"Map"],[4,"Validate"]].map(([number, label]) => <button key={number} className={step === number ? "wizard-step active" : "wizard-step"} onClick={() => setStep(number as number)}><b>0{number}</b>{label}</button>)}</div>
        <div className="wizard-body">
          {step === 1 ? <><span className="section-code">SOURCE IDENTITY</span><h2>Register the producer.</h2><div className="form-row"><div className="field"><label htmlFor="manifest-id">Manifest ID</label><input className="input" id="manifest-id" value={id} onChange={(event) => setId(event.target.value)} /></div><div className="field"><label htmlFor="manifest-name">Display name</label><input className="input" id="manifest-name" value={name} onChange={(event) => setName(event.target.value)} /></div><div className="field"><label htmlFor="vendor">Vendor</label><input className="input" id="vendor" value={vendor} onChange={(event) => setVendor(event.target.value)} /></div><div className="field"><label htmlFor="product">Product</label><input className="input" id="product" value={product} onChange={(event) => setProduct(event.target.value)} /></div></div><div className="form-actions"><button className="button primary" onClick={() => setStep(2)}>CONTINUE TO EXTRACT</button></div></> : null}
          {step === 2 ? <><span className="section-code">SAMPLE + EXTRACTION</span><h2>Show one real event.</h2><div className="form-row"><div className="field"><label htmlFor="custom-format">Base format</label><select className="select" id="custom-format" value={format} onChange={(event) => setFormat(event.target.value as ConcreteLogFormat)}>{["kv","json","csv","xml","syslog","cef","leef"].map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select></div><div className="field"><label htmlFor="pattern">Named-capture pattern (optional)</label><input className="input" id="pattern" value={pattern} onChange={(event) => setPattern(event.target.value)} placeholder="(?&lt;src&gt;...)" /><span className="helper">Patterns are length-bounded and rejected if unsafe.</span></div></div><div className="field" style={{ marginTop: 13 }}><label htmlFor="source-sample">Source sample</label><textarea className="textarea" id="source-sample" value={sample} onChange={(event) => setSample(event.target.value)} /></div><div className="form-actions"><button className="button" onClick={() => setStep(1)}>BACK</button><button className="button primary" onClick={() => setStep(3)}>CONTINUE TO MAP</button></div></> : null}
          {step === 3 ? <><span className="section-code">DECLARATIVE FIELD MAP</span><h2>Map into OCSF.</h2><div className="field"><label htmlFor="mappings">One mapping per line: source → target → transform</label><textarea className="textarea" id="mappings" value={mappingText} onChange={(event) => setMappingText(event.target.value)} /><span className="helper">Approved transforms: string, integer, lowercase, timestamp, ip, protocol, severity. No executable code is accepted.</span></div>{error ? <div className="error-box" role="alert">{error}</div> : null}<div className="form-actions"><button className="button" onClick={() => setStep(2)}>BACK</button><button className="button primary" onClick={() => void validatePreview()}>VALIDATE + PREVIEW</button></div></> : null}
          {step === 4 ? <><span className="section-code">INVARIANT CHECK</span><h2>{preview ? "Manifest accepted." : "Validation required."}</h2>{preview ? <><div className="success-box"><CheckCircleIcon /> {preview.events.length} sample event normalized. Evidence, lineage and integrity fields are present.</div><pre className="code-block" style={{ marginTop: 14, minHeight: 200 }}>{JSON.stringify(preview.events[0].ocsf, null, 2)}</pre><div className="form-actions"><button className="button primary" onClick={save}><FloppyDiskIcon /> SAVE LOCALLY</button><button className="button" onClick={() => downloadJson(`${draft.id}.yaml`, YAML.stringify(draft), "application/yaml")}><DownloadSimpleIcon /> DOWNLOAD YAML</button><button className="button" onClick={() => setStep(3)}>EDIT MAPPING</button></div></> : <><p className="muted">Run validation from the mapping step before saving this parser manifest.</p><button className="button" onClick={() => setStep(3)}>RETURN TO MAP</button></>}</> : null}
        </div>
      </section>
    </div>
  );
}
