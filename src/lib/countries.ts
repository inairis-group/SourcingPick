/**
 * ISO 3166-1 country list. Names use the locale-aware Intl.DisplayNames API
 * at render time so we don't ship hand-translated names — Node + modern
 * browsers ship CLDR locale data.
 *
 * Values stored on Organization.country are ISO 3166-1 alpha-2 codes.
 */

export type CountryOption = {
  /** ISO 3166-1 alpha-2 code, e.g. "FR". */
  code: string;
  /** Localised country name, e.g. "France" (en) / "France" (fr) / "法国" (zh). */
  name: string;
};

// Hand-curated list of the alpha-2 codes worth showing. Skips deprecated and
// micro-territory codes that aren't useful for B2B addresses but keeps every
// recognised sovereign state plus dependent territories with their own ISO
// code (Hong Kong, Macao, Taiwan, etc.) since they're real shipping origins.
const ISO_ALPHA2 = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AS",
  "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF",
  "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR",
  "BS", "BT", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG",
  "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV",
  "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ",
  "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK",
  "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH",
  "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GT", "GU", "GW",
  "GY", "HK", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM",
  "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP",
  "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY",
  "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU",
  "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU",
  "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG",
  "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE",
  "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT",
  "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB",
  "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM",
  "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC",
  "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "US", "UY", "UZ",
  "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE",
  "YT", "ZA", "ZM", "ZW",
];

/** Pre-built option lists per locale, cached after first call. */
const CACHE = new Map<string, CountryOption[]>();

export function countriesFor(locale: import("./i18n/config").Locale): CountryOption[] {
  const cached = CACHE.get(locale);
  if (cached) return cached;
  const display = new Intl.DisplayNames([locale], {
    type: "region",
    fallback: "code",
  });
  const list: CountryOption[] = ISO_ALPHA2.map((code) => {
    let name = code;
    try {
      name = display.of(code) ?? code;
    } catch {
      // Intl.DisplayNames.of throws RangeError on malformed codes; the
      // list is hand-curated so this is defensive only.
    }
    return { code, name };
  }).sort((a, b) => a.name.localeCompare(b.name, locale));
  CACHE.set(locale, list);
  return list;
}

/**
 * Display name for a stored alpha-2 code; falls back to the code itself.
 * Wraps Intl.DisplayNames.of in try/catch — it throws RangeError when the
 * input isn't a structurally valid ISO 3166-1 alpha-2 code, which is
 * exactly the kind of bad data old rows (free-text country) can contain.
 */
export function countryNameFor(
  code: string,
  locale: import("./i18n/config").Locale,
): string {
  if (!code) return "";
  // Quick structural check: alpha-2 codes are exactly two ASCII letters.
  // Fail-fast for anything else without invoking Intl.
  if (!/^[A-Za-z]{2}$/.test(code)) return code;
  try {
    const display = new Intl.DisplayNames([locale], {
      type: "region",
      fallback: "code",
    });
    return display.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
