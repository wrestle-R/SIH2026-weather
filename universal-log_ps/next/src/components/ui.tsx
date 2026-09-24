import type { ReactNode } from "react";

export function PageHeader({ code, title, description, action }: { code: string; title: string; description: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div><span className="section-code">[{code}]</span><h1>{title}</h1><p>{description}</p></div>
      {action ? <div className="page-action">{action}</div> : null}
    </header>
  );
}

export function Panel({ title, code, children, className = "", action }: { title: string; code?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-head"><span>{code ? `${code} / ` : ""}{title}</span>{action}</header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export function Severity({ value }: { value: string }) {
  const level = value.toLowerCase();
  const tone = level.includes("critical") || level.includes("fatal") ? "critical" : level.includes("high") ? "high" : level.includes("medium") || level.includes("warning") ? "medium" : "low";
  return <span className={`severity ${tone}`}>{value.toUpperCase()}</span>;
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="empty-state"><span>{"/// NO RECORDS"}</span><h3>{title}</h3><p>{children}</p></div>;
}
