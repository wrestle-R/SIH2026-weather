"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  Database,
  Languages,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Moon,
  RadioTower,
  ShieldCheck,
  Siren,
  Sun,
  Workflow,
} from "lucide-react";
import { useState, type ReactNode } from "react";
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

const operations = [
  { href: "/", label: "Command overview", icon: LayoutDashboard },
  { href: "/events", label: "Live event stream", icon: RadioTower },
  { href: "/verification", label: "Verification queue", icon: ShieldCheck, count: 3 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/alerts", label: "Alerts", icon: Siren, count: 2 },
] as const;

const system = [
  { href: "/sources", label: "Source registry", icon: Database },
  { href: "/pipeline", label: "Pipeline health", icon: Workflow },
] as const;

const pageNames: Record<string, string> = {
  "/": "Command overview",
  "/events": "Live event stream",
  "/verification": "Verification queue",
  "/analytics": "Analytics",
  "/alerts": "Alerts",
  "/sources": "Source registry",
  "/pipeline": "Pipeline health",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { language, changeLanguage, isTranslating, provider, t } = useDashboardLanguage();
  const activeLanguage = languages.find((item) => item.code === language) ?? languages[0];

  function toggleTheme() {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  function navLink(item: (typeof operations)[number] | (typeof system)[number]) {
    const Icon = item.icon;
    const active = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn("nav-link", active && "active")}
        aria-current={active ? "page" : undefined}
        onClick={() => setMobileNavOpen(false)}
      >
        <Icon size={17} />
        <span>{t(item.label)}</span>
        {"count" in item ? <b>{item.count}</b> : null}
      </Link>
    );
  }

  return (
    <div className={cn("app-frame", darkMode && "dark-mode")}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className={cn("sidebar", mobileNavOpen && "mobile-open")}>
        <Link className="brand-lockup" href="/" onClick={() => setMobileNavOpen(false)}>
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <strong>VARUNETRA</strong>
            <small>{t("National weather intelligence")}</small>
          </div>
        </Link>

        <nav className="primary-nav" aria-label="Primary navigation">
          <p className="nav-label">{t("Operations")}</p>
          {operations.map(navLink)}
          <p className="nav-label nav-label-spaced">{t("System")}</p>
          {system.map(navLink)}
        </nav>

        <div className="sidebar-status">
          <div className="status-orbit"><Activity size={18} /></div>
          <div>
            <strong>{t("All systems nominal")}</strong>
            <span>8.4k {t("events/min processed")}</span>
          </div>
        </div>
        <div className="sidebar-footer"><span>National operations grid</span><span>v1.0</span></div>
      </aside>

      {mobileNavOpen ? (
        <button className="nav-scrim" aria-label="Close navigation" type="button" onClick={() => setMobileNavOpen(false)} />
      ) : null}

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu" type="button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
            <div className="coverage-chip"><span className="live-dot" />{t("India national coverage")}</div>
            <span className="topbar-separator" />
            <span className="topbar-date">{t(pageNames[pathname] ?? "Weather intelligence")}</span>
          </div>
          <div className="topbar-actions">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" className="icon-button language-button" aria-label={t("Change language")} aria-busy={isTranslating} />}>
                {isTranslating ? <LoaderCircle data-icon="inline-start" className="translation-spinner" /> : <Languages data-icon="inline-start" />}
                <span>{activeLanguage.code.toUpperCase()}</span><ChevronDown data-icon="inline-end" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="language-menu">
                <DropdownMenuLabel>{t("Display language")}</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {languages.map((item) => (
                    <DropdownMenuItem key={item.code} onClick={() => void changeLanguage(item.code)}>
                      <span className="language-code">{item.code.toUpperCase()}</span>
                      <span>{item.nativeLabel}</span>
                      {language === item.code ? <Check className="language-check" /> : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <p className="translation-credit">{provider === "google-cloud" ? "Translated by Google Cloud" : "Google translation ready"}</p>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" className="icon-button square-button" aria-label={darkMode ? "Use light theme" : "Use dark theme"} onClick={toggleTheme}>
              {darkMode ? <Sun /> : <Moon />}
            </Button>
            <Button nativeButton={false} variant="outline" size="icon" className="icon-button square-button notification-button" render={<Link href="/alerts" aria-label="Open alerts" />}>
              <Bell /><i />
            </Button>
            <div className="operator"><span>ND</span><div><strong>National Desk</strong><small>Duty operator</small></div></div>
          </div>
        </header>
        <main id="main-content" className="dashboard-content">
          {children}
          <footer className="shell-footer"><span>VARUNETRA · National Weather Intelligence</span><span>Decision support only · Official warnings remain authoritative</span></footer>
        </main>
      </div>
    </div>
  );
}
