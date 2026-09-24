import "server-only";
import { defaultAppLocale, type AppLocale, type Locale } from "./config";
import { mergeDictionary } from "./merge";

/**
 * Server-only dictionary loader. Each locale is dynamically imported so the
 * other locales' translation strings never enter a given response's bundle.
 *
 * The French dictionary is the canonical shape — `Dictionary` is derived
 * from it so TS catches missing keys in the others at compile time.
 */
const loaders = {
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  zh: () => import("./dictionaries/zh.json").then((m) => m.default),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
  it: () => import("./dictionaries/it.json").then((m) => m.default),
  pt: () => import("./dictionaries/pt.json").then((m) => m.default),
  nl: () => import("./dictionaries/nl.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
  tr: () => import("./dictionaries/tr.json").then((m) => m.default),
  pl: () => import("./dictionaries/pl.json").then((m) => m.default),
};

// Compile-time guard: every AppLocale must have a loader. Without this an
// unconfigured locale would only fail at runtime.
type _LocalesCovered = Exclude<AppLocale, keyof typeof loaders> extends never ? true : never;
const _check: _LocalesCovered = true;
void _check;

export type Dictionary = Awaited<ReturnType<typeof loaders.fr>>;

/**
 * The language a key falls back to when its own language has not translated
 * it yet. English rather than French: it is the widest second language among
 * the twelve, and the four original dictionaries are complete in any case.
 */
const FALLBACK: AppLocale = "en";

/**
 * Merged dictionaries, built once per locale per process.
 *
 * Without this the merge would run on every request that renders a page in
 * one of the eight partial languages — 2,800 keys deep-walked to produce a
 * value that cannot change until the next deploy.
 */
const merged = new Map<AppLocale, Promise<Dictionary>>();

async function build(locale: AppLocale): Promise<Dictionary> {
  const own = (await loaders[locale]()) as Partial<Dictionary>;
  if (locale === FALLBACK) return own as Dictionary;
  const base = (await loaders[FALLBACK]()) as Dictionary;
  return mergeDictionary(base, own);
}

/**
 * The dictionary for any of the product's twelve languages.
 *
 * Every language now has its own file; the eight newest are partial and lean
 * on English for what they have not reached yet. Nothing here decides which
 * language a reader gets — that is the route's `[lang]`.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const key: AppLocale = locale;
  let hit = merged.get(key);
  if (!hit) {
    hit = build(key);
    merged.set(key, hit);
  }
  return hit;
}

/** The dictionary used when there is no reader to ask — cron jobs, webhooks. */
export async function getDefaultDictionary(): Promise<Dictionary> {
  return getDictionary(defaultAppLocale);
}
