"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

type LanguageContextValue = {
  language: LanguageCode;
  changeLanguage: (language: LanguageCode) => Promise<void>;
  isTranslating: boolean;
  provider: TranslationProvider;
  t: (text: string) => string;
};

const DashboardLanguageContext = createContext<LanguageContextValue | null>(null);

function createDictionary(texts: readonly string[], translatedTexts: string[]) {
  return Object.fromEntries(texts.map((text, index) => [text, translatedTexts[index] ?? text]));
}

export function DashboardLanguageProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({ language, changeLanguage, isTranslating: provider === "loading", provider, t }),
    [changeLanguage, language, provider, t],
  );

  return (
    <DashboardLanguageContext.Provider value={value}>
      {children}
    </DashboardLanguageContext.Provider>
  );
}

export function useDashboardLanguage() {
  const context = useContext(DashboardLanguageContext);
  if (!context) {
    throw new Error("useDashboardLanguage must be used inside DashboardLanguageProvider");
  }
  return context;
}
