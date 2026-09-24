"use client";

import { CheckCircle2, Database, RefreshCw, Satellite, Users } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sources } from "@/lib/weather-data";

export function SourcesWorkspace() {
  const [enabled, setEnabled] = useState(() => new Set(sources.map((source) => source.name)));
  const [tested, setTested] = useState<string | null>(null);
  const official = sources.filter((source) => source.tone === "official");
  const community = sources.filter((source) => source.tone === "community");
  function rows(items: typeof sources[number][]) { return <Table><TableHeader><TableRow><TableHead>Connector</TableHead><TableHead>Coverage</TableHead><TableHead>Health</TableHead><TableHead>Last sync</TableHead><TableHead className="text-right">Enabled</TableHead></TableRow></TableHeader><TableBody>{items.map((source, index) => <TableRow key={source.name}><TableCell><div className="table-source"><span>{source.tone === "official" ? <Satellite /> : <Users />}</span><strong>{source.name}</strong></div></TableCell><TableCell>{source.detail}</TableCell><TableCell><Badge variant={source.health < 90 ? "destructive" : "secondary"}>{source.health}%</Badge></TableCell><TableCell>{index * 11 + 8}s ago</TableCell><TableCell className="text-right"><Switch checked={enabled.has(source.name)} aria-label={`Toggle ${source.name}`} onCheckedChange={(checked) => setEnabled((current) => { const next = new Set(current); if (checked) next.add(source.name); else next.delete(source.name); return next; })} /></TableCell></TableRow>)}</TableBody></Table>; }
  return <><PageHeader eyebrow="Ingestion control" title="Source registry" description="Monitor official feeds, sensor networks and public-signal connectors feeding the national weather graph." icon={Database} actions={<Button variant="outline" onClick={() => { setTested("all"); window.setTimeout(() => setTested(null), 1800); }}>{tested ? <CheckCircle2 data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}{tested ? "Connections healthy" : "Test all connectors"}</Button>} /><div className="summary-strip"><span><strong>{enabled.size}/{sources.length}</strong>connectors enabled</span><span><strong>8.4k</strong>reports/min</span><span><strong>99.1%</strong>official uptime</span><span><strong>42 s</strong>total lag</span></div><Card><CardHeader className="border-b"><CardTitle>Registered data sources</CardTitle><CardDescription>Disable a connector to exclude new records without deleting its history.</CardDescription></CardHeader><CardContent className="table-card-content"><Tabs defaultValue="official"><TabsList><TabsTrigger value="official">Official ({official.length})</TabsTrigger><TabsTrigger value="community">Community ({community.length})</TabsTrigger></TabsList><TabsContent value="official">{rows(official)}</TabsContent><TabsContent value="community">{rows(community)}</TabsContent></Tabs></CardContent></Card></>;
}
