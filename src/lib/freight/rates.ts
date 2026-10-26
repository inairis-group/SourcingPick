import { LINE_GROUPS, type Line } from "./modes";
import type { SeaHeavyZone } from "./sea-heavy-zones";

/**
 * RMB per billed kilo, taxes included (DDP), from the carrier's rate card
 * "Tarifs VIP Europe" of 26 October. One row per country group of
 * LINE_GROUPS, in the same order; one column per weight bracket of
 * LINE_BRACKETS. The heavy sea line is priced by postcode zone instead.
 *
 * - sea: the line the carrier delivers by UPS or DPD (its choice) where the
 *   card has one — Germany, France, Italy, Spain — and by UPS elsewhere. The
 *   Amazon warehouse lines are not offered.
 * - air: the direct flights from mainland China, general goods.
 * - airHeavy: the large-parcel air line, general goods and, in its own
 *   sheet, goods with a battery.
 * - seaHeavy: the large-parcel and pallet sea line.
 *
 * Our margin per kilo is added to every one of them (MARGIN_PER_KG), before
 * our 3 % commission. Truck, rail and full containers are quoted by hand: the
 * card has no price for them.
 *
 * Server side only — never import this from a client component: the price
 * is e-mailed once the visitor asks for it (tests/freight.test.ts checks).
 */

/** Our margin, RMB per billed kilo, on top of the carrier's rate. */
export const MARGIN_PER_KG: Record<"sea" | "air", number> = { sea: 1, air: 2 };

const CARD: Record<Exclude<Line, "seaHeavy">, readonly (readonly number[])[]> = {
  sea: [
    [12, 10.5, 9.9],
    [14.8, 13.3, 10.4],
    [15.8, 14.3, 11.4],
    [17.4, 15.4, 14.4],
    [19.5, 16.5, 15],
    [19.5, 16.5, 15],
  ],
  air: [
    [46, 45, 43, 42],
    [48, 47, 46, 45],
    [50, 49, 48, 47],
    [51, 50, 49, 48],
  ],
  airHeavy: [
    [48, 47, 46, 45],
    [49, 48, 47, 46],
    [50, 49, 48, 47],
    [52, 51, 50, 49],
  ],
};

/** The large-parcel air line's sheet for goods with a battery. */
const AIR_HEAVY_BATTERY: readonly (readonly number[])[] = [
  [58, 57, 56, 55],
  [60, 59, 58, 57],
  [62, 61, 60, 59],
  [66, 65, 64, 63],
];

