/**
 * What the simulator offers, mode by mode, without the per-kilo rates (those
 * stay on the server, in rates.ts): the countries each mode delivers to under
 * "taxes included", how its weight brackets fall, the least a shipment is
 * billed, and the product classes of its rate card with their surcharges —
 * those are published in the rules under the form anyway.
 *
 * Source: the carrier's rate card "Tarifs VIP Europe" (30 July), one sheet per
 * mode. Air goods with a battery travel only on the Hong Kong line, which the
 * card reserves for Amazon and third-party warehouses: the simulator quotes
 * them by hand rather than price an address the line does not serve.
 */

export type Mode = "sea" | "air" | "truck" | "rail";
export const MODES: readonly Mode[] = ["sea", "air", "truck", "rail"];
/** Offered, but we advise against them. */
export const DISCOURAGED: readonly Mode[] = ["truck", "rail"];

/**
 * ddp: delivered to the address, duties and taxes paid — priced from the card.
 * fob: handed over at the port or airport of departure in China; customs:
 * carried to customs on arrival, the client collects. Neither has a price on
 * the card: the request is taken and quoted by hand.
 */
export type Formula = "ddp" | "fob" | "customs";
export const FORMULAS: readonly Formula[] = ["ddp", "fob", "customs"];

/** cm³ per volumetric kilo, on every sheet of the card. */
export const VOLUMETRIC_DIVISOR = 6000;
/** Every carton is billed at least this (packaging rules, every sheet). */
export const MIN_KG_PER_CARTON = 12;
/** "Maximum 5 désignations" (sea, air, rail sheets); beyond, a quote. */
export const MAX_DDP_PRODUCTS = 5;
/** Wooden reinforcement in our Guangzhou warehouse, USD per m³. */
export const REINFORCEMENT_USD_PER_M3 = 15;
/** Our commission, on everything the estimate adds up. */
export const COMMISSION_RATE = 0.03;

/** Countries each mode delivers to, taxes included, grouped as the card prices them. */
export const COUNTRY_GROUPS: Record<Mode, readonly (readonly string[])[]> = {
  sea: [["DE"], ["FR"], ["IT", "ES"], ["CZ", "BE", "LU", "NL", "PL"], ["FI", "MC", "AT", "DK"], ["GR", "IE", "PT", "SE", "HU"], ["SK", "SI", "BG", "LT", "RO"]],
  air: [["DE"], ["FR", "CZ", "PL", "NL", "BE"], ["ES", "IT"], ["LU", "BG", "PT", "IE", "DK", "HU", "GR", "LV", "LT", "SK", "FI", "HR", "SI", "AT", "SE", "RO"]],
  truck: [["DE"], ["FR", "CZ", "PL", "NL", "BE"], ["ES", "IT"], ["GR", "IE", "FI", "DK", "LT", "MC", "BG", "PT", "LV", "SK", "SI", "AT", "HU", "LU", "RO", "SE"], ["GB"]],
  rail: [["DE"], ["PL", "CZ", "SK", "AT", "HU"], ["HR", "FI", "ES", "SI", "SE", "IT"], ["FR", "NL", "BE", "BG", "DK", "EE", "LT", "LV", "LU", "MC"], ["GR", "IE", "PT"]],
};

/** Every country one mode or another delivers to: the address picker's list. */
export const ALL_COUNTRIES: readonly string[] = [...new Set(MODES.flatMap((m) => COUNTRY_GROUPS[m].flat()))];

export function servesCountry(mode: Mode, iso: string): boolean {
  return COUNTRY_GROUPS[mode].some((g) => g.includes(iso));
}

/**
 * The weight brackets of a mode, as the card's columns: `from` is the lower
 * bound the card gives each column. A column applies from its lower bound on,
 * and a shipment is billed at least the first column's.
 *
 * Where the card leaves a gap (air: 21-50 then 70-100), the weights in the gap
 * stay in the previous column until the next one's lower bound is reached.
 */
export const BRACKETS: Record<Mode, readonly { from: number; label: string }[]> = {
  sea: [{ from: 21, label: "21–70" }, { from: 71, label: "71–299" }, { from: 300, label: "300+" }],
  air: [{ from: 21, label: "21–69" }, { from: 70, label: "70–99" }, { from: 100, label: "100–299" }, { from: 300, label: "300+" }],
  truck: [{ from: 30, label: "30–70" }, { from: 71, label: "71–100" }, { from: 101, label: "101–499" }, { from: 500, label: "500+" }],
  rail: [{ from: 45, label: "45–74" }, { from: 75, label: "75–299" }, { from: 300, label: "300+" }],
};
/** The UK line of the truck sheet steps down at 300 kg, not 500. */
export const TRUCK_UK_BRACKETS = [{ from: 30, label: "30–70" }, { from: 71, label: "71–100" }, { from: 101, label: "101–299" }, { from: 300, label: "300+" }] as const;

