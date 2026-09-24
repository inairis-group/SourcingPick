/**
 * The languages the product speaks.
 *
 * Twelve, because the approved 2026-09 canvas draws the public site in twelve
 * and we ported its copy rather than translating it — every string on the
 * marketing pages is the designer's own in all twelve.
 *
 * The application behind the login speaks the same twelve. Adding a language
 * here without a dictionary for it is a compile error, by design.
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
 * The languages the *product* speaks.
 *
 * All twelve, since the 2026-09 SaaS canvas: the application is translated
 * into the same set as the site, so nothing has to be downgraded on its way
 * from a marketing page to a dashboard, an e-mail, or a database column.
 *
 * SUPERSEDES the earlier four-language split (fr/en/zh/ar). That split
 * existed because the other eight had no application copy at all; they have
 * their own dictionaries now, filled section by section, with English
 * standing in per key for whatever has not been reached yet — see
 * `get-dictionary.ts`. The distinction between a site language and a product
 * language no longer describes anything real, so `AppLocale` is `Locale` and
 * `appLocaleFor` is the identity. Both are kept rather than deleted: they
 * name an intent ("this value is about to be stored or sent") at roughly a
 * hundred call sites, and that intent still reads well.
 */
export const appLocales = locales;

export type AppLocale = Locale;

export const defaultAppLocale: AppLocale = defaultLocale;

export function isAppLocale(value: string): value is AppLocale {
  return isLocale(value);
}

/**
 * The application language to use for a site language.
 *
 * Now the identity, and deliberately still here: it marks every point where a
 * locale crosses from "what the reader is browsing in" to "what we store or
 * send", which is where a future narrowing would have to go.
 */
export function appLocaleFor(locale: Locale): AppLocale {
  return locale;
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function directionFor(locale: Locale): "ltr" | "rtl" {
  return localeDirections[locale];
}
