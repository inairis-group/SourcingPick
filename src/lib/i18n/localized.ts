import type { AppLocale, Locale } from "./config";

/**
 * A value that exists in some of the product's languages and always in
 * English.
 *
 * The product speaks twelve languages and has hand-written copy for four of
 * them in places the JSON dictionaries do not reach: notification bodies,
 * e-mail subjects, the guest-chat auto-replies. Requiring
 * `Record<AppLocale, T>` at those sites would mean writing every one of them
 * in twelve languages before any of them could compile, which is how a
 * translation effort turns into a blocker.
 *
 * So the type says what is actually true: English is guaranteed, the rest is
 * as far as we have got. It is the same bargain `get-dictionary.ts` strikes
 * per key, expressed in the type system rather than at runtime — and it makes
 * the gap visible in the source, since a missing language is a missing key
 * rather than a silent duplicate of the English string.
 */
export type Localized<T> = { en: T } & Partial<Record<AppLocale, T>>;

/**
 * The copy for a reader's language, or English if that language has not been
 * written yet.
 *
 * English rather than the site default (French) on purpose: someone reading
 * the Polish site is far more likely to follow an English notification than a
 * French one.
 */
export function pick<T>(map: Localized<T>, locale: Locale): T {
  return map[locale] ?? map.en;
}
