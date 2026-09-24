"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, Database, FlaskConical, GitBranch, ListFilter, Play, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const NAV = [
  { href: "/", label: "Overview", icon: Activity },
  { href: "/demo", label: "Live demo", icon: Play },
  { href: "/lab", label: "Parser lab", icon: FlaskConical },
  { href: "/events", label: "Events", icon: ListFilter },
  { href: "/sources", label: "Sources", icon: GitBranch },
  { href: "/schema", label: "Schema", icon: Database },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="ULPF overview">
          <span className="brand-mark"><ShieldCheck size={21} strokeWidth={2.4} /></span>
          <span><b>ULPF</b><small>SIH 2026 · PS 26156</small></span>
        </Link>
        <nav className="side-nav" aria-label="Primary navigation">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={<Link href={href} aria-label={label} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined} />}>
                  <Icon data-icon="inline-start" size={18} /><span>{label}</span>
                </TooltipTrigger>
                <TooltipContent side="right" className="compact-nav-tip">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="runtime-card"><span className="status-line"><i /> Runtime ready</span><small>Local processing · no cloud</small></div>
          <Link href="/schema" className="docs-link"><BookOpen size={15} /> OCSF 1.9 schema</Link>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div><span className="topbar-eyebrow">Universal Log Pre-processing Framework</span><b className="topbar-title">Security data, made interoperable</b></div>
          <Badge variant="outline" className="topbar-status"><i /> Offline ready</Badge>
        </header>
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
