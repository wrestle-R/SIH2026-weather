"use client";

import {
  Activity,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  CloudLightning,
  Database,
  FileSearch,
  Filter,
  Flag,
  Gauge,
  Globe2,
  IndianRupee,
  Languages,
  Layers3,
  Map as MapIcon,
  Menu,
  MessageSquareWarning,
  Moon,
  Radio,
  RefreshCw,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { IndiaWeatherMap } from "@/components/india-weather-map";
import { ReportsTrendChart } from "@/components/reports-trend-chart";
import {
  hazardColors,
  reviewItems,
  sources,
  weatherEvents,
  type EventType,
} from "@/lib/weather-data";

const hazardFilters: Array<"All" | EventType> = [
  "All",
  "Flood",
  "Heavy rain",
  "Thunderstorm",
  "Heatwave",
  "Fog",
  "Strong wind",
];

const navItems = [
  { label: "Command overview", icon: Gauge, target: "overview" },
  { label: "Live event stream", icon: Radio, target: "live-events" },
  { label: "Verification queue", icon: ShieldCheck, target: "verification" },
  { label: "Source registry", icon: Database, target: "sources" },
] as const;

function scrollToSection(target: string) {
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function WeatherCommandCenter() {
  const [activeHazard, setActiveHazard] = useState<"All" | EventType>("All");
  const [selectedId, setSelectedId] = useState(weatherEvents[0].id);
  const [search, setSearch] = useState("");
  const [isLive, setIsLive] = useState(true);
  const [currentTime, setCurrentTime] = useState("--:--:--");
  const [dayMode, setDayMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<Record<string, "verified" | "flagged">>({});
  const [connectedSources, setConnectedSources] = useState<Set<string>>(
    () => new Set(sources.map((source) => source.name)),
  );

  useEffect(() => {
    const updateTime = () =>
      setCurrentTime(
        new Intl.DateTimeFormat("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }).format(new Date()),
      );

    updateTime();
    if (!isLive) return;
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, [isLive]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return weatherEvents.filter((event) => {
      const matchesHazard = activeHazard === "All" || event.type === activeHazard;
      const matchesSearch =
        !query ||
        `${event.type} ${event.city} ${event.state} ${event.source}`
          .toLowerCase()
          .includes(query);
      return matchesHazard && matchesSearch;
    });
  }, [activeHazard, search]);

  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedId) ??
    filteredEvents[0] ??
    weatherEvents.find((event) => event.id === selectedId) ??
    weatherEvents[0];

  function toggleSource(name: string) {
    setConnectedSources((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className={`app-frame ${dayMode ? "day-mode" : ""}`}>
      <aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>VARUNETRA</strong>
            <small>National weather intelligence</small>
          </div>
        </div>

        <div className="sih-chip">
          <span>SIH 2026</span>
          <em>Prototype</em>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <p className="nav-label">Operations</p>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                className={index === 0 ? "active" : ""}
                key={item.label}
                type="button"
                onClick={() => {
                  scrollToSection(item.target);
                  setMobileNavOpen(false);
                }}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.target === "verification" ? <b>3</b> : null}
              </button>
            );
          })}
          <p className="nav-label nav-label-spaced">System</p>
          <button type="button" onClick={() => scrollToSection("pipeline")}>
            <ServerCog size={17} />
            <span>Pipeline health</span>
          </button>
          <button type="button" onClick={() => scrollToSection("sources")}>
            <Users size={17} />
            <span>Response teams</span>
          </button>
        </nav>

        <div className="sidebar-status">
          <div className="status-orbit"><Activity size={18} /></div>
          <div>
            <strong>All systems nominal</strong>
            <span>8.4k events/min processed</span>
          </div>
        </div>
        <div className="sidebar-footer">
          <span>Prototype data</span>
          <span>v0.9.4</span>
        </div>
      </aside>

      {mobileNavOpen ? (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          type="button"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="coverage-chip">
              <span className="live-dot" />
              India national coverage
            </div>
            <span className="topbar-separator" />
            <span className="topbar-date">24 Sep 2026</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Change language">
              <Languages size={17} />
              <span>EN</span>
              <ChevronDown size={13} />
            </button>
            <button
              className="icon-button square-button"
              type="button"
              aria-label={dayMode ? "Use dark mode" : "Use light mode"}
              onClick={() => setDayMode((value) => !value)}
            >
              {dayMode ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button className="icon-button square-button notification-button" type="button" aria-label="Notifications">
              <Bell size={17} />
              <i />
            </button>
            <div className="operator">
              <span>AK</span>
              <div><strong>Admin console</strong><small>National desk</small></div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="hero-row" id="overview">
            <div>
              <p className="eyebrow"><Radio size={13} /> Live intelligence / राष्ट्रीय मौसम</p>
              <h1>India weather<br /><span>command center.</span></h1>
              <p className="hero-copy">
                Multi-source signals, machine-verified into one operational picture.
              </p>
            </div>
            <div className="live-control">
              <div>
                <span>IST operational clock</span>
                <strong>{currentTime}</strong>
              </div>
              <button
                type="button"
                className={isLive ? "is-active" : ""}
                onClick={() => setIsLive((value) => !value)}
              >
                <Radio size={15} /> {isLive ? "Live" : "Paused"}
              </button>
            </div>
          </section>

          <section className="metrics-grid" aria-label="Operational metrics">
            <article className="metric-card primary-metric">
              <div className="metric-top">
                <span>Active weather events</span>
                <div className="metric-icon"><CloudLightning size={19} /></div>
              </div>
              <div className="metric-value"><strong>47</strong><em>+8 in 1h</em></div>
              <div className="mini-bars" aria-hidden="true">
                {[22, 30, 24, 42, 36, 48, 55, 50, 64, 72, 66, 84].map((height, index) => (
                  <i key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Reports processed</span><div className="metric-icon cyan"><Layers3 size={19} /></div></div>
              <div className="metric-value"><strong>128.4k</strong><em className="positive">+14.2%</em></div>
              <p>Today across 19 active streams</p>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>AI verified</span><div className="metric-icon green"><ShieldCheck size={19} /></div></div>
              <div className="metric-value"><strong>91.8%</strong><em className="positive">High trust</em></div>
              <div className="confidence-track"><span style={{ width: "91.8%" }} /></div>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>Duplicates merged</span><div className="metric-icon amber"><FileSearch size={19} /></div></div>
              <div className="metric-value"><strong>18,721</strong><em>14.6% noise</em></div>
              <p>Saved an estimated 346 review hours</p>
            </article>
          </section>

          <section className="intel-panel" id="live-events">
            <div className="section-header intel-heading">
              <div>
                <p className="section-kicker">Live intelligence map</p>
                <h2>Signals becoming evidence</h2>
              </div>
              <div className="map-meta">
                <span><i className="live-dot" /> Auto-refresh 30 sec</span>
                <button type="button"><Layers3 size={15} /> Layers <ChevronDown size={13} /></button>
              </div>
            </div>

            <div className="filter-row">
              <div className="hazard-tabs" role="group" aria-label="Filter weather event type">
                {hazardFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={activeHazard === filter ? "active" : ""}
                    onClick={() => setActiveHazard(filter)}
                  >
                    {filter !== "All" ? (
                      <i style={{ background: hazardColors[filter] }} />
                    ) : null}
                    {filter}
                  </button>
                ))}
              </div>
              <label className="event-search">
                <Search size={15} />
                <span className="sr-only">Search weather events</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search city or state"
                />
                {search ? (
                  <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>
                ) : null}
              </label>
            </div>

            <div className="intel-grid">
              <IndiaWeatherMap
                events={filteredEvents}
                selectedId={selectedEvent.id}
                onSelect={setSelectedId}
              />

              <aside className="event-inspector" aria-label="Selected event details">
                <div className="inspector-topline">
                  <span className={`severity-badge ${selectedEvent.severity}`}>
                    {selectedEvent.severity}
                  </span>
                  <span>{selectedEvent.id}</span>
                </div>
                <div className="event-title-row">
                  <div className="hazard-symbol" style={{ color: hazardColors[selectedEvent.type] }}>
                    {selectedEvent.type === "Flood" ? <Waves size={23} /> : <CloudLightning size={23} />}
                  </div>
                  <div>
                    <h3>{selectedEvent.type}</h3>
                    <p>{selectedEvent.city}, {selectedEvent.state}</p>
                  </div>
                </div>
                <p className="event-summary">{selectedEvent.summary}</p>

                <div className="confidence-score">
                  <div className="score-ring" style={{ "--score": `${selectedEvent.confidence * 3.6}deg` } as CSSProperties}>
                    <span>{selectedEvent.confidence}</span>
                  </div>
                  <div>
                    <strong>Verification confidence</strong>
                    <span>{selectedEvent.confidence >= 90 ? "Ready for dissemination" : "Human review advised"}</span>
                  </div>
                </div>

                <dl className="event-facts">
                  <div><dt>Detected</dt><dd>{selectedEvent.time}</dd></div>
                  <div><dt>Coordinates</dt><dd>{selectedEvent.coordinates}</dd></div>
                  <div><dt>Primary source</dt><dd>{selectedEvent.source}</dd></div>
                  <div><dt>Cross-check</dt><dd>{selectedEvent.sourceDetail}</dd></div>
                </dl>

                <div className="evidence-list">
                  <span>Evidence stack</span>
                  {selectedEvent.evidence.map((evidence) => (
                    <b key={evidence}><Check size={12} /> {evidence}</b>
                  ))}
                </div>

                <button className="review-event-button" type="button" onClick={() => scrollToSection("verification")}>
                  Open verification trail <span>→</span>
                </button>
              </aside>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="empty-map-state">
                <Search size={22} /> No events match this filter. Try another state or hazard.
              </div>
            ) : null}

            <div className="event-ticker" aria-label="Recent weather event feed">
              {filteredEvents.slice(0, 4).map((event) => (
                <button
                  type="button"
                  key={event.id}
                  className={selectedEvent.id === event.id ? "active" : ""}
                  onClick={() => setSelectedId(event.id)}
                >
                  <i style={{ background: hazardColors[event.type] }} />
                  <span><strong>{event.city}</strong><small>{event.type} · {event.time}</small></span>
                  <em>{event.confidence}%</em>
                </button>
              ))}
            </div>
          </section>

          <section className="analytics-grid">
            <article className="panel trend-panel">
              <div className="section-header">
                <div>
                  <p className="section-kicker">12-hour signal volume</p>
                  <h2>Reports vs. verified events</h2>
                </div>
                <div className="chart-legend"><span className="reports">Reports</span><span className="verified">Verified</span></div>
              </div>
              <div className="trend-summary">
                <strong>1,284</strong>
                <span><b>+18.2%</b> compared with prior 12h</span>
              </div>
              <div className="chart-wrap"><ReportsTrendChart /></div>
            </article>

            <article className="panel pipeline-panel" id="pipeline">
              <div className="section-header">
                <div><p className="section-kicker">Processing pipeline</p><h2>From noise to trust</h2></div>
                <span className="latency"><Zap size={12} /> 1.8s p95</span>
              </div>
              <div className="pipeline-flow">
                {[
                  { icon: Radio, value: "128.4k", label: "Ingested", note: "19 streams" },
                  { icon: Layers3, value: "109.7k", label: "Deduplicated", note: "−14.6% noise" },
                  { icon: Bot, value: "100.7k", label: "AI scored", note: "7 signals/report" },
                  { icon: ShieldCheck, value: "92.4k", label: "Verified", note: "91.8% trusted" },
                ].map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div className="pipeline-step" key={step.label}>
                      <div className="pipeline-icon"><Icon size={19} /></div>
                      <strong>{step.value}</strong>
                      <span>{step.label}</span>
                      <small>{step.note}</small>
                      {index < 3 ? <div className="pipeline-arrow"><i /><span>→</span></div> : null}
                    </div>
                  );
                })}
              </div>
              <div className="pipeline-note">
                <Sparkles size={15} />
                <span><strong>Explainable verification</strong> scores source history, spatio-temporal agreement, media authenticity, and trusted sensor proximity.</span>
              </div>
            </article>
          </section>

          <section className="lower-grid">
            <article className="panel review-panel" id="verification">
              <div className="section-header">
                <div><p className="section-kicker">Human-in-the-loop</p><h2>Verification queue</h2></div>
                <button className="text-button" type="button"><Filter size={14} /> Priority first</button>
              </div>
              <div className="review-list">
                {reviewItems.map((item) => {
                  const status = reviewStatus[item.id];
                  return (
                    <div className={`review-item ${status ? `resolved ${status}` : ""}`} key={item.id}>
                      <div className="review-score"><span>{item.score}</span><small>trust</small></div>
                      <div className="review-body">
                        <div className="review-meta"><span>{item.id}</span><span>{item.location}</span></div>
                        <p>{item.text}</p>
                        <div className="review-tags">
                          <small>{item.source}</small>
                          {item.signals.map((signal) => <b key={signal}>{signal}</b>)}
                        </div>
                      </div>
                      {status ? (
                        <div className="review-result">
                          {status === "verified" ? <CheckCircle2 size={18} /> : <Flag size={18} />}
                          {status}
                        </div>
                      ) : (
                        <div className="review-actions">
                          <button type="button" aria-label={`Verify ${item.id}`} onClick={() => setReviewStatus((state) => ({ ...state, [item.id]: "verified" }))}><Check size={16} /></button>
                          <button type="button" aria-label={`Flag ${item.id}`} onClick={() => setReviewStatus((state) => ({ ...state, [item.id]: "flagged" }))}><Flag size={15} /></button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="panel source-panel" id="sources">
              <div className="section-header">
                <div><p className="section-kicker">Source registry</p><h2>Connected data fabric</h2></div>
                <span className="source-count">{connectedSources.size}/5 online</span>
              </div>
              <div className="source-list">
                {sources.map((source) => {
                  const connected = connectedSources.has(source.name);
                  return (
                    <button type="button" key={source.name} onClick={() => toggleSource(source.name)}>
                      <div className={`source-mark ${source.tone}`}>
                        {source.tone === "official" ? <Globe2 size={17} /> : <Users size={17} />}
                      </div>
                      <span><strong>{source.name}</strong><small>{source.detail}</small></span>
                      <em className={connected ? "connected" : "disconnected"}>
                        <i /> {connected ? `${source.health}%` : "Paused"}
                      </em>
                    </button>
                  );
                })}
              </div>
              <div className="source-footer">
                <RefreshCw size={13} /> Last schema sync 42 sec ago
              </div>
            </article>
          </section>

          <section className="impact-strip">
            <div><CircleGauge size={21} /><span><strong>22 min faster</strong><small>incident confirmation</small></span></div>
            <div><MessageSquareWarning size={21} /><span><strong>6× less noise</strong><small>for district operators</small></span></div>
            <div><IndianRupee size={21} /><span><strong>Lower response cost</strong><small>through one shared picture</small></span></div>
            <div className="impact-cta"><MapIcon size={18} /><span>Built for India’s scale.<br /><b>Designed for decisive action.</b></span></div>
          </section>

          <footer className="dashboard-footer">
            <span>VARUNETRA · SIH 2026 functional prototype</span>
            <span>Demo records are simulated · Production integrations require agency approval</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
