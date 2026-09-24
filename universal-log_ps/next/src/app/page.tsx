import Link from "next/link";
import { ArrowRightIcon, CheckIcon, FlaskIcon } from "@phosphor-icons/react/dist/ssr";
import { PageHeader, Panel, Severity } from "@/components/ui";

const bars = [32, 44, 37, 58, 47, 64, 52, 77, 61, 69, 86, 72, 91, 68, 79, 95, 81, 74, 88, 67, 76, 93, 84, 72];
const demoEvents = [
  { time: "10:18:20", source: "ids-north-01", event: "Possible SMB exploit attempt", severity: "Critical", action: "BLOCKED" },
  { time: "10:16:41", source: "edge-fw-02", event: "Inbound SSH attempt", severity: "High", action: "BLOCKED" },
  { time: "10:15:03", source: "ASA / VPN", event: "Remote access authentication", severity: "High", action: "DENIED" },
  { time: "10:14:12", source: "PA-EDGE-01", event: "Command and control endpoint", severity: "Critical", action: "BLOCKED" },
];

export default function CommandPage() {
  return (
    <div className="page">
      <PageHeader code="01 / COMMAND" title="One event language." description="Lossless perimeter telemetry normalization with source lineage, portable exports and locally verifiable evidence." action={<Link className="button primary" href="/lab"><FlaskIcon size={15} /> RUN LIVE DEMO</Link>} />

      <div className="grid metrics-grid" aria-label="Demo dataset metrics">
        <div className="metric"><span className="metric-label">Demo events processed</span><data className="metric-value">12,847</data><span className="metric-foot"><strong>100%</strong> raw evidence retained</span></div>
        <div className="metric"><span className="metric-label">Normalization success</span><data className="metric-value">99.62%</data><span className="metric-foot">12,798 / 12,847 sample events</span></div>
        <div className="metric"><span className="metric-label">Format coverage</span><data className="metric-value">07</data><span className="metric-foot">CEF / LEEF / SYSLOG / +4</span></div>
        <div className="metric"><span className="metric-label">Integrity state</span><data className="metric-value ok">VALID</data><span className="metric-foot">SHA-256 chain / OCSF 1.9</span></div>
      </div>

      <Panel code="PIPE-01" title="Reference processing path" className="panel-padded" action={<span className="demo-flag">DETERMINISTIC / LOCAL</span>}>
        <div className="pipeline">
          {["Ingest", "Detect", "Parse", "Normalize", "Attest", "Export"].map((step, index) => <div className="pipeline-step" key={step}><span>0{index + 1}</span><b>{step}</b><small>{index === 0 ? "BYTES SEALED" : index === 5 ? "4 TARGETS" : "READY"}</small></div>)}
        </div>
      </Panel>

      <div className="grid content-grid">
        <Panel code="TLM-07" title="Sample event throughput" action={<span className="demo-flag">DEMO DATASET / 24 MIN</span>}>
          <div className="telemetry-chart" aria-label="Sample throughput bar chart">
            {bars.map((height, index) => <span key={index} className="chart-bar" style={{ "--bar": `${height}%`, "--alpha": String(.38 + index / 42) } as React.CSSProperties} />)}
          </div>
          <div className="format-list">
            {[['CEF','31%'],['JSON','24%'],['SYSLOG','22%'],['OTHER','23%']].map(([format, share]) => <div className="format-item" key={format}><b>{share}</b><span>{format}</span></div>)}
          </div>
        </Panel>
        <Panel code="REQ-11" title="SIH requirement coverage" action={<span className="demo-flag">MILESTONE 01</span>}>
          <div className="coverage-list">
            {["Raw preservation", "Universal taxonomy", "Source traceability", "Config onboarding", "SIEM exports", "Air-gap runtime"].map((item, index) => <div className="coverage-row" key={item}><b><CheckIcon weight="bold" /></b><span>{item}</span><small>{index < 4 ? "WORKING" : "READY"}</small></div>)}
          </div>
        </Panel>
      </div>

      <Panel code="EVT-04" title="Recent normalized events" className="panel-padded" action={<Link href="/events" className="button small">OPEN EXPLORER <ArrowRightIcon /></Link>}>
        <div style={{ overflowX: "auto" }}><table className="data-table"><thead><tr><th>Time (UTC)</th><th>Source</th><th>Normalized event</th><th>Severity</th><th>Action</th></tr></thead><tbody>{demoEvents.map((event) => <tr key={`${event.time}-${event.source}`}><td className="muted">{event.time}</td><td>{event.source}</td><td>{event.event}</td><td><Severity value={event.severity} /></td><td className="accent">{event.action}</td></tr>)}</tbody></table></div>
      </Panel>
      <p className="helper" style={{ marginTop: 12 }}>All counts on this page are explicitly seeded demonstration data. No production throughput claim is implied.</p>
    </div>
  );
}
