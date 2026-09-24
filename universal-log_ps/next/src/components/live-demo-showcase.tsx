"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CirclePause, CirclePlay, FileInput, Fingerprint, FlaskConical, RefreshCw, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppState } from "@/components/app-state";
import { normalizeRemote } from "@/lib/client-utils";
import { LOG_SAMPLES } from "@/lib/samples";
import type { NormalizationBatch } from "@/lib/types";

const SHOWCASE_IDS = ["palo-alto-cef", "suricata-eve", "rfc5424-syslog"];
const STAGES = ["Ingest", "Detect", "Parse", "Normalize", "Verify"];

export function LiveDemoShowcase() {
  const { addBatch } = useAppState();
  const samples = useMemo(() => SHOWCASE_IDS.map(id => LOG_SAMPLES.find(sample => sample.id === id)!).filter(Boolean), []);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [stage, setStage] = useState(0);
  const [batch, setBatch] = useState<NormalizationBatch | null>(null);
  const [playing, setPlaying] = useState(true);
  const [error, setError] = useState("");
  const sample = samples[sampleIndex];
  const event = batch?.events[0];

  const runSample = useCallback(async (index: number) => {
    const current = samples[index];
    setBatch(null); setStage(0); setError("");
    try {
      const result = await normalizeRemote({ text: current.content, format: "auto", sourceId: current.id });
      setBatch(result); addBatch(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The showcase could not process this sample.");
      setPlaying(false);
    }
  }, [addBatch, samples]);

  useEffect(() => {
    const timer = window.setTimeout(() => void runSample(sampleIndex), 0);
    return () => window.clearTimeout(timer);
  }, [runSample, sampleIndex]);
  useEffect(() => {
    if (!playing || !batch) return;
    if (stage < STAGES.length - 1) {
      const timer = window.setTimeout(() => setStage(value => value + 1), 650);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setSampleIndex(value => (value + 1) % samples.length), 5000);
    return () => window.clearTimeout(timer);
  }, [batch, playing, samples.length, stage]);

  return (
    <div className="page demo-page">
      <div className="modern-page-header">
        <div><Badge variant="secondary"><Sparkles data-icon="inline-start" /> Automatic demo</Badge><h1>See one log become clear.</h1><p>No clicks needed. ULPF processes real example data using the same system as Try a log.</p></div>
        <div className="header-actions"><Button variant="outline" onClick={() => setPlaying(value => !value)}>{playing ? <CirclePause data-icon="inline-start" /> : <CirclePlay data-icon="inline-start" />}{playing ? "Pause" : "Resume"}</Button><Link className={buttonVariants()} href="/lab"><FlaskConical data-icon="inline-start" /> Try a log</Link></div>
      </div>

      <Card className="showcase-card">
        <CardHeader>
          <div><div className="showcase-kicker">Now processing · {sample.vendor}</div><CardTitle>{sample.label}</CardTitle><CardDescription>{sample.description}</CardDescription></div>
          <Badge variant="outline">{sample.format.toUpperCase()}</Badge>
        </CardHeader>
        <CardContent>
          <div className="stage-track">
            {STAGES.map((label, index) => <div className={index <= stage ? "stage-item complete" : "stage-item"} key={label}><span>{index < stage ? <Check /> : index + 1}</span><b>{label}</b>{index < STAGES.length - 1 ? <i /> : null}</div>)}
          </div>
          <Progress value={((stage + 1) / STAGES.length) * 100} className="showcase-progress" />
          {error ? <Alert variant="destructive"><AlertTitle>Demo interrupted</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
          <div className="transformation-grid">
            <section className="raw-pane"><div className="pane-heading"><span><FileInput /> Original log</span><Badge variant="outline">{event?.evidence.byteLength ?? new TextEncoder().encode(sample.content).length} bytes</Badge></div><pre>{sample.content}</pre><footer>Saved exactly as received before reading it</footer></section>
            <div className="transform-arrow"><WandSparkles /><ArrowRight /></div>
            <section className="normalized-pane"><div className="pane-heading"><span><ShieldCheck /> OCSF 1.9 record</span>{batch ? <Badge className="success-badge">{Math.round(batch.detectionConfidence * 100)}% detected</Badge> : <Badge variant="secondary">Processing…</Badge>}</div>
              {event && stage >= 2 ? <dl className="normalized-fields"><div><dt>Class</dt><dd>{event.ocsf.class_name}</dd></div><div><dt>Message</dt><dd>{event.ocsf.message}</dd></div><div><dt>Source</dt><dd>{event.ocsf.src_endpoint?.ip ?? "—"}:{event.ocsf.src_endpoint?.port ?? "—"}</dd></div><div><dt>Destination</dt><dd>{event.ocsf.dst_endpoint?.ip ?? "—"}:{event.ocsf.dst_endpoint?.port ?? "—"}</dd></div><div><dt>Action</dt><dd>{event.ocsf.action ?? event.ocsf.status}</dd></div><div><dt>Severity</dt><dd>{event.ocsf.severity}</dd></div></dl> : <div className="normalizing-placeholder"><RefreshCw className="spin" /><span>Detecting format and mapping fields…</span></div>}
            </section>
          </div>
          <div className="proof-strip"><span><Fingerprint /> <b>Evidence fingerprint</b> <code>{stage >= 4 && event ? `${event.evidence.sha256.slice(0, 22)}…` : "pending verification"}</code></span><span><ShieldCheck /> <b>Lineage</b> {stage >= 3 && event ? `${event.lineage.length} mapped fields` : "building…"}</span><span className={stage >= 4 ? "proof-valid" : ""}><Check /> {stage >= 4 ? "Integrity verified" : "Verification pending"}</span></div>
        </CardContent>
      </Card>

      <div className="sample-switcher" aria-label="Showcase samples">{samples.map((item,index) => <button className={index === sampleIndex ? "active" : ""} key={item.id} onClick={() => { setSampleIndex(index); setPlaying(false); }}><span>{String(index + 1).padStart(2,"0")}</span><div><b>{item.vendor}</b><small>{item.format.toUpperCase()}</small></div></button>)}</div>
          <Alert className="demo-note"><ShieldCheck /><AlertTitle>What this shows</AlertTitle><AlertDescription>Finding the format, reading it, creating OCSF fields, showing where fields came from, and SHA-256 checks all run locally. Go to Try a log to upload your own file and see every result view.</AlertDescription></Alert>
    </div>
  );
}
