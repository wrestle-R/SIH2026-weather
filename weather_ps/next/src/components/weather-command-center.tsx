"use client";

import Link from "next/link";
import { ArrowRight, Bot, CloudLightning, Database, FileSearch, Map, RadioTower, ShieldCheck, Siren, Sparkles } from "lucide-react";
import { useState } from "react";
import { IndiaWeatherMap } from "@/components/india-weather-map";
import { PageHeader } from "@/components/page-header";
import { ReportsTrendChart } from "@/components/reports-trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardLanguage } from "@/hooks/use-dashboard-language";
import { sources, weatherEvents } from "@/lib/weather-data";

const metrics = [
  { label: "Active events", value: "47", note: "8 critical across 18 states", icon: CloudLightning, tone: "orange" },
  { label: "Reports today", value: "18,429", note: "+12.4% from yesterday", icon: RadioTower, tone: "cyan" },
  { label: "Reports checked", value: "94.2%", note: "17,360 reports reviewed", icon: ShieldCheck, tone: "green" },
  { label: "Repeat reports grouped", value: "3,841", note: "20.8% repeats removed", icon: FileSearch, tone: "amber" },
] as const;

export function WeatherCommandCenter() {
  const [selectedId, setSelectedId] = useState(weatherEvents[0].id);
  const { t } = useDashboardLanguage();
  const selected = weatherEvents.find((event) => event.id === selectedId) ?? weatherEvents[0];

  return (
    <>
      <PageHeader eyebrow={t("National weather desk")} title={t("Clear weather updates for faster action.")} description={t("See checked weather reports, risks, source status, and alerts across India in one place.")} icon={Sparkles} actions={<><Button nativeButton={false} variant="outline" render={<Link href="/verification" />}><ShieldCheck data-icon="inline-start" />Check reports</Button><Button nativeButton={false} render={<Link href="/events" />}><Map data-icon="inline-start" />Open weather map</Button></>} />

      <section className="metrics-grid" aria-label="National summary">
        {metrics.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="metric-card" key={label}>
            <div className="metric-top"><span>{t(label)}</span><span className={`metric-icon ${tone}`}><Icon size={15} /></span></div>
            <div className="metric-value"><strong>{value}</strong></div><p>{t(note)}</p>
          </article>
        ))}
      </section>

      <section className="overview-grid">
        <Card className="map-card">
          <CardHeader className="border-b"><CardTitle>{t("Weather situation now")}</CardTitle><CardDescription>{t("Reports checked using official, sensor, and public information")}</CardDescription><CardAction><Badge variant="secondary"><span className="live-dot" />6 on map</Badge></CardAction></CardHeader>
          <CardContent className="map-card-content"><IndiaWeatherMap events={weatherEvents} selectedId={selectedId} onSelect={setSelectedId} t={t} /></CardContent>
        </Card>
        <div className="overview-stack">
          <Card>
            <CardHeader><CardTitle>{selected.type} · {selected.city}</CardTitle><CardDescription>{selected.state} · {selected.time}</CardDescription><CardAction><Badge variant={selected.severity === "critical" ? "destructive" : "secondary"}>{selected.severity}</Badge></CardAction></CardHeader>
            <CardContent className="selected-brief"><p>{selected.summary}</p><div className="confidence-line"><span>Trust score</span><strong>{selected.confidence}%</strong></div><Progress value={selected.confidence} /><div className="evidence-pills">{selected.evidence.map((item) => <Badge variant="outline" key={item}>{item}</Badge>)}</div><Button nativeButton={false} className="full-button" render={<Link href="/events" />}>View report <ArrowRight data-icon="inline-end" /></Button></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("Needs attention")}</CardTitle><CardDescription>3 reports need a decision</CardDescription></CardHeader>
            <CardContent className="attention-list">
              <Link href="/verification"><span className="attention-icon"><Bot /></span><span><strong>Possible changed image or video</strong><small>Puri, Odisha · trust score 21%</small></span><ArrowRight /></Link>
              <Link href="/alerts"><span className="attention-icon alert"><Siren /></span><span><strong>2 alerts ready to publish</strong><small>Assam and Maharashtra</small></span><ArrowRight /></Link>
              <Link href="/sources"><span className="attention-icon source"><Database /></span><span><strong>Public reports need checking</strong><small>87% source health</small></span><ArrowRight /></Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="overview-lower-grid">
        <Card><CardHeader className="border-b"><CardTitle>{t("Report trend")}</CardTitle><CardDescription>Reports received and reports checked · last 12 hours</CardDescription></CardHeader><CardContent className="overview-chart"><ReportsTrendChart /></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("Source status")}</CardTitle><CardDescription>{sources.length} sources sending updates now</CardDescription></CardHeader><CardContent className="compact-source-list">{sources.map((source) => <div key={source.name}><span><i className={source.health < 90 ? "warn" : ""} /><strong>{source.name}</strong></span><b>{source.health}%</b></div>)}<Button nativeButton={false} variant="outline" className="full-button" render={<Link href="/sources" />}>View sources <ArrowRight data-icon="inline-end" /></Button></CardContent></Card>
      </section>
    </>
  );
}
