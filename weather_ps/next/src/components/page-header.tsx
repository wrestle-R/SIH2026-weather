import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TranslatedText } from "@/components/translated-text";

export function PageHeader({ eyebrow, title, description, icon: Icon, actions }: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow"><Icon size={13} /><TranslatedText text={eyebrow} /></p>
        <h1><TranslatedText text={title} /></h1>
        <p><TranslatedText text={description} /></p>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}
