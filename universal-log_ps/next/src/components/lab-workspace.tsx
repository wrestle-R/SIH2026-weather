"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileCode2, FileUp, FlaskConical, LockKeyhole, ShieldAlert, UploadCloud } from "lucide-react";
import { useAppState } from "@/components/app-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { downloadJson, normalizeRemote, sha256Text } from "@/lib/client-utils";
import { DEFAULT_SAMPLE, LOG_SAMPLES } from "@/lib/samples";
import type { LogFormat, NormalizationBatch } from "@/lib/types";

type ResultTab = "ocsf" | "ecs" | "original" | "lineage" | "integrity";
const formats: LogFormat[] = ["auto", "cef", "leef", "syslog", "json", "xml", "csv", "kv"];

export function LabWorkspace() {
  const { addBatch } = useAppState();
  const [text, setText] = useState(DEFAULT_SAMPLE.content);
  const [format, setFormat] = useState<LogFormat>("auto");
  const [sampleId, setSampleId] = useState(DEFAULT_SAMPLE.id);
  const [batch, setBatch] = useState<NormalizationBatch | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tab, setTab] = useState<ResultTab>("ocsf");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [verification, setVerification] = useState<"idle" | "valid" | "tampered">("idle");
  const [simulatedTamper, setSimulatedTamper] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  const selected = batch?.events[selectedIndex];
  const output = useMemo(() => {
    if (!selected) return "Your normalized record will appear here.";
    if (tab === "ocsf") return JSON.stringify(selected.ocsf, null, 2);
    if (tab === "ecs") return JSON.stringify(selected.ecs, null, 2);
    if (tab === "original") return simulatedTamper ? `${selected.evidence.text}\n[tamper_test=true]` : selected.evidence.text;
    return "";
  }, [selected, simulatedTamper, tab]);

  function chooseSample(id: string) {
    const sample = LOG_SAMPLES.find(item => item.id === id) ?? DEFAULT_SAMPLE;
    setSampleId(sample.id); setText(sample.content); setFormat("auto"); setBatch(null); setError(""); setVerification("idle"); setSimulatedTamper(false);
  }

  async function runNormalization() {
    setBusy(true); setError(""); setVerification("idle"); setSimulatedTamper(false);
    try {
      const result = await normalizeRemote({ text, format, sourceId: LOG_SAMPLES.find(item => item.id === sampleId)?.id ?? "interactive-input" });
      setBatch(result); setSelectedIndex(0); setTab("ocsf"); addBatch(result);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Normalization failed."); }
    finally { setBusy(false); }
  }

  async function upload(file: File) {
    setBusy(true); setError(""); setBatch(null);
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
    setVerification(await sha256Text(candidate) === selected.evidence.sha256 ? "valid" : "tampered");
    setTab("integrity");
  }

  return (
    <div className="page lab-page">
      <div className="modern-page-header"><div><Badge variant="secondary"><FlaskConical data-icon="inline-start" /> Hands-on workspace</Badge><h1>Parser Lab</h1><p>Upload a device log or paste raw evidence. ULPF detects the format, normalizes it, and keeps every original byte.</p></div></div>

      <div className="lab-layout">
        <div className="lab-input-column">
          <Card>
            <CardHeader><div><CardTitle>Upload log evidence</CardTitle><CardDescription>Best for proving byte-for-byte preservation.</CardDescription></div><Badge variant="outline">Max 1 MB</Badge></CardHeader>
            <CardContent>
              <button className={dragging ? "upload-zone dragging" : "upload-zone"} onClick={() => uploadRef.current?.click()} onDragOver={event => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) void upload(file); }}>
                <span className="upload-icon"><UploadCloud /></span><b>{busy ? "Processing evidence…" : "Drop a log file here"}</b><small>or click to choose .log, .txt, .json, .xml, or .csv</small><span className="choose-file">Choose file</span>
              </button>
              <input ref={uploadRef} hidden type="file" accept=".log,.txt,.json,.xml,.csv" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><div><CardTitle>Or paste an event</CardTitle><CardDescription>Start from a bundled fixture or edit the raw text.</CardDescription></div></CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="form-row">
                  <Field><FieldLabel>Evidence fixture</FieldLabel><Select value={sampleId} onValueChange={value => value && chooseSample(value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{sampleId === "uploaded" ? <SelectItem value="uploaded">Uploaded evidence</SelectItem> : null}{LOG_SAMPLES.map(sample => <SelectItem value={sample.id} key={sample.id}>{sample.label}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
                  <Field><FieldLabel>Format override</FieldLabel><Select value={format} onValueChange={value => value && setFormat(value as LogFormat)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{formats.map(item => <SelectItem value={item} key={item}>{item === "auto" ? "Auto-detect" : item.toUpperCase()}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
                </div>
                <Field><FieldLabel htmlFor="raw-log">Original event text</FieldLabel><Textarea id="raw-log" className="raw-textarea" spellCheck={false} value={text} onChange={event => { setText(event.target.value); setBatch(null); }} /><FieldDescription>Text is Base64-wrapped before transport. File upload mode hashes the exact bytes.</FieldDescription></Field>
              </FieldGroup>
              {error ? <Alert variant="destructive" className="mt-4"><AlertCircle /><AlertTitle>Normalization failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
              <div className="form-actions"><Button size="lg" disabled={busy || !text.trim()} onClick={() => void runNormalization()}><FlaskConical data-icon="inline-start" /> {busy ? "Processing…" : "Normalize event"}</Button><Button size="lg" variant="outline" disabled={!selected} onClick={() => { setSimulatedTamper(value => !value); setVerification("idle"); setTab("original"); }}><ShieldAlert data-icon="inline-start" /> {simulatedTamper ? "Restore evidence" : "Simulate tamper"}</Button></div>
            </CardContent>
          </Card>

          <Card size="sm" className="sample-downloads"><CardHeader><CardTitle>Download sample files</CardTitle><CardDescription>Use these to rehearse the upload flow.</CardDescription></CardHeader><CardContent>{[{name:"Palo Alto CEF",file:"palo-alto-cef.log"},{name:"Suricata EVE",file:"suricata-eve.json"},{name:"FortiGate KV",file:"fortigate-kv.log"},{name:"Firewall CSV",file:"firewall-events.csv"}].map(item => <Link className={buttonVariants({ variant: "ghost" })} key={item.file} href={`/samples/${item.file}`} download><FileCode2 data-icon="inline-start" />{item.name}<Download data-icon="inline-end" /></Link>)}</CardContent></Card>
        </div>

        <Card className="result-card">
          <CardHeader><div><CardTitle>Normalized output</CardTitle><CardDescription>{batch ? `${batch.parser.id} · ${batch.stats.eventCount} record${batch.stats.eventCount === 1 ? "" : "s"}` : "Waiting for evidence"}</CardDescription></div>{batch ? <Badge className="success-badge">{batch.detectedFormat.toUpperCase()} · {Math.round(batch.detectionConfidence * 100)}%</Badge> : <Badge variant="secondary">Ready</Badge>}</CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={value => setTab(value as ResultTab)}>
              <TabsList variant="line" className="result-tabs">{(["ocsf","ecs","original","lineage","integrity"] as ResultTab[]).map(item => <TabsTrigger value={item} key={item}>{item}</TabsTrigger>)}</TabsList>
              {batch && batch.events.length > 1 ? <Field className="batch-select"><FieldLabel>Batch record</FieldLabel><Select value={String(selectedIndex)} onValueChange={value => value && setSelectedIndex(Number(value))}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{batch.events.map((event,index) => <SelectItem key={event.uid} value={String(index)}>Event {index + 1}: {event.ocsf.message}</SelectItem>)}</SelectGroup></SelectContent></Select></Field> : null}
              {(["ocsf","ecs","original"] as ResultTab[]).map(item => <TabsContent value={item} key={item}><pre className="code-block">{output}</pre></TabsContent>)}
              <TabsContent value="lineage"><div className="lineage-list">{selected ? selected.lineage.map((line,index) => <div className="lineage-row" key={`${line.sourcePath}-${line.targetPath}-${index}`}><code>{line.sourcePath}</code><span>→</span><code>{line.targetPath}</code><small>{line.transform}</small></div>) : <EmptyResult />}</div></TabsContent>
              <TabsContent value="integrity"><div className="integrity-panel">{verification === "valid" ? <Alert className="success-alert"><CheckCircle2 /><AlertTitle>Evidence verified</AlertTitle><AlertDescription>SHA-256 matches the preserved bytes.</AlertDescription></Alert> : verification === "tampered" ? <Alert variant="destructive"><ShieldAlert /><AlertTitle>Tamper detected</AlertTitle><AlertDescription>Current bytes do not match the attested fingerprint.</AlertDescription></Alert> : <Alert><LockKeyhole /><AlertTitle>Local integrity check</AlertTitle><AlertDescription>Recompute the evidence hash locally. This proves integrity, not signer authenticity.</AlertDescription></Alert>}{selected ? <div className="integrity-grid"><div><span>Raw SHA-256</span><code>{selected.evidence.sha256}</code></div><div><span>OCSF fingerprint</span><code>{selected.integrity.fingerprint}</code></div><div><span>Chain UID</span><code>{selected.integrity.chainUid}</code></div><div><span>Sequence / bytes</span><b>{selected.integrity.sequence} / {selected.evidence.byteLength} B</b></div></div> : null}<Button disabled={!selected} onClick={() => void verify()}><CheckCircle2 data-icon="inline-start" /> Verify evidence</Button></div></TabsContent>
            </Tabs>
            {selected ? <div className="result-footer"><Button variant="outline" onClick={() => downloadJson(`ulpf-${selected.uid}-${tab}.json`, tab === "ecs" ? selected.ecs : selected.ocsf)}><Download data-icon="inline-start" /> Download {tab === "ecs" ? "ECS" : "OCSF"}</Button><span>{selected.lineage.length} source-to-target mappings · {selected.evidence.byteLength} bytes retained</span></div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyResult() {
  return <div className="result-empty"><FileUp /><b>No output yet</b><span>Upload or normalize an event to inspect this view.</span></div>;
}
