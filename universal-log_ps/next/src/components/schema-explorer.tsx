"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui";

const classes = [
  { uid: 4001, name: "Network Activity", category: "Network Activity", description: "Connections and perimeter traffic with shared source, destination, protocol, direction, action and status fields.", fields: ["time", "activity_id", "src_endpoint", "dst_endpoint", "connection_info", "action", "status_id"] },
  { uid: 2004, name: "Detection Finding", category: "Findings", description: "Security-tool detections and alerts, including IDS signatures and vendor threat classifications.", fields: ["time", "finding_info", "severity_id", "status_id", "device", "message"] },
  { uid: 0, name: "Evidence Envelope", category: "ULPF extension", description: "Lossless source evidence and mapping lineage retained beside the canonical OCSF event.", fields: ["raw_data", "unmapped", "evidence.sha256", "evidence.data", "lineage[]"] },
  { uid: 19, name: "Record Integrity", category: "OCSF 1.9 profile", description: "Cryptographic fingerprint and predecessor reference for tamper-evident event chains.", fields: ["attestation_list", "fingerprint", "authority_uid", "chain_uid", "prev_event"] },
];

export function SchemaExplorer() {
  const [selectedUid, setSelectedUid] = useState(4001);
  const selected = classes.find((item) => item.uid === selectedUid) ?? classes[0];
  return <div className="page">
    <PageHeader code="05 / SCHEMA" title="Normalize meaning." description="OCSF provides the shared security language. ULPF adds exact evidence and field-level traceability around it." />
    <div className="schema-tree">
      <nav className="schema-nav" aria-label="Schema classes">{classes.map((item) => <button key={item.name} className={selected.name === item.name ? "schema-node active" : "schema-node"} onClick={() => setSelectedUid(item.uid)}><span>{item.name}</span><small>{item.uid || "ULPF"}</small></button>)}</nav>
      <section className="schema-content"><div className="schema-intro"><span className="section-code">{selected.category.toUpperCase()} / {selected.uid || "EXT"}</span><h2>{selected.name}</h2><p>{selected.description}</p></div><div style={{ padding: 20 }}><h3 className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>CORE ATTRIBUTES</h3><div className="mapping-grid">{selected.fields.map((field) => <div className="mapping-col" key={field}><h3>FIELD</h3><code>{field}</code></div>)}</div></div></section>
    </div>
    <div className="mapping-grid" style={{ marginTop: 20, border: "1px solid var(--line)" }}><div className="mapping-col"><h3>01 / SOURCE</h3><code>src / srcip / source.ip</code><code>dst / dstip / destination.ip</code><code>sev / level / alert.severity</code></div><div className="mapping-col"><h3>02 / OCSF CANONICAL</h3><code>src_endpoint.ip</code><code>dst_endpoint.ip</code><code>severity_id</code></div><div className="mapping-col"><h3>03 / ECS EXPORT</h3><code>source.ip</code><code>destination.ip</code><code>event.severity</code></div></div>
    <p className="helper" style={{ marginTop: 12 }}>This milestone implements the OCSF fields needed by the included perimeter scenarios. It does not claim complete coverage of every OCSF event class.</p>
  </div>;
}
