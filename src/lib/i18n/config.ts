/**
 * The languages the product speaks.
 *
 * Twelve, because the approved 2026-09 canvas draws the public site in twelve
 * and we ported its copy rather than translating it — every string on the
 * marketing pages is the designer's own in all twelve.
 *
 * The application behind the login is a different matter: it is designed in
 * three (French, English, Chinese) and hand-translated into Arabic. The other
 * eight fall back to English there, which `get-dictionary.ts` states plainly
 * rather than hiding. Adding a language here without a dictionary for it is a
 * compile error, by design.
 */
export const locales = [
  "fr",
  "en",
  "zh",
  "es",
  "de",
  "it",
  "pt",
  "nl",
  "ar",
  "ru",
  "tr",
  "pl",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeCookieName = "sp_locale";

/** Endonyms, spelled as the canvas spells them. */
export const localeLabels: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  zh: "中文",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  ar: "العربية",
  ru: "Русский",
  tr: "Türkçe",
  pl: "Polski",
};

/** BCP 47 tags for the `lang` attribute, as the canvas writes them. */
export const localeTags: Record<Locale, string> = {
  fr: "fr",
  en: "en-GB",
  zh: "zh-Hans",
  es: "es",
  de: "de",
  it: "it",
  pt: "pt-PT",
  nl: "nl",
  ar: "ar",
  ru: "ru",
  tr: "tr",
  pl: "pl",
};

/** ltr/rtl direction per locale — used for the <html dir> attribute. */
export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
  en: "ltr",
  zh: "ltr",
  es: "ltr",
  de: "ltr",
  it: "ltr",
  pt: "ltr",
  nl: "ltr",
  ar: "rtl",
  ru: "ltr",
  tr: "ltr",
  pl: "ltr",
};

/**
 * The languages the *product* speaks, as opposed to the site.
 *
 * These four are the ones with a full dictionary, hand-checked email copy, and
 * a value in the database's `Locale` enum. The canvas designs the application
 * in three of them; Arabic was added by hand.
 *
 * The site's other eight have no application copy at all, so anything that
 * reaches the dashboard, an e-mail, or a database column goes through
 * `appLocaleFor` first. Keeping the two sets distinct is what stops a Polish
 * visitor's signup from trying to write `pl` into a column that has no such
 * value — and what stops us pretending the dashboard is translated.
 */
export const appLocales = ["fr", "en", "zh", "ar"] as const;

export type AppLocale = (typeof appLocales)[number];

export function isAppLocale(value: string): value is AppLocale {
  return (appLocales as readonly string[]).includes(value);
}

/**
 * The application language to use for a site language.
 *
 * English for the eight the product does not speak: it is the widest second
 * language among them, and a Dutch or Polish reader is better served by an
 * English dashboard than a French one. Replace an entry here the moment its
 * dictionary lands — nothing else has to change.
 */
export function appLocaleFor(locale: Locale): AppLocale {
  return isAppLocale(locale) ? locale : "en";
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function directionFor(locale: Locale): "ltr" | "rtl" {
  return localeDirections[locale];
}
