"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircleIcon, DownloadSimpleIcon, FileArrowUpIcon, FlaskIcon, ShieldWarningIcon } from "@phosphor-icons/react";
import { useAppState } from "@/components/app-state";
import { PageHeader, Panel } from "@/components/ui";
import { downloadJson, normalizeRemote, sha256Text } from "@/lib/client-utils";
import { DEFAULT_SAMPLE, LOG_SAMPLES } from "@/lib/samples";
import type { LogFormat, NormalizationBatch } from "@/lib/types";

type ResultTab = "ocsf" | "ecs" | "original" | "lineage" | "integrity";

export function LabWorkspace() {
  const { addBatch } = useAppState();
  const [text, setText] = useState(DEFAULT_SAMPLE.content);
  const [format, setFormat] = useState<LogFormat>("auto");
  const [sampleId, setSampleId] = useState(DEFAULT_SAMPLE.id);
  const [batch, setBatch] = useState<NormalizationBatch | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tab, setTab] = useState<ResultTab>("ocsf");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState<"idle" | "valid" | "tampered">("idle");
  const [simulatedTamper, setSimulatedTamper] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const selected = batch?.events[selectedIndex];

  const output = useMemo(() => {
    if (!selected) return "Normalize an event to inspect its output.";
    if (tab === "ocsf") return JSON.stringify(selected.ocsf, null, 2);
    if (tab === "ecs") return JSON.stringify(selected.ecs, null, 2);
    if (tab === "original") return simulatedTamper ? `${selected.evidence.text}\n[tamper_test=true]` : selected.evidence.text;
    return "";
  }, [selected, tab, simulatedTamper]);

  function chooseSample(id: string) {
    const sample = LOG_SAMPLES.find((item) => item.id === id) ?? DEFAULT_SAMPLE;
    setSampleId(sample.id); setText(sample.content); setFormat("auto"); setBatch(null); setError(""); setVerification("idle"); setSimulatedTamper(false);
  }

  async function runNormalization() {
    setBusy(true); setError(""); setVerification("idle"); setSimulatedTamper(false);
    try {
      const result = await normalizeRemote({ text, format, sourceId: LOG_SAMPLES.find((item) => item.id === sampleId)?.id ?? "interactive-input" });
      setBatch(result); setSelectedIndex(0); setTab("ocsf"); addBatch(result);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Normalization failed."); }
    finally { setBusy(false); }
  }

  async function upload(file: File) {
    setBusy(true); setError("");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setText(new TextDecoder().decode(bytes)); setSampleId("uploaded");
      const result = await normalizeRemote({ bytes, format, sourceId: file.name, mediaType: file.type || "text/plain" });
      setBatch(result); setSelectedIndex(0); setTab("ocsf"); addBatch(result);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Upload failed."); }
    finally { setBusy(false); }
  }

  async function verify() {
    if (!selected) return;
    const candidate = simulatedTamper ? `${selected.evidence.text}\n[tamper_test=true]` : selected.evidence.text;
    const actual = await sha256Text(candidate);
    setVerification(actual === selected.evidence.sha256 ? "valid" : "tampered");
    setTab("integrity");
  }

  return (
    <div className="page">
      <PageHeader code="02 / PARSER LAB" title="Prove the pipeline." description="Paste or upload a perimeter event. ULPF detects, parses, maps and attests it without discarding the original bytes." action={<button className="button" onClick={() => uploadRef.current?.click()}><FileArrowUpIcon /> UPLOAD LOG</button>} />
      <input ref={uploadRef} hidden type="file" accept=".log,.txt,.json,.xml,.csv" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
      <div className="split-workspace">
        <Panel code="IN-01" title="Raw evidence">
          <div style={{ padding: 16 }}>
            <div className="form-row">
              <div className="field"><label htmlFor="sample">Evidence fixture</label><select id="sample" className="select" value={sampleId} onChange={(event) => chooseSample(event.target.value)}><option value="uploaded" disabled>Uploaded evidence</option>{LOG_SAMPLES.map((sample) => <option value={sample.id} key={sample.id}>{sample.label}</option>)}</select></div>
              <div className="field"><label htmlFor="format">Format override</label><select id="format" className="select" value={format} onChange={(event) => setFormat(event.target.value as LogFormat)}>{["auto", "cef", "leef", "syslog", "json", "xml", "csv", "kv"].map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select></div>
            </div>
            <div className="field" style={{ marginTop: 13 }}><label htmlFor="raw-log">Original event text</label><textarea id="raw-log" className="textarea" spellCheck={false} value={text} onChange={(event) => { setText(event.target.value); setBatch(null); }} /><span className="helper">UTF-8 text is Base64-wrapped before transport. Upload mode hashes the exact file bytes.</span></div>
            {error ? <div className="error-box" role="alert">[ NORMALIZATION_FAILED ] {error}</div> : null}
            <div className="form-actions"><button className="button primary" disabled={busy || !text.trim()} onClick={() => void runNormalization()}><FlaskIcon /> {busy ? "PROCESSING" : "NORMALIZE EVENT"}</button><button className="button" disabled={!selected} onClick={() => { setSimulatedTamper((value) => !value); setVerification("idle"); setTab("original"); }}><ShieldWarningIcon /> {simulatedTamper ? "RESTORE EVIDENCE" : "SIMULATE TAMPER"}</button></div>
          </div>
        </Panel>
        <Panel code="OUT-01" title="Normalized record" action={batch ? <span className="demo-flag">{batch.detectedFormat.toUpperCase()} / {Math.round(batch.detectionConfidence * 100)}% CONF.</span> : undefined}>
          <div className="tabs" role="tablist" aria-label="Normalization result views">{(["ocsf", "ecs", "original", "lineage", "integrity"] as ResultTab[]).map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? "tab active" : "tab"} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
          {batch && batch.events.length > 1 ? <div style={{ padding: 10, borderBottom: "1px solid var(--line)" }} className="field"><label htmlFor="record-select">Batch record</label><select id="record-select" className="select" value={selectedIndex} onChange={(event) => setSelectedIndex(Number(event.target.value))}>{batch.events.map((event, index) => <option key={event.uid} value={index}>Event {index + 1}: {event.ocsf.message}</option>)}</select></div> : null}
          {tab === "lineage" && selected ? <div>{selected.lineage.map((line, index) => <div className="lineage-row" key={`${line.sourcePath}-${line.targetPath}-${index}`}><code>{line.sourcePath}</code><span>→</span><code>{line.targetPath}</code><small>{line.transform}</small></div>)}</div> : null}
          {tab === "integrity" && selected ? <div style={{ padding: 16 }}>
            {verification === "valid" ? <div className="success-box"><CheckCircleIcon /> EVIDENCE VERIFIED. SHA-256 matches the preserved bytes.</div> : verification === "tampered" ? <div className="error-box"><ShieldWarningIcon /> TAMPER DETECTED. Current bytes do not match the attested fingerprint.</div> : <p className="helper">Recompute the evidence hash locally to verify the preserved record. This proves integrity, not signer authenticity.</p>}
            <div className="integrity-grid" style={{ marginTop: 14 }}><div className="integrity-cell"><span>Raw SHA-256</span><code>{selected.evidence.sha256}</code></div><div className="integrity-cell"><span>OCSF fingerprint</span><code>{selected.integrity.fingerprint}</code></div><div className="integrity-cell"><span>Chain UID</span><code>{selected.integrity.chainUid}</code></div><div className="integrity-cell"><span>Sequence / bytes</span><b>{selected.integrity.sequence} / {selected.evidence.byteLength} B</b></div></div>
            <div className="form-actions"><button className="button primary" onClick={() => void verify()}><CheckCircleIcon /> VERIFY EVIDENCE</button></div>
          </div> : null}
          {tab !== "lineage" && tab !== "integrity" ? <pre className="code-block">{output}</pre> : null}
          {selected ? <div className="form-actions" style={{ padding: "0 14px 14px" }}><button className="button small" onClick={() => downloadJson(`ulpf-${selected.uid}-${tab}.json`, tab === "ecs" ? selected.ecs : selected.ocsf)}><DownloadSimpleIcon /> DOWNLOAD {tab === "ecs" ? "ECS" : "OCSF"}</button></div> : null}
        </Panel>
      </div>
      {batch ? <div className="grid metrics-grid" style={{ marginTop: 20 }}><div className="metric"><span className="metric-label">Records</span><data className="metric-value">{batch.stats.eventCount}</data><span className="metric-foot">processed in this batch</span></div><div className="metric"><span className="metric-label">Duration</span><data className="metric-value">{batch.stats.durationMs}<small>ms</small></data><span className="metric-foot">single-node demo timing</span></div><div className="metric"><span className="metric-label">Mapped fields</span><data className="metric-value">{selected?.lineage.length ?? 0}</data><span className="metric-foot">field-level trace links</span></div><div className="metric"><span className="metric-label">Unmapped retained</span><data className="metric-value ok">YES</data><span className="metric-foot">available in OCSF unmapped</span></div></div> : null}
    </div>
  );
}
