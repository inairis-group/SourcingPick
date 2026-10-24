import type { Locale } from "./config";

/**
 * BCP-47 mapping for Intl.* APIs. Our internal locales are short codes;
 * the Intl APIs want richer tags for sensible defaults.
 *
 * This covers all twelve site languages, not just the four the application is
 * translated into: formatting a price needs no translation, and a Polish
 * reader on the public site should still see "1 250,00 €" the Polish way.
 */
const intlLocale: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  zh: "zh-Hans-CN",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
  nl: "nl-NL",
  ar: "ar-AE",
  ru: "ru-RU",
  tr: "tr-TR",
  pl: "pl-PL",
};

/**
 * EUR formatter — v1 only currency. Returns "1 250,00 €" in fr, "€1,250.00" in en, etc.
 */
export function formatEUR(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Plain number — used for quantities, counts, percentages.
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale[locale], options).format(value);
}

/**
 * Date helpers — `short` for tables, `medium` for cards, `long` for stamps.
 */
export function formatDate(
  date: Date | string,
  locale: Locale,
  style: "short" | "medium" | "long" = "medium",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: style }).format(d);
}

export function formatDateTime(
  date: Date | string,
  locale: Locale,
  style: "short" | "medium" | "long" = "medium",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(intlLocale[locale], {
    dateStyle: style,
    timeStyle: "short",
  }).format(d);
}

/**
 * "il y a 3 jours", "in 2 hours", etc. Picks the most useful unit automatically.
 */
const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

export function formatRelativeTime(date: Date | string, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" });

  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === "second") {
      return formatter.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return formatter.format(diffSeconds, "second");
}

/**
 * A word that agrees with a count, in CLDR plural categories ("1 carton",
 * "3 cartons"; Russian, Polish and Arabic have more forms). `other` is the
 * fallback for a category a language does not list.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export function pluralForm(count: number, locale: Locale, forms: PluralForms): string {
  return forms[new Intl.PluralRules(intlLocale[locale]).select(count)] ?? forms.other;
}
