"use client";

import { Fragment } from "react";
import { useDashboardLanguage } from "@/hooks/use-dashboard-language";

export function TranslatedText({ text }: { text: string }) {
  const { t } = useDashboardLanguage();
  return <Fragment>{t(text)}</Fragment>;
}
