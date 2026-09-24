"use client";

import { Bot, Braces, CheckCircle2, Database, RefreshCw, Workflow } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const stages = [
  { name: "Ingest", icon: Database, throughput: "8.4k/min", health: 99, note: "5 active connectors" },
  { name: "Normalize", icon: Braces, throughput: "7.9k/min", health: 97, note: "18 schemas mapped" },
  { name: "Verify", icon: Bot, throughput: "6.2k/min", health: 94, note: "3 models online" },
  { name: "Index", icon: CheckCircle2, throughput: "5.8k/min", health: 99, note: "Search lag 11 s" },
] as const;

export function PipelineWorkspace() {
  const [retrying, setRetrying] = useState(false);
  function retry() { setRetrying(true); window.setTimeout(() => setRetrying(false), 1600); }
  return <><PageHeader eyebrow="Platform observability" title="Pipeline health" description="Track every stage from raw ingestion to verified, structured and searchable weather intelligence." icon={Workflow} actions={<Button variant="outline" onClick={retry} disabled={retrying}><RefreshCw data-icon="inline-start" className={retrying ? "translation-spinner" : ""} />{retrying ? "Retrying…" : "Retry failed jobs"}</Button>} /><div className="summary-strip"><span><strong>99.7%</strong>platform uptime</span><span><strong>8.4k/min</strong>ingestion rate</span><span><strong>42 s</strong>end-to-end lag</span><span><strong>12</strong>jobs queued</span></div><div className="stage-grid">{stages.map(({ name, icon: Icon, throughput, health, note }, index) => <Card key={name}><CardHeader><span className="stage-icon"><Icon /></span><Badge variant={health < 95 ? "outline" : "secondary"}>{health}% healthy</Badge></CardHeader><CardContent><span className="stage-number">0{index + 1}</span><h2>{name}</h2><p>{note}</p><div className="confidence-line"><span>Throughput</span><strong>{throughput}</strong></div><Progress value={health} /></CardContent></Card>)}</div><Card><CardHeader className="border-b"><CardTitle>Recent pipeline exceptions</CardTitle><CardDescription>Recoverable events retained for replay · no data loss detected</CardDescription></CardHeader><CardContent className="table-card-content"><Table><TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Stage</TableHead><TableHead>Reason</TableHead><TableHead>Age</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>JOB-88217</TableCell><TableCell>Normalize</TableCell><TableCell>Missing citizen GPS field</TableCell><TableCell>4 min</TableCell><TableCell><Badge variant="outline">queued</Badge></TableCell></TableRow><TableRow><TableCell>JOB-88203</TableCell><TableCell>Verify</TableCell><TableCell>Media fingerprint timeout</TableCell><TableCell>9 min</TableCell><TableCell><Badge variant="secondary">retrying</Badge></TableCell></TableRow><TableRow><TableCell>JOB-88194</TableCell><TableCell>Ingest</TableCell><TableCell>Public feed rate limited</TableCell><TableCell>14 min</TableCell><TableCell><Badge variant="outline">backoff</Badge></TableCell></TableRow></TableBody></Table></CardContent></Card></>;
}
