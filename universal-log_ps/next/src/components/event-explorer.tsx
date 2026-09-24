"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { DownloadSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useAppState } from "@/components/app-state";
import { EmptyState, PageHeader, Severity } from "@/components/ui";
import { downloadJson, normalizeRemote } from "@/lib/client-utils";
import { LOG_SAMPLES } from "@/lib/samples";
import type { NormalizedEvent } from "@/lib/types";

export function EventExplorer() {
  const { events, hydrated, addBatch, clearEvents } = useAppState();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [format, setFormat] = useState("all");
  const [selectedUid, setSelectedUid] = useState<string>();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const deferredQuery = useDeferredValue(query.toLowerCase());

  const filtered = useMemo(() => events.filter((event) => {
    const matchesQuery = !deferredQuery || `${event.ocsf.message} ${event.sourceId} ${event.ocsf.src_endpoint?.ip ?? ""} ${event.ocsf.dst_endpoint?.ip ?? ""}`.toLowerCase().includes(deferredQuery);
    const matchesSeverity = severity === "all" || event.ocsf.severity.toLowerCase() === severity;
    return matchesQuery && matchesSeverity && (format === "all" || event.format === format);
  }), [events, deferredQuery, severity, format]);
  const selected = events.find((event) => event.uid === selectedUid) ?? filtered[0];

  async function loadDemo() {
    setLoadingDemo(true);
    try {
      const results = await Promise.all(LOG_SAMPLES.slice(0, 5).map((sample) => normalizeRemote({ text: sample.content, sourceId: sample.id })));
      results.forEach(addBatch);
    } finally { setLoadingDemo(false); }
  }

  function exportEvents(kind: "ocsf" | "ecs" | "ndjson") {
    if (kind === "ndjson") {
      const body = filtered.map((event) => JSON.stringify(event.ocsf)).join("\n");
      downloadJson("ulpf-events.ndjson", body, "application/x-ndjson");
      return;
    }
    downloadJson(`ulpf-events-${kind}.json`, filtered.map((event) => event[kind]));
  }

  return (
    <div className="page">
      <PageHeader code="03 / EVENTS" title="One query surface." description="Investigate every normalized record through shared fields while retaining a direct path back to the original evidence." action={<button className="button primary" disabled={loadingDemo} onClick={() => void loadDemo()}>{loadingDemo ? "LOADING" : "LOAD DEMO DATA"}</button>} />
      <div className="toolbar">
        <div className="field"><label htmlFor="event-search">Search evidence</label><input id="event-search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="IP, device, action or message" /></div>
        <div className="field"><label htmlFor="severity-filter">Severity</label><select id="severity-filter" className="select" value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="all">ALL SEVERITIES</option>{["critical", "high", "medium", "low", "informational", "unknown"].map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select></div>
        <div className="field"><label htmlFor="format-filter">Format</label><select id="format-filter" className="select" value={format} onChange={(event) => setFormat(event.target.value)}><option value="all">ALL FORMATS</option>{["cef", "leef", "syslog", "json", "xml", "csv", "kv"].map((item) => <option value={item} key={item}>{item.toUpperCase()}</option>)}</select></div>
        <button className="button" disabled={!filtered.length} onClick={() => exportEvents("ndjson")}><DownloadSimpleIcon /> NDJSON</button>
        <button className="button danger" disabled={!events.length} onClick={clearEvents}><TrashIcon /> CLEAR</button>
      </div>
      {!hydrated ? <div className="route-loading"><span /><span /><span /><p>RESTORING LOCAL EVENT STORE</p></div> : !events.length ? <EmptyState title="No session events yet.">Load the bundled perimeter fixtures or normalize a record in Parser Lab. Events stay in this browser only.</EmptyState> : (
        <div className="event-layout">
          <section className="event-list" aria-label="Normalized events">
            <div className="panel-head"><span>{filtered.length} / {events.length} RECORDS</span><span>LOCAL SESSION</span></div>
            {filtered.map((event) => <EventRow event={event} selected={selected?.uid === event.uid} onSelect={() => setSelectedUid(event.uid)} key={event.uid} />)}
            {!filtered.length ? <EmptyState title="No events match.">Adjust the search or filters to widen the result set.</EmptyState> : null}
          </section>
          <aside className="event-detail">
            {selected ? <>
              <div className="detail-head"><Severity value={selected.ocsf.severity} /><h3>{selected.ocsf.message}</h3></div>
              <div className="detail-meta"><div><span>Event UID</span><b>{selected.uid}</b></div><div><span>OCSF class</span><b>{selected.ocsf.class_name} / {selected.ocsf.class_uid}</b></div><div><span>Source endpoint</span><b>{selected.ocsf.src_endpoint?.ip ?? "UNKNOWN"}:{selected.ocsf.src_endpoint?.port ?? "*"}</b></div><div><span>Destination endpoint</span><b>{selected.ocsf.dst_endpoint?.ip ?? "UNKNOWN"}:{selected.ocsf.dst_endpoint?.port ?? "*"}</b></div><div><span>Evidence hash</span><b>{selected.evidence.sha256.slice(0, 24)}…</b></div><div><span>Parser</span><b>{selected.parserId} / {selected.parserVersion}</b></div></div>
              <div className="tabs"><button className="tab active">OCSF RECORD</button><button className="tab" onClick={() => downloadJson(`${selected.uid}-ecs.json`, selected.ecs)}>EXPORT ECS</button></div>
              <pre className="code-block">{JSON.stringify(selected.ocsf, null, 2)}</pre>
            </> : <EmptyState title="Select an event.">Event evidence and normalized fields will appear here.</EmptyState>}
          </aside>
        </div>
      )}
      {filtered.length ? <div className="form-actions"><button className="button" onClick={() => exportEvents("ocsf")}>EXPORT OCSF JSON</button><button className="button" onClick={() => exportEvents("ecs")}>EXPORT ECS JSON</button></div> : null}
    </div>
  );
}

function EventRow({ event, selected, onSelect }: { event: NormalizedEvent; selected: boolean; onSelect: () => void }) {
  return <button className={selected ? "event-row selected" : "event-row"} onClick={onSelect}><span className="muted">{new Date(event.ocsf.time).toISOString().slice(11, 19)} UTC</span><span className="accent">{event.format.toUpperCase()}</span><span>{event.ocsf.message}</span><Severity value={event.ocsf.severity} /></button>;
}