export function bracketsFor(mode: Mode, country: string): readonly { from: number; label: string }[] {
  return mode === "truck" && country === "GB" ? TRUCK_UK_BRACKETS : BRACKETS[mode];
}

/** Billed weight and column for a chargeable weight. */
export function bracketOf(mode: Mode, country: string, chargeableKg: number) {
  const cols = bracketsFor(mode, country);
  const billedKg = Math.max(chargeableKg, cols[0].from);
  let index = 0;
  cols.forEach((c, i) => {
    if (billedKg >= c.from) index = i;
  });
  return { billedKg, index, label: cols[index].label };
}

/**
 * Product classes. `kg`: RMB per chargeable kilo of the product; `piece`: RMB
 * per unit; `eur`: euros per unit; `quote`: priced by hand; `refused`.
 */
export type GoodsKey =
  | "ordinary"
  | "kg1"
  | "kg2"
  | "kg3"
  | "kg4"
  | "kg5"
  | "kg7"
  | "kg8"
  | "phones"
  | "pieces"
  | "scooters"
  | "bikes"
  | "quote"
  | "refused";
export type GoodsClass = { key: GoodsKey; kind: "none" | "kg" | "piece" | "eur" | "quote" | "refused"; amount: number };

const c = (key: GoodsKey, kind: GoodsClass["kind"], amount = 0): GoodsClass => ({ key, kind, amount });

export const GOODS: Record<Mode, readonly GoodsClass[]> = {
  sea: [c("ordinary", "none"), c("kg1", "kg", 1), c("kg3", "kg", 3), c("kg4", "kg", 4), c("phones", "piece", 3), c("scooters", "eur", 7.5), c("bikes", "eur", 75), c("refused", "refused")],
  air: [c("ordinary", "none"), c("kg1", "kg", 1), c("kg2", "kg", 2), c("kg3", "kg", 3), c("kg5", "kg", 5), c("kg7", "kg", 7), c("refused", "refused")],
  truck: [c("ordinary", "none"), c("kg1", "kg", 1), c("kg2", "kg", 2), c("kg3", "kg", 3), c("kg4", "kg", 4), c("kg5", "kg", 5), c("kg8", "kg", 8), c("pieces", "piece", 3), c("phones", "piece", 8), c("quote", "quote"), c("refused", "refused")],
  rail: [c("ordinary", "none"), c("kg1", "kg", 1), c("kg2", "kg", 2), c("kg4", "kg", 4), c("phones", "piece", 3), c("scooters", "eur", 7.5), c("bikes", "eur", 75), c("refused", "refused")],
};

export function goodsClass(mode: Mode, key: string): GoodsClass | undefined {
  return GOODS[mode].find((g) => g.key === key);
}

/** Truck, taxes included: goods with a battery add this per shipment (RMB). */
export const TRUCK_BATTERY_FEE = 100;
/** A shipment of one carton (every sheet); the UK truck line charges 50. */
export const SINGLE_CARTON_FEE = 80;
export const SINGLE_CARTON_FEE_UK_TRUCK = 50;
/** Separate export declaration (sea, air, rail): RMB, and per extra page on the sea sheet (5 lines a page). */
export const DECLARATION_FEE = 350;
export const DECLARATION_EXTRA_PAGE_SEA = 50;
export const DECLARATION_LINES_PER_PAGE = 5;

/** Why a request is taken and quoted by hand instead of priced. */
export type QuoteReason = "formula" | "country" | "air_battery" | "too_many_products" | "goods_quote";

/**
 * Whether the card prices this request, from what the visitor chose — the
 * form knows before asking, and the server decides the same way.
 */
export function quoteReason(req: {
  formula: Formula;
  mode: Mode;
  country: string;
  products: { goods: string; battery: boolean; cartons: number }[];
}): QuoteReason | null {
  const products = req.products.filter((p) => p.cartons > 0);
  if (req.formula !== "ddp") return "formula";
  if (!servesCountry(req.mode, req.country)) return "country";
  if (req.mode === "air" && products.some((p) => p.battery)) return "air_battery";
  if (req.mode !== "truck" && products.length > MAX_DDP_PRODUCTS) return "too_many_products";
  if (products.some((p) => goodsClass(req.mode, p.goods)?.kind === "quote")) return "goods_quote";
  return null;
}
