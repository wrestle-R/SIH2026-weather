export type EventType =
  | "Flood"
  | "Heavy rain"
  | "Thunderstorm"
  | "Heatwave"
  | "Fog"
  | "Strong wind";

export type WeatherEvent = {
  id: string;
  type: EventType;
  city: string;
  state: string;
  time: string;
  coordinates: string;
  source: "IMD" | "Citizen" | "Social" | "News" | "Sensor";
  sourceDetail: string;
  confidence: number;
  severity: "critical" | "high" | "moderate";
  summary: string;
  evidence: string[];
  mapX: number;
  mapY: number;
};

export const weatherEvents: WeatherEvent[] = [
  {
    id: "WX-0924-01",
    type: "Flood",
    city: "Guwahati",
    state: "Assam",
    time: "2 min ago",
    coordinates: "26.1445° N, 91.7362° E",
    source: "Citizen",
    sourceDetail: "4 citizen reports + CWC gauge",
    confidence: 94,
    severity: "critical",
    summary:
      "Rapid waterlogging reported near Bharalu basin. Four independent visuals match rainfall and gauge telemetry.",
    evidence: ["Visual geolocation", "CWC gauge match", "4-source consensus"],
    mapX: 79,
    mapY: 36,
  },
  {
    id: "WX-0924-02",
    type: "Heavy rain",
    city: "Mumbai",
    state: "Maharashtra",
    time: "6 min ago",
    coordinates: "19.0760° N, 72.8777° E",
    source: "IMD",
    sourceDetail: "IMD district nowcast",
    confidence: 99,
    severity: "high",
    summary:
      "Intense rainfall cell moving northeast across Mumbai suburban district. Local disruption is likely.",
    evidence: ["Official bulletin", "Doppler radar", "AWS corroboration"],
    mapX: 34,
    mapY: 59,
  },
  {
    id: "WX-0924-03",
    type: "Thunderstorm",
    city: "Kolkata",
    state: "West Bengal",
    time: "11 min ago",
    coordinates: "22.5726° N, 88.3639° E",
    source: "Social",
    sourceDetail: "12 clustered social posts",
    confidence: 86,
    severity: "high",
    summary:
      "Dense lightning and gust reports clustered over east Kolkata, aligned with the satellite cloud-top signature.",
    evidence: ["Temporal cluster", "Media forensics", "Satellite match"],
    mapX: 70,
    mapY: 52,
  },
  {
    id: "WX-0924-04",
    type: "Heatwave",
    city: "Jaisalmer",
    state: "Rajasthan",
    time: "18 min ago",
    coordinates: "26.9157° N, 70.9083° E",
    source: "Sensor",
    sourceDetail: "3 AWS stations",
    confidence: 97,
    severity: "high",
    summary:
      "Three stations have crossed the local heatwave threshold with persistent high night-time temperature.",
    evidence: ["AWS telemetry", "Threshold rule", "Historical baseline"],
    mapX: 30,
    mapY: 34,
  },
  {
    id: "WX-0924-05",
    type: "Fog",
    city: "Lucknow",
    state: "Uttar Pradesh",
    time: "24 min ago",
    coordinates: "26.8467° N, 80.9462° E",
    source: "News",
    sourceDetail: "Local desk + airport METAR",
    confidence: 82,
    severity: "moderate",
    summary:
      "Visibility degradation is affecting the Lucknow transport corridor; the signal is verified against METAR.",
    evidence: ["METAR match", "Trusted publisher", "Time consistency"],
    mapX: 52,
    mapY: 37,
  },
  {
    id: "WX-0924-06",
    type: "Strong wind",
    city: "Chennai",
    state: "Tamil Nadu",
    time: "31 min ago",
    coordinates: "13.0827° N, 80.2707° E",
    source: "Social",
    sourceDetail: "8 posts + buoy telemetry",
    confidence: 78,
    severity: "moderate",
    summary:
      "Coastal gust reports are increasing. Current confidence is moderate pending an official station update.",
    evidence: ["Source history", "Buoy proximity", "Duplicate merged ×8"],
    mapX: 50,
    mapY: 82,
  },
];

export const trendData = [
  { date: new Date("2026-09-24T06:00:00+05:30"), reports: 19, verified: 13 },
  { date: new Date("2026-09-24T07:00:00+05:30"), reports: 27, verified: 20 },
  { date: new Date("2026-09-24T08:00:00+05:30"), reports: 22, verified: 18 },
  { date: new Date("2026-09-24T09:00:00+05:30"), reports: 38, verified: 29 },
  { date: new Date("2026-09-24T10:00:00+05:30"), reports: 44, verified: 35 },
  { date: new Date("2026-09-24T11:00:00+05:30"), reports: 63, verified: 48 },
  { date: new Date("2026-09-24T12:00:00+05:30"), reports: 57, verified: 46 },
  { date: new Date("2026-09-24T13:00:00+05:30"), reports: 71, verified: 56 },
  { date: new Date("2026-09-24T14:00:00+05:30"), reports: 83, verified: 68 },
  { date: new Date("2026-09-24T15:00:00+05:30"), reports: 76, verified: 64 },
  { date: new Date("2026-09-24T16:00:00+05:30"), reports: 96, verified: 81 },
  { date: new Date("2026-09-24T17:00:00+05:30"), reports: 112, verified: 93 },
];

export const reviewItems = [
  {
    id: "RPT-7391",
    text: "Cloudburst near Dehradun bus stand — water rising very quickly.",
    location: "Dehradun, Uttarakhand",
    source: "@hillwatch_utk",
    signals: ["Media original", "GPS absent"],
    score: 68,
  },
  {
    id: "RPT-7388",
    text: "Old cyclone video reposted as today's storm in Puri.",
    location: "Puri, Odisha",
    source: "Public social post",
    signals: ["Reverse match", "Date conflict"],
    score: 21,
  },
  {
    id: "RPT-7374",
    text: "Visibility below 100 m on the Agra–Lucknow expressway.",
    location: "Kannauj, Uttar Pradesh",
    source: "Citizen reporter #1942",
    signals: ["Trusted reporter", "METAR nearby"],
    score: 79,
  },
];

export const sources = [
  { name: "IMD APIs", detail: "Warnings, rainfall, nowcast", health: 99, tone: "official" },
  { name: "MOSDAC", detail: "Satellite & radar products", health: 98, tone: "official" },
  { name: "NDMA SACHET", detail: "CAP geo-targeted alerts", health: 100, tone: "official" },
  { name: "Citizen network", detail: "12,840 opted-in reporters", health: 92, tone: "community" },
  { name: "Public signals", detail: "News & social streams", health: 87, tone: "community" },
] as const;

export const hazardColors: Record<EventType, string> = {
  Flood: "#0ea5e9",
  "Heavy rain": "#2563eb",
  Thunderstorm: "#8b5cf6",
  Heatwave: "#f97316",
  Fog: "#94a3b8",
  "Strong wind": "#10b981",
};
