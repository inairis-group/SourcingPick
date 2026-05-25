import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
  type Locale,
} from "./config";

/**
 * Resolve a Locale from a cookie value, falling back gracefully.
 */
export function localeFromCookie(value: string | undefined): Locale | null {
  if (value && isLocale(value)) return value;
  return null;
}

/**
 * Resolve a Locale from an Accept-Language header using BCP-47 matching.
 *
 * The matcher knows that "fr-CA" should resolve to "fr" if we support fr but
 * not fr-CA — which is exactly the v1 behaviour we want.
 */
export function localeFromAcceptLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const negotiator = new Negotiator({
    headers: { "accept-language": acceptLanguage },
  });
  const languages = negotiator.languages();

  try {
    const matched = match(languages, [...locales], defaultLocale);
    return isLocale(matched) ? matched : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

/**
 * Cookie > Accept-Language > default. Used by the proxy and by Server
 * Actions that need to know the user's locale outside the URL.
 */
export function resolveLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null,
): Locale {
  return (
    localeFromCookie(cookieValue) ?? localeFromAcceptLanguage(acceptLanguage)
  );
}

export { localeCookieName };
