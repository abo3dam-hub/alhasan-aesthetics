import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Locale, Translations } from "./types";
import ar from "../locales/ar.json";
import en from "../locales/en.json";

const translations: Record<Locale, Translations> = { ar, en };

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLocale(): Locale {
  const stored = localStorage.getItem("locale") as Locale | null;
  if (stored === "ar" || stored === "en") return stored;
  return "ar";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "ar" ? "en" : "ar");
  }, [locale, setLocale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: translations[locale],
      dir: locale === "ar" ? "rtl" : "ltr",
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );

  // Set initial dir on mount
  useMemo(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
