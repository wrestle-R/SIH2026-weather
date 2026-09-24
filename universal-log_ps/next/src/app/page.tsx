import Link from "next/link";
import { ArrowRight, Check, CircleCheck, FileKey, FlaskConical, Play, ShieldCheck, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const demoEvents = [
  { time: "10:18:20", source: "ids-north-01", event: "Possible SMB exploit attempt", severity: "Critical", action: "BLOCKED" },
  { time: "10:16:41", source: "edge-fw-02", event: "Inbound SSH attempt", severity: "High", action: "BLOCKED" },
  { time: "10:15:03", source: "ASA / VPN", event: "Remote access authentication", severity: "High", action: "DENIED" },
  { time: "10:14:12", source: "PA-EDGE-01", event: "Command and control endpoint", severity: "Critical", action: "BLOCKED" },
];

export default function CommandPage() {
  return (
    <div className="page overview-page">
      <section className="hero-section">
        <div className="hero-copy">
          <Badge variant="outline" className="hero-badge"><span className="live-dot" /> SIH 2026 working prototype</Badge>
          <h1>Every log.<br /><span>One language.</span></h1>
          <p>ULPF turns fragmented perimeter-device logs into lossless, traceable OCSF records—ready for SIEMs, data lakes, and investigations.</p>
          <div className="hero-actions">
            <Link className={buttonVariants({ size: "lg" })} href="/demo"><Play data-icon="inline-start" fill="currentColor" /> Watch live demo</Link>
            <Link className={buttonVariants({ size: "lg", variant: "outline" })} href="/lab"><FlaskConical data-icon="inline-start" /> Open parser lab</Link>
          </div>
          <div className="hero-proof"><span><Check /> Exact bytes preserved</span><span><Check /> Runs offline</span><span><Check /> OCSF 1.9</span></div>
        </div>
        <Card className="hero-console">
          <CardHeader><div><CardTitle>Live transformation</CardTitle><CardDescription>FortiGate · key-value traffic log</CardDescription></div><Badge className="success-badge">Verified</Badge></CardHeader>
          <CardContent>
            <div className="console-source"><span>Original event</span><code>srcip=10.12.4.81 dstip=192.0.2.90<br />action=&quot;deny&quot; level=&quot;warning&quot;</code></div>
            <div className="transform-line"><span /><Workflow /><span /></div>
            <div className="console-output"><span>OCSF Network Activity</span><dl><div><dt>Source IP</dt><dd>10.12.4.81</dd></div><div><dt>Destination</dt><dd>192.0.2.90:53</dd></div><div><dt>Action</dt><dd>Denied</dd></div><div><dt>Integrity</dt><dd className="verified"><ShieldCheck /> SHA-256 valid</dd></div></dl></div>
          </CardContent>
        </Card>
      </section>

      <section className="metric-row" aria-label="Prototype capabilities">
        {[{value:"7",label:"formats parsed",icon:FileKey},{value:"100%",label:"evidence retained",icon:ShieldCheck},{value:"2",label:"export schemas",icon:Workflow},{value:"0",label:"cloud dependencies",icon:CircleCheck}].map(({value,label,icon:Icon}) => <div className="modern-metric" key={label}><Icon /><div><strong>{value}</strong><span>{label}</span></div></div>)}
      </section>

      <div className="overview-grid">
        <Card>
          <CardHeader><div><CardTitle>How ULPF processes an event</CardTitle><CardDescription>One deterministic path from raw evidence to analytics-ready records.</CardDescription></div><Badge variant="secondary">Local pipeline</Badge></CardHeader>
          <CardContent className="process-list">
            {["Seal raw bytes", "Detect & parse", "Map to OCSF", "Attach lineage", "Verify integrity"].map((step,index) => <div className="process-step" key={step}><span>{index+1}</span><div><b>{step}</b><small>{["Base64 evidence + SHA-256", "Format confidence and warnings", "Network Activity or Detection Finding", "Every value points to its source", "Tamper-evident hash chain"][index]}</small></div>{index < 4 ? <ArrowRight /> : <Check />}</div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>SIH requirement coverage</CardTitle><CardDescription>Implemented in this working reference node.</CardDescription></div><span className="coverage-score">6/6</span></CardHeader>
          <CardContent>
            <Progress value={100} className="mb-5" />
            <div className="coverage-modern">{["Lossless ingestion", "Universal normalization", "Source traceability", "Plug-and-play onboarding", "SIEM-ready exports", "Air-gapped operation"].map(item => <span key={item}><Check />{item}</span>)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="events-card">
        <CardHeader><div><CardTitle>Example normalized events</CardTitle><CardDescription>Seeded demo data for the jury walkthrough.</CardDescription></div><Link className={buttonVariants({ variant: "outline" })} href="/events">Open explorer <ArrowRight data-icon="inline-end" /></Link></CardHeader>
        <CardContent><Table><TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Source</TableHead><TableHead>Normalized event</TableHead><TableHead>Severity</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>{demoEvents.map(event => <TableRow key={`${event.time}-${event.source}`}><TableCell className="muted">{event.time}</TableCell><TableCell>{event.source}</TableCell><TableCell className="font-medium">{event.event}</TableCell><TableCell><Badge variant={event.severity === "Critical" ? "destructive" : "secondary"}>{event.severity}</Badge></TableCell><TableCell><Badge variant="outline">{event.action}</Badge></TableCell></TableRow>)}</TableBody></Table></CardContent>
      </Card>
      <p className="demo-disclaimer">All event counts and records on this overview are seeded demo data; they are not production throughput claims.</p>
    </div>
  );
}
