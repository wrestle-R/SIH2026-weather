"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivityIcon, DatabaseIcon, FlaskIcon, GitBranchIcon, ListMagnifyingGlassIcon, ShieldCheckIcon,
} from "@phosphor-icons/react";

const NAV = [
  { href: "/", label: "Command", code: "01", icon: ActivityIcon },
  { href: "/lab", label: "Parser Lab", code: "02", icon: FlaskIcon },
  { href: "/events", label: "Events", code: "03", icon: ListMagnifyingGlassIcon },
  { href: "/sources", label: "Sources", code: "04", icon: GitBranchIcon },
  { href: "/schema", label: "Schema", code: "05", icon: DatabaseIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="ULPF command center home">
          <span className="brand-mark"><ShieldCheckIcon weight="fill" size={25} /></span>
          <span><b>ULPF</b><small>SIH 26156 / NTRO</small></span>
        </Link>
        <nav className="side-nav" aria-label="Primary navigation">
          {NAV.map(({ href, label, code, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} aria-label={label} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined}>
                <span className="nav-code">{code}</span><Icon size={18} /><span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <span className="status-line"><i /> OFFLINE READY</span>
          <span>OCSF 1.9.0</span>
          <span>REFERENCE NODE</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="topbar-title">UNIVERSAL LOG PRE-PROCESSING FRAMEWORK</span>
          <span className="topbar-meta">AIR-GAP / LOCAL PROCESSING</span>
          <span className="topbar-status"><i /> SYSTEM NOMINAL</span>
        </header>
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
