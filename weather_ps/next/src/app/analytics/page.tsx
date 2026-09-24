import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReportsTrendChart } from "@/components/reports-trend-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = { title: "Analytics" };

const regions = [["Assam", 38, "+18%"], ["Maharashtra", 31, "+9%"], ["West Bengal", 24, "+14%"], ["Rajasthan", 18, "−3%"], ["Uttar Pradesh", 16, "+4%"]] as const;
const hazards = [["Heavy rain", 34, "#2563eb"], ["Flood", 26, "#0ea5e9"], ["Thunderstorm", 18, "#8b5cf6"], ["Heatwave", 12, "#f97316"], ["Other", 10, "#64748b"]] as const;

export default function AnalyticsPage() {
  return <><PageHeader eyebrow="Operational intelligence" title="Weather analytics" description="Understand report velocity, regional concentration, verification coverage and dominant hazards." icon={BarChart3} /><div className="summary-strip"><span><strong>18,429</strong>reports today</span><span><strong>17,360</strong>verified</span><span><strong>3,841</strong>duplicates merged</span><span><strong>42 s</strong>median latency</span></div><div className="analytics-page-grid"><Card className="analytics-wide"><CardHeader className="border-b"><CardTitle>National report velocity</CardTitle><CardDescription>Incoming reports and verified events · hourly</CardDescription></CardHeader><CardContent className="large-chart"><ReportsTrendChart /></CardContent></Card><Card><CardHeader><CardTitle>Hazard mix</CardTitle><CardDescription>Share of active verified incidents</CardDescription></CardHeader><CardContent className="hazard-breakdown">{hazards.map(([name, value, color]) => <div key={name}><span><i style={{ background: color }} />{name}</span><strong>{value}%</strong><Progress value={value} /></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Regional intensity</CardTitle><CardDescription>Reports in the last 6 hours</CardDescription></CardHeader><CardContent className="regional-list">{regions.map(([name, value, change], index) => <div key={name}><span className="region-rank">0{index + 1}</span><span><strong>{name}</strong><small>{value} verified events</small></span><Badge variant={change.startsWith("+") ? "secondary" : "outline"}>{change}</Badge></div>)}</CardContent></Card><Card><CardHeader><CardTitle>Verification quality</CardTitle><CardDescription>AI pipeline performance today</CardDescription></CardHeader><CardContent className="quality-grid"><div><strong>94.2%</strong><span>auto-verified</span></div><div><strong>96.8%</strong><span>human agreement</span></div><div><strong>2.1%</strong><span>false-positive rate</span></div><div><strong>20.8%</strong><span>noise removed</span></div></CardContent></Card></div></>;
}
