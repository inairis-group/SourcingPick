import "server-only";
import { appLocaleFor, type AppLocale, type Locale } from "./config";

/**
 * Server-only dictionary loader. Each locale is dynamically imported so the
 * other locales' translation strings never enter a given response's bundle.
 *
 * The French dictionary is the canonical shape — `Dictionary` is derived
 * from it so TS catches missing keys in en.json / zh.json at compile time.
 */
const loaders = {
  fr: () => import("./dictionaries/fr.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  zh: () => import("./dictionaries/zh.json").then((m) => m.default),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
};

// Compile-time guard: every AppLocale must have a loader. Without this an
// unconfigured locale would only fail at runtime.
type _LocalesCovered = Exclude<AppLocale, keyof typeof loaders> extends never ? true : never;
const _check: _LocalesCovered = true;
void _check;

export type Dictionary = Awaited<ReturnType<typeof loaders.fr>>;

/**
 * Takes any of the site's twelve languages and returns the nearest dictionary
 * the application actually has — see `appLocaleFor`. The eight the product
 * does not yet speak read the dashboard in English.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return (await loaders[appLocaleFor(locale)]()) as Dictionary;
}
