import type { LeadTimeUnit } from "@prisma/client";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Lead time conversion + display helpers.
 *
 * Pure module — no `server-only` — so client forms and server pages can both
 * use it. `MarketplaceProduct.leadTimeDays` is the canonical value (always
 * days), `leadTimeUnit` is just how the factory entered it and how we
 * render it back.
 *
 * 30-day month is the approximation. Round inputs stay round both ways:
 * "2 months" → 60 days → "2 months". Edge cases (e.g. 45 days with
 * unit=MONTH) round to the nearest whole month on display.
 */
const DAYS_PER_MONTH = 30;

/** Convert a user-entered (value, unit) pair to canonical days for storage. */
export function leadTimeToDays(value: number, unit: LeadTimeUnit): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return unit === "MONTH" ? Math.round(value * DAYS_PER_MONTH) : Math.round(value);
}

/** Display value matching the chosen unit — inverse of leadTimeToDays. */
export function leadTimeDisplayValue(
  days: number,
  unit: LeadTimeUnit,
): number {
  if (unit === "MONTH") return Math.max(1, Math.round(days / DAYS_PER_MONTH));
  return days;
}

/** Localised "{n} days" / "{n} months" string used on product detail pages. */
export function formatLeadTime(
  days: number,
  unit: LeadTimeUnit,
  dict: Dictionary,
): string {
  const v = leadTimeDisplayValue(days, unit);
  const suffix =
    unit === "MONTH"
      ? dict.factory.tenders.monthsSuffix
      : dict.factory.tenders.daysSuffix;
  return `${v} ${suffix}`;
}
