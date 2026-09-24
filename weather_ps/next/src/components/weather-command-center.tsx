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
  LoaderCircle,
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardLanguage } from "@/hooks/use-dashboard-language";
import { languages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
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
  const [darkMode, setDarkMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<Record<string, "verified" | "flagged">>({});
  const [connectedSources, setConnectedSources] = useState<Set<string>>(
    () => new Set(sources.map((source) => source.name)),
  );
  const { language, changeLanguage, isTranslating, provider, t } =
    useDashboardLanguage();
  const activeLanguage =
    languages.find((item) => item.code === language) ?? languages[0];

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    return () => document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return weatherEvents.filter((event) => {
      const matchesHazard = activeHazard === "All" || event.type === activeHazard;
      const matchesSearch =
        !query ||
        `${event.type} ${t(event.type)} ${event.city} ${event.state} ${event.source}`
          .toLowerCase()
          .includes(query);
      return matchesHazard && matchesSearch;
    });
  }, [activeHazard, search, t]);

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
    <div className={cn("app-frame", darkMode && "dark-mode")}>
      <aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>VARUNETRA</strong>
            <small>{t("National weather intelligence")}</small>
          </div>
        </div>

        <div className="sih-chip">
          <span>SIH 2026</span>
          <em>{t("Prototype")}</em>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <p className="nav-label">{t("Operations")}</p>
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
                <span>{t(item.label)}</span>
                {item.target === "verification" ? <b>3</b> : null}
              </button>
            );
          })}
          <p className="nav-label nav-label-spaced">{t("System")}</p>
          <button type="button" onClick={() => scrollToSection("pipeline")}>
            <ServerCog size={17} />
            <span>{t("Pipeline health")}</span>
          </button>
          <button type="button" onClick={() => scrollToSection("sources")}>
            <Users size={17} />
            <span>{t("Response teams")}</span>
          </button>
        </nav>

        <div className="sidebar-status">
          <div className="status-orbit"><Activity size={18} /></div>
          <div>
            <strong>{t("All systems nominal")}</strong>
            <span>8.4k {t("events/min processed")}</span>
          </div>
        </div>
        <div className="sidebar-footer">
          <span>{t("Prototype data")}</span>
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
              {t("India national coverage")}
            </div>
            <span className="topbar-separator" />
            <span className="topbar-date">24 Sep 2026</span>
          </div>
          <div className="topbar-actions">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="default"
                    className="icon-button language-button"
                    aria-label={t("Change language")}
                    aria-busy={isTranslating}
                  />
                }
              >
                {isTranslating ? (
                  <LoaderCircle data-icon="inline-start" className="translation-spinner" />
                ) : (
                  <Languages data-icon="inline-start" />
                )}
                <span>{activeLanguage.code.toUpperCase()}</span>
                <ChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="language-menu">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t("Language")}</DropdownMenuLabel>
                  {languages.map((item) => (
                    <DropdownMenuItem
                      key={item.code}
                      onClick={() => void changeLanguage(item.code)}
                    >
                      <span className="language-code">{item.code.toUpperCase()}</span>
                      <span>{item.nativeLabel}</span>
                      {language === item.code ? <Check className="language-check" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <div className="translation-credit">
                  {provider === "google-cloud"
                    ? t("Translation powered by Google Cloud")
                    : "Google Cloud Translation API"}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="icon"
              className="icon-button square-button"
              aria-label={darkMode ? t("Use light mode") : t("Use dark mode")}
              onClick={() => setDarkMode((value) => !value)}
            >
              {darkMode ? <Sun /> : <Moon />}
            </Button>
            <Button variant="outline" size="icon" className="icon-button square-button notification-button" aria-label="Notifications">
              <Bell />
              <i />
            </Button>
            <div className="operator">
              <span>AK</span>
              <div><strong>{t("Admin console")}</strong><small>{t("National desk")}</small></div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="hero-row" id="overview">
            <div>
              <p className="eyebrow"><Radio size={13} /> {t("Live intelligence")} / राष्ट्रीय मौसम</p>
              <h1>{t("India weather")}<br /><span>{t("command center.")}</span></h1>
              <p className="hero-copy">
                {t("Multi-source signals, machine-verified into one operational picture.")}
              </p>
            </div>
            <div className="live-control">
              <div>
                <span>{t("IST operational clock")}</span>
                <strong>{currentTime}</strong>
              </div>
              <button
                type="button"
                className={isLive ? "is-active" : ""}
                onClick={() => setIsLive((value) => !value)}
              >
                <Radio size={15} /> {isLive ? t("Live") : t("Paused")}
              </button>
            </div>
          </section>

          <section className="metrics-grid" aria-label="Operational metrics">
            <article className="metric-card primary-metric">
              <div className="metric-top">
                <span>{t("Active weather events")}</span>
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
              <div className="metric-top"><span>{t("Reports processed")}</span><div className="metric-icon cyan"><Layers3 size={19} /></div></div>
              <div className="metric-value"><strong>128.4k</strong><em className="positive">+14.2%</em></div>
              <p>{t("Today across 19 active streams")}</p>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>{t("AI verified")}</span><div className="metric-icon green"><ShieldCheck size={19} /></div></div>
              <div className="metric-value"><strong>91.8%</strong><em className="positive">{t("High trust")}</em></div>
              <div className="confidence-track"><span style={{ width: "91.8%" }} /></div>
            </article>
            <article className="metric-card">
              <div className="metric-top"><span>{t("Duplicates merged")}</span><div className="metric-icon amber"><FileSearch size={19} /></div></div>
              <div className="metric-value"><strong>18,721</strong><em>14.6% noise</em></div>
              <p>{t("Saved an estimated 346 review hours")}</p>
            </article>
          </section>

          <section className="intel-panel" id="live-events">
            <div className="section-header intel-heading">
              <div>
                <p className="section-kicker">{t("Live intelligence map")}</p>
                <h2>{t("Signals becoming evidence")}</h2>
              </div>
              <div className="map-meta">
                <span><i className="live-dot" /> {t("Auto-refresh 30 sec")}</span>
                <button type="button"><Layers3 size={15} /> {t("Layers")} <ChevronDown size={13} /></button>
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
                    {t(filter)}
                  </button>
                ))}
              </div>
              <label className="event-search">
                <Search size={15} />
                <span className="sr-only">Search weather events</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Search city or state")}
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
                t={t}
              />

              <aside className="event-inspector" aria-label="Selected event details">
                <div className="inspector-topline">
                  <span className={`severity-badge ${selectedEvent.severity}`}>
                    {t(selectedEvent.severity[0].toUpperCase() + selectedEvent.severity.slice(1))}
                  </span>
                  <span>{selectedEvent.id}</span>
                </div>
                <div className="event-title-row">
                  <div className="hazard-symbol" style={{ color: hazardColors[selectedEvent.type] }}>
                    {selectedEvent.type === "Flood" ? <Waves size={23} /> : <CloudLightning size={23} />}
                  </div>
                  <div>
                    <h3>{t(selectedEvent.type)}</h3>
                    <p>{selectedEvent.city}, {selectedEvent.state}</p>
                  </div>
                </div>
                <p className="event-summary">{selectedEvent.summary}</p>

                <div className="confidence-score">
                  <div className="score-ring" style={{ "--score": `${selectedEvent.confidence * 3.6}deg` } as CSSProperties}>
                    <span>{selectedEvent.confidence}</span>
                  </div>
                  <div>
                    <strong>{t("Verification confidence")}</strong>
                    <span>{selectedEvent.confidence >= 90 ? t("Ready for dissemination") : t("Human review advised")}</span>
                  </div>
                </div>

                <dl className="event-facts">
                  <div><dt>{t("Detected")}</dt><dd>{selectedEvent.time}</dd></div>
                  <div><dt>{t("Coordinates")}</dt><dd>{selectedEvent.coordinates}</dd></div>
                  <div><dt>{t("Primary source")}</dt><dd>{selectedEvent.source}</dd></div>
                  <div><dt>{t("Cross-check")}</dt><dd>{selectedEvent.sourceDetail}</dd></div>
                </dl>

                <div className="evidence-list">
                  <span>{t("Evidence stack")}</span>
                  {selectedEvent.evidence.map((evidence) => (
                    <b key={evidence}><Check size={12} /> {evidence}</b>
                  ))}
                </div>

                <button className="review-event-button" type="button" onClick={() => scrollToSection("verification")}>
                  {t("Open verification trail")} <span>→</span>
                </button>
              </aside>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="empty-map-state">
                <Search size={22} /> {t("No events match this filter. Try another state or hazard.")}
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
                  <span><strong>{event.city}</strong><small>{t(event.type)} · {event.time}</small></span>
                  <em>{event.confidence}%</em>
                </button>
              ))}
            </div>
          </section>

          <section className="analytics-grid">
            <article className="panel trend-panel">
              <div className="section-header">
                <div>
                  <p className="section-kicker">{t("12-hour signal volume")}</p>
                  <h2>{t("Reports vs. verified events")}</h2>
                </div>
                <div className="chart-legend"><span className="reports">{t("Reports")}</span><span className="verified">{t("Verified")}</span></div>
              </div>
              <div className="trend-summary">
                <strong>1,284</strong>
                <span><b>+18.2%</b> {t("compared with prior 12h")}</span>
              </div>
              <div className="chart-wrap"><ReportsTrendChart /></div>
            </article>

            <article className="panel pipeline-panel" id="pipeline">
              <div className="section-header">
                <div><p className="section-kicker">{t("Processing pipeline")}</p><h2>{t("From noise to trust")}</h2></div>
                <span className="latency"><Zap size={12} /> 1.8s p95</span>
              </div>
              <div className="pipeline-flow">
                {[
                  { icon: Radio, value: "128.4k", label: t("Ingested"), note: `19 ${t("streams")}` },
                  { icon: Layers3, value: "109.7k", label: t("Deduplicated"), note: `−14.6% ${t("noise")}` },
                  { icon: Bot, value: "100.7k", label: t("AI scored"), note: `7 ${t("signals/report")}` },
                  { icon: ShieldCheck, value: "92.4k", label: t("Verified"), note: `91.8% ${t("trusted")}` },
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
                <span><strong>{t("Explainable verification")}</strong> {t("scores source history, spatio-temporal agreement, media authenticity, and trusted sensor proximity.")}</span>
              </div>
            </article>
          </section>

          <section className="lower-grid">
            <article className="panel review-panel" id="verification">
              <div className="section-header">
                <div><p className="section-kicker">{t("Human-in-the-loop")}</p><h2>{t("Verification queue")}</h2></div>
                <button className="text-button" type="button"><Filter size={14} /> {t("Priority first")}</button>
              </div>
              <div className="review-list">
                {reviewItems.map((item) => {
                  const status = reviewStatus[item.id];
                  return (
                    <div className={`review-item ${status ? `resolved ${status}` : ""}`} key={item.id}>
                      <div className="review-score"><span>{item.score}</span><small>{t("trust")}</small></div>
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
                          {t(status)}
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
                <div><p className="section-kicker">{t("Source registry")}</p><h2>{t("Connected data fabric")}</h2></div>
                <span className="source-count">{connectedSources.size}/5 {t("online")}</span>
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
                        <i /> {connected ? `${source.health}%` : t("Paused")}
                      </em>
                    </button>
                  );
                })}
              </div>
              <div className="source-footer">
                <RefreshCw size={13} /> {t("Last schema sync 42 sec ago")}
              </div>
            </article>
          </section>

          <section className="impact-strip">
            <div><CircleGauge size={21} /><span><strong>22 min faster</strong><small>{t("incident confirmation")}</small></span></div>
            <div><MessageSquareWarning size={21} /><span><strong>6× {t("less noise")}</strong><small>{t("for district operators")}</small></span></div>
            <div><IndianRupee size={21} /><span><strong>{t("Lower response cost")}</strong><small>{t("through one shared picture")}</small></span></div>
            <div className="impact-cta"><MapIcon size={18} /><span>{t("Built for India’s scale.")}<br /><b>{t("Designed for decisive action.")}</b></span></div>
          </section>

          <footer className="dashboard-footer">
            <span>VARUNETRA · SIH 2026 {t("functional prototype")}</span>
            <span>{t("Demo records are simulated · Production integrations require agency approval")}</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
