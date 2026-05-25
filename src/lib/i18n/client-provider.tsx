"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./get-dictionary";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: I18nContextValue & { children: ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * Read the active locale + dictionary from a client component.
 * Throws if used outside the provider — that's intentional, it's a programmer
 * error to render i18n-aware client UI outside an [lang] subtree.
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}

export function useDictionary(): Dictionary {
  return useI18n().dict;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
