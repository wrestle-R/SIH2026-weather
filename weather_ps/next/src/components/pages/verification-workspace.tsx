"use client";

import { CheckCircle2, Flag, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reviewItems } from "@/lib/weather-data";

type Decision = "verified" | "flagged";

export function VerificationWorkspace() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const pending = reviewItems.filter((item) => !decisions[item.id]);
  const resolved = reviewItems.filter((item) => decisions[item.id]);

  function list(items: typeof reviewItems) {
    return <div className="verification-list">{items.length ? items.map((item) => <Card key={item.id}><CardHeader><CardTitle>{item.text}</CardTitle><CardDescription>{item.id} · {item.location} · {item.source}</CardDescription><div className="score-badge"><strong>{item.score}</strong><span>AI score</span></div></CardHeader><CardContent><div className="verification-signals">{item.signals.map((signal) => <Badge variant="outline" key={signal}>{signal}</Badge>)}</div><div className="confidence-line"><span>Verification confidence</span><strong>{item.score}%</strong></div><Progress value={item.score} /><div className="decision-actions">{decisions[item.id] ? <><Badge variant={decisions[item.id] === "verified" ? "secondary" : "destructive"}>{decisions[item.id]}</Badge><Button variant="ghost" onClick={() => setDecisions((current) => { const next = { ...current }; delete next[item.id]; return next; })}><RotateCcw data-icon="inline-start" />Undo</Button></> : <><Button variant="outline" onClick={() => setDecisions((current) => ({ ...current, [item.id]: "flagged" }))}><Flag data-icon="inline-start" />Flag misleading</Button><Button onClick={() => setDecisions((current) => ({ ...current, [item.id]: "verified" }))}><CheckCircle2 data-icon="inline-start" />Verify report</Button></>}</div></CardContent></Card>) : <div className="empty-panel"><CheckCircle2 /><strong>Queue cleared</strong><span>There are no reports in this view.</span></div>}</div>;
  }

  return <><PageHeader eyebrow="Human-in-the-loop" title="Verification queue" description="Resolve uncertain reports using provenance, media analysis, source history and nearby official observations." icon={ShieldCheck} actions={<Badge variant="secondary"><Sparkles />AI assisted</Badge>} /><div className="summary-strip"><span><strong>{pending.length}</strong>pending review</span><span><strong>38 s</strong>median handling</span><span><strong>96.8%</strong>review agreement</span><span><strong>142</strong>resolved today</span></div><Tabs defaultValue="pending" className="workspace-tabs"><TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger></TabsList><TabsContent value="pending">{list(pending)}</TabsContent><TabsContent value="resolved">{list(resolved)}</TabsContent></Tabs></>;
}
