"use client";

import { LocateFixed, RadioTower, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { IndiaWeatherMap } from "@/components/india-weather-map";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardLanguage } from "@/hooks/use-dashboard-language";
import { hazardColors, weatherEvents, type EventType } from "@/lib/weather-data";
import { cn } from "@/lib/utils";

export function EventsWorkspace() {
  const [selectedId, setSelectedId] = useState(weatherEvents[0].id);
  const [query, setQuery] = useState("");
  const [hazard, setHazard] = useState<"All" | EventType>("All");
  const { t } = useDashboardLanguage();
  const events = useMemo(() => weatherEvents.filter((event) => (hazard === "All" || event.type === hazard) && `${event.city} ${event.state} ${event.type}`.toLowerCase().includes(query.toLowerCase())), [hazard, query]);
  const selected = events.find((event) => event.id === selectedId) ?? events[0];

  return (
    <>
      <PageHeader eyebrow="Live updates" title="Weather reports" description="Find weather reports by place or type, then check the details behind each one." icon={RadioTower} />
      <div className="summary-strip"><span><strong>{events.length}</strong>visible events</span><span><strong>18</strong>states reporting</span><span><strong>94.2%</strong>average confidence</span><span><strong>42 s</strong>ingestion latency</span></div>
      <Card className="event-workspace">
        <CardHeader className="border-b"><CardTitle>Weather map</CardTitle><CardDescription>Each marker shows a group of matching reports</CardDescription></CardHeader>
        <div className="workspace-filters">
          <label className="search-control"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, state or hazard" aria-label="Search events" /></label>
          <Select value={hazard} onValueChange={(value) => setHazard(value as "All" | EventType)}><SelectTrigger className="filter-select"><SelectValue /></SelectTrigger><SelectContent>{["All", "Flood", "Heavy rain", "Thunderstorm", "Heatwave", "Fog", "Strong wind"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
        </div>
        <CardContent className="event-workspace-grid">
          <IndiaWeatherMap events={events} selectedId={selected?.id ?? ""} onSelect={setSelectedId} t={t} />
          <div className="event-stream" aria-label="Event results">
            {events.length ? events.map((event) => <button type="button" key={event.id} onClick={() => setSelectedId(event.id)} className={cn("stream-item", selected?.id === event.id && "active")}><i style={{ background: hazardColors[event.type] }} /><span><span className="stream-top"><strong>{event.type}</strong><Badge variant={event.severity === "critical" ? "destructive" : "secondary"}>{event.severity}</Badge></span><b>{event.city}, {event.state}</b><small>{event.sourceDetail} · {event.time}</small><span className="stream-confidence"><ShieldCheck />{event.confidence}% verified</span></span></button>) : <div className="empty-results"><LocateFixed /><strong>No matching events</strong><span>Adjust the search or hazard filter.</span></div>}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
