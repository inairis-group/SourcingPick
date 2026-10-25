import { COUNTRY_GROUPS, type Mode } from "./modes";

/**
 * RMB per billed kilo, taxes included (DDP), from the carrier's rate card
 * "Tarifs VIP Europe" (30 July). One row per country group of COUNTRY_GROUPS,
 * in the same order; one column per weight bracket of BRACKETS.
 *
 * Sea: the lines delivered by UPS or DPD (our choice) where the card has
 * them — Germany, France, Italy, Spain — and by UPS elsewhere. The Amazon
 * warehouse lines are not offered. Truck: the last row is the United Kingdom
 * line (taxes included).
 *
 * Server side only — never import this from a client component: the price
 * is e-mailed once the visitor asks for it (tests/freight.test.ts checks).
 */
export const RATES: Record<Mode, readonly (readonly number[])[]> = {
  sea: [
    [12.0, 10.5, 9.9],
    [14.8, 13.3, 10.4],
    [15.8, 14.3, 11.4],
    [17.4, 15.4, 14.4],
    [17.9, 15.9, 14.9],
    [18.4, 16.4, 15.4],
    [18.9, 16.9, 15.9],
  ],
  air: [
    [48, 46, 45, 44],
    [50, 48, 47, 46],
    [51, 49, 48, 47],
    [56, 51.5, 50.5, 49.5],
  ],
  truck: [
    [20, 19, 19, 18],
    [23, 22, 21, 21],
    [25, 23, 22, 22],
    [30, 27, 26, 26],
    [22, 21, 20, 19],
  ],
  rail: [
    [18, 15, 14],
    [22, 18, 16],
    [23, 19, 17],
    [24, 20, 18],
    [27, 23.5, 18.8],
  ],
};

/** The rates of the group that serves `country`, or undefined. */
export function ratesFor(mode: Mode, country: string): readonly number[] | undefined {
  const i = COUNTRY_GROUPS[mode].findIndex((g) => g.includes(country));
  return i < 0 ? undefined : RATES[mode][i];
}
