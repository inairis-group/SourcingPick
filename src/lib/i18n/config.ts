export const locales = ["fr", "en", "zh", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeCookieName = "sp_locale";

export const localeLabels: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  zh: "中文",
  ar: "العربية",
};

/** ltr/rtl direction per locale — used for the <html dir> attribute. */
export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  en: "ltr",
  zh: "ltr",
  ar: "rtl",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function directionFor(locale: Locale): "ltr" | "rtl" {
  return localeDirections[locale];
}