/** Heavy sea line, RMB per billed kilo by country and zone, one value per bracket. */
export const SEA_HEAVY_RATES: Record<string, Partial<Record<SeaHeavyZone, readonly number[]>>> = {
  DE: { A: [18.1, 14.8, 12.3, 11.4, 10.9, 10.9, 10.8, 9.8, 9.6, 9.3], B: [21.4, 17.7, 13.8, 12.9, 12.6, 12.1, 11.6, 11.3, 9.8, 9.8] },
  NL: { A: [17.2, 14.1, 11.9, 10.8, 10.7, 10.7, 10.7, 9.9, 9.6, 9.6] },
  BE: { A: [17.2, 14.1, 11.9, 10.8, 10.7, 10.7, 10.7, 9.9, 9.6, 9.6] },
  LU: { A: [17.2, 14.1, 11.9, 10.8, 10.7, 10.7, 10.7, 9.9, 9.6, 9.6] },
  IT: { A: [22.7, 19.3, 14.7, 13.3, 13, 13, 12.9, 12.2, 12.2, 11.4], B: [26.2, 22.4, 18.3, 16.4, 16.1, 15.3, 15, 14.7, 14.5, 14.2], C: [29.2, 24.9, 18.8, 17, 16.6, 16.3, 16.3, 15.9, 15.7, 15.6] },
  FR: { A: [25.9, 21.4, 17.4, 14.5, 13.9, 13.6, 13.4, 12.4, 11.4, 11.4], B: [26.8, 24.7, 19.4, 16.4, 16.1, 15.7, 15.4, 14.4, 13.2, 13.2], C: [34.9, 29.8, 22.7, 20, 17.9, 16.4, 16.2, 14.9, 14.1, 13.7] },
  ES: { A: [26.8, 22.6, 16.4, 15.8, 15.1, 15, 14.9, 14.2, 13.8, 13.6], B: [26.8, 22.7, 17.7, 16.4, 16.1, 15.9, 15.3, 14.9, 14.3, 13.9] },
  PL: { A: [21.3, 18.3, 13.9, 12.9, 12.6, 12.6, 12.4, 12.4, 12.1, 11.9], B: [22.5, 19.2, 14.9, 13.8, 13.6, 13.4, 13.4, 12.9, 12.3, 12.1] },
  CZ: { A: [19.8, 17, 14.4, 12.9, 12.6, 12.6, 12.4, 12.1, 11.5, 11.2] },
  HU: { A: [21.9, 18.4, 15.4, 13.6, 13.3, 13.1, 13.1, 12.9, 12.7, 12.7], B: [25, 20.5, 16.6, 14.5, 13.8, 13.8, 13.8, 13.4, 13.3, 13.3] },
  SK: { A: [23.6, 20.8, 15.8, 14.6, 14.5, 14.2, 13.5, 13.2, 13, 12.7] },
  LT: { A: [22.9, 20.4, 15.9, 15, 15, 14.8, 14.6, 14.4, 13.1, 13.1], B: [23.8, 21.2, 17.4, 15.3, 15.3, 15, 15, 14.7, 14.5, 14.5] },
  DK: { A: [22.4, 19.1, 15.6, 14.2, 13.5, 13.5, 13.5, 12.2, 11.7, 11.4], B: [27.2, 22.6, 16, 14.6, 14, 13.8, 13.7, 13.4, 13.2, 13.2] },
  LV: { A: [24.2, 21.7, 16.7, 15.7, 15.7, 15.7, 15.7, 14.3, 14.1, 13.6] },
  RO: { A: [27.7, 24.3, 15.8, 15.8, 15.7, 15.6, 15.6, 15.4, 14.6, 14.6], B: [33.9, 29.1, 17.4, 17.3, 17.3, 17.3, 17.3, 16.6, 15.5, 14.9] },
  SE: { A: [22.5, 19.3, 15.7, 14.4, 14.1, 13.8, 13.8, 13.4, 13.3, 13.3], B: [24.9, 21.3, 17, 15.3, 14.9, 14.6, 14.6, 14.2, 14, 14], C: [28.2, 23.9, 18.5, 16.2, 15.5, 15.5, 15.5, 15.1, 14.8, 14.8] },
  AT: { A: [24.3, 20.6, 15.8, 15, 14.6, 14.3, 14, 13.8, 13.6, 12.1], B: [28.7, 24.1, 17.4, 15.4, 14.8, 14.5, 14.5, 14.3, 13.6, 13.6] },
  HR: { A: [34.7, 29.9, 17.4, 15.7, 15.1, 14.9, 14.9, 14.9, 14.1, 14.1], B: [38.1, 33.1, 18.9, 16.9, 16.2, 16, 15.9, 15.5, 15.1, 14.9] },
  EE: { A: [24.4, 21.4, 16.8, 15.8, 15.7, 15, 15, 14.6, 14.4, 13.2], B: [26.9, 23, 17.9, 16.2, 15.7, 15.5, 15.2, 15, 14.7, 14.7] },
  SI: { A: [24.7, 21.9, 16.9, 16.1, 15.9, 15.4, 15.2, 14.8, 14.7, 14.7] },
  BG: { A: [25.2, 23, 17.3, 16.6, 16.4, 16.2, 16.2, 15.8, 14.3, 14.3], B: [26.3, 24.2, 18.9, 17.9, 17.6, 16.9, 16.9, 16.4, 15.4, 14.9] },
  FI: { A: [24.2, 20.8, 17.5, 15.1, 14.7, 14.3, 14.2, 14, 13.9, 13.9], B: [26.8, 23.2, 18.2, 16.3, 15.3, 15.2, 15.2, 15.1, 14.8, 14.8], C: [33.2, 28.5, 18.7, 17.5, 16.7, 16.7, 16.7, 16.4, 16, 16] },
  PT: { A: [23.2, 20.5, 16.7, 15.8, 15.2, 14.8, 14.6, 14.4, 14.1, 14.1], B: [28.7, 24.3, 19.2, 16.9, 16.3, 16.1, 15.8, 15.3, 15.1, 15.1], C: [34.9, 30, 20.5, 18.7, 17.6, 16.4, 16.4, 16.1, 15.8, 14.6] },
  IE: { A: [25.8, 22.5, 17.6, 15.9, 15.7, 15.4, 15.2, 14.8, 14.6, 14.5] },
};

/** The card's rates, as printed, for tests and the admin. */
export const RATES = { ...CARD, airHeavyBattery: AIR_HEAVY_BATTERY, seaHeavy: SEA_HEAVY_RATES } as const;

const marginOf = (line: Line) => (line === "air" || line === "airHeavy" ? MARGIN_PER_KG.air : MARGIN_PER_KG.sea);
const withMargin = (line: Line, row: readonly number[] | undefined) =>
  row?.map((r) => Math.round((r + marginOf(line)) * 100) / 100);

/**
 * What we charge per billed kilo on a line, bracket by bracket — the card's
 * rate and our margin — for the country (and, on the heavy sea line, the
 * postcode zone); undefined where the line does not deliver.
 */
export function ratesFor(line: Line, country: string, opts: { battery?: boolean; zone?: SeaHeavyZone | null } = {}): readonly number[] | undefined {
  if (line === "seaHeavy") return opts.zone ? withMargin(line, SEA_HEAVY_RATES[country]?.[opts.zone]) : undefined;
  const i = LINE_GROUPS[line].findIndex((g) => g.includes(country));
  if (i < 0) return undefined;
  return withMargin(line, line === "airHeavy" && opts.battery ? AIR_HEAVY_BATTERY[i] : CARD[line][i]);
}
