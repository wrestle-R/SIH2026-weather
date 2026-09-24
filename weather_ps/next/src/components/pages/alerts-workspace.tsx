"use client";

import { BellRing, CheckCircle2, Eye, Send, Siren } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { weatherEvents } from "@/lib/weather-data";

export function AlertsWorkspace() {
  const [eventId, setEventId] = useState(weatherEvents[0].id);
  const [headline, setHeadline] = useState("Flash flood risk in low-lying parts of Guwahati");
  const [message, setMessage] = useState("Avoid the Bharalu basin and waterlogged roads. Follow district administration guidance and move to higher ground if instructed.");
  const [sms, setSms] = useState(true);
  const [app, setApp] = useState(true);
  const [preview, setPreview] = useState(false);
  const [queued, setQueued] = useState(false);
  const event = useMemo(() => weatherEvents.find((item) => item.id === eventId) ?? weatherEvents[0], [eventId]);

  return <><PageHeader eyebrow="Public warning desk" title="Alert centre" description="Turn verified incidents into clear, geo-targeted advisories with channel and language controls." icon={Siren} actions={<Badge variant="destructive"><BellRing />2 ready to publish</Badge>} /><div className="alert-layout"><Card><CardHeader><CardTitle>Compose advisory</CardTitle><CardDescription>Draft a CAP-ready message from a verified weather event.</CardDescription></CardHeader><CardContent><FieldGroup><Field><FieldLabel>Verified event</FieldLabel><Select value={eventId} onValueChange={(value) => { if (value) setEventId(value); }}><SelectTrigger className="wide-control"><SelectValue /></SelectTrigger><SelectContent>{weatherEvents.map((item) => <SelectItem value={item.id} key={item.id}>{item.type} · {item.city}, {item.state}</SelectItem>)}</SelectContent></Select><FieldDescription>{event.confidence}% verified · {event.sourceDetail}</FieldDescription></Field><Field><FieldLabel htmlFor="alert-headline">Alert headline</FieldLabel><Input id="alert-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} /></Field><Field><FieldLabel htmlFor="alert-message">Public instruction</FieldLabel><Textarea id="alert-message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /><FieldDescription>Keep it specific, local and action-oriented.</FieldDescription></Field><div className="channel-row"><Field orientation="horizontal"><FieldLabel htmlFor="channel-app">Mobile app & web</FieldLabel><Switch id="channel-app" checked={app} onCheckedChange={setApp} /></Field><Field orientation="horizontal"><FieldLabel htmlFor="channel-sms">SMS gateway</FieldLabel><Switch id="channel-sms" checked={sms} onCheckedChange={setSms} /></Field></div><div className="form-actions"><Button variant="outline" onClick={() => setPreview(true)}><Eye data-icon="inline-start" />Generate preview</Button><Button onClick={() => { setPreview(true); setQueued(true); }} disabled={!headline || !message || (!sms && !app)}><Send data-icon="inline-start" />Queue alert</Button></div>{queued ? <p className="success-message"><CheckCircle2 />Alert queued for supervisor approval.</p> : null}</FieldGroup></CardContent></Card><Card className="preview-card"><CardHeader><CardTitle>Citizen preview</CardTitle><CardDescription>English · Hindi and Marathi translations generated on publish</CardDescription></CardHeader><CardContent>{preview ? <div className="phone-preview"><div className="phone-top"><span>VARUNETRA ALERT</span><Badge variant="destructive">{event.severity}</Badge></div><strong>{headline}</strong><p>{message}</p><div><span>{event.city}, {event.state}</span><span>{event.time}</span></div><small>Source: verified national weather intelligence</small></div> : <div className="empty-preview"><Eye /><strong>Preview not generated</strong><span>Complete the draft and select Generate preview.</span></div>}</CardContent></Card></div></>;
}
