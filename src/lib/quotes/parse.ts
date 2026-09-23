import { QuoteRequestKind, QuoteRequestService } from "@prisma/client";
import { countryCodes } from "@/lib/countries";

/**
 * Reading the public quote form, separated from writing it down.
 *
 * Deliberately pure: no headers, no database, no `"use server"`. The action in
 * `public-request.ts` needs a request context and a connection, which is
 * exactly what makes it awkward to test — whereas every rule about what counts
 * as a valid request lives here and can be checked with a plain FormData.
 *
 * Field names are the design's own element ids, carried through by the porter
 * (see the note in scripts/design/emit.py). They read oddly — `q-qty` — and
 * that is the point: they are not a second naming scheme to keep in step with
 * the artboard, they *are* the artboard's.
 */

const MAX_SHORT = 200;
const MAX_PRODUCTS = 500;
const MAX_MESSAGE = 4000;

export type QuoteRequestError =
  | "missing_products"
  | "missing_country"
  | "missing_name"
  | "invalid_email"
  | "missing_consent";

export type ParsedQuoteRequest = {
  service: QuoteRequestService;
  kind: QuoteRequestKind;
  products: string;
  quantity: string | null;
  volume: string | null;
  goodsValue: string | null;
  supplierCount: string | null;
  supplierCities: string | null;
  destinationCountry: string;
  destinationCity: string | null;
  arrivalDate: string | null;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string | null;
};

/**
 * The canvas draws the radios without values, so a checked one would post
 * "on" and say nothing about which option it was. The porter numbers them by
 * position instead; index 0 is the first option the designer drew, which is
 * why the order of these two lists is load-bearing.
 */
const SERVICE_BY_INDEX = [
  QuoteRequestService.LOGISTICS,
  QuoteRequestService.SOURCING_LOGISTICS,
] as const;

const KIND_BY_INDEX = [QuoteRequestKind.BUSINESS, QuoteRequestKind.INDIVIDUAL] as const;

function pick<T>(table: readonly T[], raw: FormDataEntryValue | null): T {
  const i = Number(raw);
  return Number.isInteger(i) && i >= 0 && i < table.length ? table[i]! : table[0]!;
}

function text(form: FormData, key: string, max = MAX_SHORT): string {
  return String(form.get(key) ?? "")
    .trim()
    .slice(0, max);
}

function optional(form: FormData, key: string, max = MAX_SHORT): string | null {
  const v = text(form, key, max);
  return v.length > 0 ? v : null;
}

export function parseQuoteRequest(
  form: FormData,
): { ok: true; data: ParsedQuoteRequest } | { ok: false; error: QuoteRequestError } {
  const products = text(form, "q-products", MAX_PRODUCTS);
  // Not truncated to two characters before the check: slicing first would
  // turn "FRANCE" into "FR" and record a country the visitor never chose.
  const destinationCountry = text(form, "q-country").toUpperCase();
  const name = text(form, "q-name");
  const email = text(form, "q-email").toLowerCase();

  // Only the four answers needed to reply at all are required, plus consent.
  // The canvas marks nothing else mandatory, and turning away a visitor who
  // does not yet know their cubic metres would lose the lead the page exists
  // to capture.
  if (products.length < 2) return { ok: false, error: "missing_products" };
  // Checked against the list rather than the select that rendered it: this is
  // a public endpoint and the select is only a suggestion.
  if (!countryCodes.includes(destinationCountry)) {
    return { ok: false, error: "missing_country" };
  }
  if (name.length < 2) return { ok: false, error: "missing_name" };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "invalid_email" };
  }
  if (!form.get("consent")) return { ok: false, error: "missing_consent" };

  return {
    ok: true,
    data: {
      service: pick(SERVICE_BY_INDEX, form.get("service")),
      kind: pick(KIND_BY_INDEX, form.get("type")),
      products,
      quantity: optional(form, "q-qty"),
      volume: optional(form, "q-vol"),
      goodsValue: optional(form, "q-val"),
      supplierCount: optional(form, "q-sup"),
      supplierCities: optional(form, "q-cities"),
      destinationCountry,
      destinationCity: optional(form, "q-city"),
      arrivalDate: optional(form, "q-date"),
      name,
      company: optional(form, "q-company"),
      email,
      phone: optional(form, "q-phone"),
      message: optional(form, "q-msg", MAX_MESSAGE),
    },
  };
}
