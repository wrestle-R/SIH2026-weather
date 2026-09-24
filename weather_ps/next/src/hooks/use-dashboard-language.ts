"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getFallbackTranslations,
  translatableTexts,
  type LanguageCode,
} from "@/lib/i18n";

type TranslationProvider = "english" | "loading" | "google-cloud" | "bundled-fallback";

type TranslationResponse = {
  translations?: string[];
  provider?: "google-cloud" | "bundled-fallback";
};

function createDictionary(texts: readonly string[], translatedTexts: string[]) {
  return Object.fromEntries(texts.map((text, index) => [text, translatedTexts[index] ?? text]));
}

export function useDashboardLanguage() {
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [provider, setProvider] = useState<TranslationProvider>("english");
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => () => requestController.current?.abort(), []);

  const changeLanguage = useCallback(async (nextLanguage: LanguageCode) => {
    requestController.current?.abort();
    setLanguage(nextLanguage);

    if (nextLanguage === "en") {
      setTranslations({});
      setProvider("english");
      return;
    }

    const fallback = getFallbackTranslations(nextLanguage, [...translatableTexts]);
    setTranslations(createDictionary(translatableTexts, fallback));
    setProvider("loading");

    const controller = new AbortController();
    requestController.current = controller;

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: translatableTexts, target: nextLanguage }),
        signal: controller.signal,
      });
      const result = (await response.json()) as TranslationResponse;

      if (!response.ok || !result.translations) {
        setProvider("bundled-fallback");
        return;
      }

      setTranslations(createDictionary(translatableTexts, result.translations));
      setProvider(result.provider ?? "bundled-fallback");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setProvider("bundled-fallback");
    }
  }, []);

  const t = useCallback(
    (text: string) => (language === "en" ? text : translations[text] ?? text),
    [language, translations],
  );

  return {
    language,
    changeLanguage,
    isTranslating: provider === "loading",
    provider,
    t,
  };
}
