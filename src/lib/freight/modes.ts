/**
 * What the simulator offers, mode by mode and line by line, without the
 * per-kilo rates (those stay on the server, in rates.ts): the countries each
 * line delivers to under "taxes included", how its weight brackets fall, the
 * least a carton and a shipment are billed, which line a shipment takes, the
 * carriers' fees for cartons out of format, and the product classes of the
 * card with their surcharges — those are published in the rules anyway.
 *
 * Source: the carrier's rate card "Tarifs VIP Europe" of 26 October. Sea and
 * air are priced from it; it has no price for truck, rail or a full
 * container, so those are quoted by hand. A full container goes anywhere in
 * the world, in DDP, DAP or FOB.
 */
import { SEA_HEAVY_ZONES, seaHeavyZone } from "./sea-heavy-zones";

export type Mode = "sea" | "air" | "container" | "truck" | "rail";
export const MODES: readonly Mode[] = ["sea", "air", "container", "truck", "rail"];
/** Offered, but we advise against them. */
export const DISCOURAGED: readonly Mode[] = ["truck", "rail"];
/** Priced from the card; the others are taken as a request and quoted by hand. */
export const PRICED_MODES: readonly Mode[] = ["sea", "air"];

/**
 * ddp: delivered to the address, duties and taxes paid — priced from the card.
 * fob: handed over at the port or airport of departure in China; customs:
 * carried to customs on arrival, the client collects; dap: delivered to the
 * address, import duties and taxes for the client (full container only).
 * Only DDP by sea and air has a price on the card: the rest is taken and
 * quoted by hand.
 */
export type Formula = "ddp" | "dap" | "fob" | "customs";
export const FORMULAS: readonly Formula[] = ["ddp", "dap", "fob", "customs"];

/** The formulas a mode offers: a full container in DDP, DAP or FOB. */
export function formulasFor(mode: Mode): readonly Formula[] {
  return mode === "container" ? ["ddp", "dap", "fob"] : ["ddp", "fob", "customs"];
}

/** A full container, quoted by hand until its prices are set. */
export type ContainerType = "20" | "40" | "40hc";
export const CONTAINER_TYPES: readonly ContainerType[] = ["20", "40", "40hc"];

/**
 * The card's lines for the priced modes. Standard cartons go by the parcel
 * lines (sea, air), delivered by UPS or DPD; a shipment with a carton those
 * carriers treat as oversize goes by the large-parcel line of its mode
 * (seaHeavy: large parcels and pallets, priced by postcode zone; airHeavy).
 */
export type Line = "sea" | "seaHeavy" | "air" | "airHeavy";
export const LINES: readonly Line[] = ["sea", "seaHeavy", "air", "airHeavy"];

/** cm³ per volumetric kilo, on every sheet of the card. */
export const VOLUMETRIC_DIVISOR = 6000;
/** The least a carton is billed, line by line (the large-parcel air line bills 45 kg a piece). */
export const MIN_KG_PER_CARTON: Record<Line, number> = { sea: 12, air: 12, airHeavy: 45, seaHeavy: 12 };
/** Every carton is billed at least 12 kg on the lines the quoted modes would use. */
export const MIN_KG_DEFAULT = 12;
/** "Maximum 5 désignations" on the parcel lines; beyond, a quote. The large-parcel lines charge for each extra one. */
export const MAX_DDP_PRODUCTS = 5;
/** Each product name beyond the fifth, RMB, on the large-parcel lines. */
export const EXTRA_NAME_FEE: Record<"seaHeavy" | "airHeavy", number> = { seaHeavy: 30, airHeavy: 35 };
/** The large-parcel air line takes at most 40 pieces a shipment. */
export const MAX_AIR_HEAVY_PIECES = 40;
/** Wooden reinforcement in our Guangzhou warehouse, USD per m³. */
export const REINFORCEMENT_USD_PER_M3 = 15;
/** Our commission, on everything the estimate adds up. */
export const COMMISSION_RATE = 0.03;

/** Countries each line delivers to, taxes included, grouped as the card prices them. */
export const LINE_GROUPS: Record<Exclude<Line, "seaHeavy">, readonly (readonly string[])[]> = {
  sea: [["DE"], ["FR"], ["IT", "ES"], ["CZ", "BE", "LU", "NL", "PL"], ["GR", "IE", "PT", "SE", "HU", "FI"], ["SK", "SI", "BG", "LT", "RO", "AT", "DK"]],
  air: [["DE"], ["FR", "CZ", "PL", "NL", "BE"], ["ES", "IT"], ["LU", "BG", "PT", "IE", "DK", "HU", "GR", "LV", "LT", "SK", "FI", "HR", "SI", "AT", "SE", "RO"]],
  airHeavy: [["DE"], ["NL", "LU", "FR"], ["ES", "IE", "IT", "AT", "DK"], ["CZ", "FI", "GR", "HU", "LT", "LV", "PL", "RO", "SE", "SI", "BE", "PT", "HR", "BG", "SK"]],
};

/** Where the quoted modes are asked for: the truck and rail lines of the July card. */
const QUOTED_COUNTRIES = ["GB", "MC", "EE", "LV", "HR", "NO", "CH"];

/** Every country a line or a quoted mode goes to: the address picker's list. */
export const ALL_COUNTRIES: readonly string[] = [
  ...new Set([...Object.values(LINE_GROUPS).flatMap((g) => g.flat()), ...Object.keys(SEA_HEAVY_ZONES), ...QUOTED_COUNTRIES]),
];

/** Where a full container goes: anywhere in the world but China, where it leaves from. */
const WORLD_COUNTRIES: readonly string[] = (
  "AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF " +
  "CG CH CI CK CL CM CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG " +
  "GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW " +
  "KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE " +
  "NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ " +
  "SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU " +
  "WF WS XK YE YT ZA ZM ZW"
).split(" ");

/** The countries the address picker offers for a mode. */
export function countriesFor(mode: Mode): readonly string[] {
  return mode === "container" ? WORLD_COUNTRIES : ALL_COUNTRIES;
}

export function lineServes(line: Line, country: string): boolean {
  return line === "seaHeavy" ? country in SEA_HEAVY_ZONES : LINE_GROUPS[line].some((g) => g.includes(country));
}

/** Whether a priced mode delivers the country on its parcel line (the address picker's hint). */
export function servesCountry(mode: Mode, country: string): boolean {
  if (mode === "sea") return lineServes("sea", country) || lineServes("seaHeavy", country);
  if (mode === "air") return lineServes("air", country) || lineServes("airHeavy", country);
  return false;
}

/**
 * The weight brackets of a line, as the card's columns: `from` is the lower
 * bound the card gives each column. A column applies from its lower bound on,
 * and a shipment is billed at least the first column's.
 *
 * Where the card leaves a gap (air: 21-50 then 70-100), the weights in the gap
 * stay in the previous column until the next one's lower bound is reached;
 * where it skips a range (sea: 71-100 then 300+), likewise.
 */
export const LINE_BRACKETS: Record<Line, readonly { from: number; label: string }[]> = {
  sea: [{ from: 21, label: "21–70" }, { from: 71, label: "71–299" }, { from: 300, label: "300+" }],
  air: [{ from: 21, label: "21–69" }, { from: 70, label: "70–99" }, { from: 100, label: "100–299" }, { from: 300, label: "300+" }],
  airHeavy: [{ from: 45, label: "45–70" }, { from: 71, label: "71–100" }, { from: 101, label: "101–499" }, { from: 500, label: "500+" }],
  seaHeavy: [
    { from: 30, label: "30–49" },
    { from: 50, label: "50–99" },
    { from: 100, label: "100–199" },
    { from: 200, label: "200–299" },
    { from: 300, label: "300–500" },
    { from: 501, label: "501–1000" },
    { from: 1001, label: "1001–1500" },
    { from: 1501, label: "1501–2000" },
    { from: 2001, label: "2001–2999" },
    { from: 3000, label: "3000+" },
  ],
};

/**
 * Billed weight and column for a chargeable weight: the shipment is billed in
 * whole kilos, rounded up ("整票取整"), and at least the first column's.
 */
export function bracketOf(line: Line, chargeableKg: number) {
  const cols = LINE_BRACKETS[line];
  const billedKg = Math.max(wholeKg(chargeableKg), cols[0].from);
  let index = 0;
  cols.forEach((c, i) => {
    if (billedKg >= c.from) index = i;
  });
  return { billedKg, index, label: cols[index].label };
}

/** A weight rounded up to the kilo (a hair of float error does not add one). */
export function wholeKg(kg: number): number {
  return Math.ceil(kg - 1e-6);
}

export type Carton = { length: number; width: number; height: number; weight: number };

/** A carton's sides, longest first, and its girth (longest + 2 × the other two), cm. */
export function sides(c: Carton) {
  const [a, b, d] = [c.length, c.width, c.height].sort((x, y) => y - x);
  return { a, b, d, girth: a + 2 * (b + d) };
}

/**
 * A carton the parcel carriers treat as oversize, which sends the whole
 * shipment to its mode's large-parcel line: by air over 30 kg (the line's UPS
 * limit), a girth over 300 cm or a side of 274 cm; by sea 40 kg and more, a
 * girth over 300 cm, a side over 120 cm with another over 60 cm, or 274 cm.
 */
export function heavyCarton(mode: "sea" | "air", c: Carton): boolean {
  const { a, b, girth } = sides(c);
  if (mode === "air") return c.weight > 30 || girth > 300 || a >= 274;
  return c.weight >= 40 || girth > 300 || (a > 120 && b > 60) || a >= 274;
}

/** Beyond the large-parcel lines' limits: quoted by hand (the card asks to be consulted). */
export function outOfGauge(line: Line, c: Carton): boolean {
  const { a, b, d } = sides(c);
  if (line === "airHeavy") return c.weight > 990 || a > 300 || b > 200 || d > 170;
  if (line === "seaHeavy") return c.weight > 1500 || (c.length * c.width * c.height) / VOLUMETRIC_DIVISOR > 1000 || a > 390 || b > 210 || d > 210;
  return false;
}

/** The line a priced mode's shipment takes, from its cartons; null for the quoted modes. */
export function lineFor(mode: Mode, cartons: Carton[]): Line | null {
  if (mode !== "sea" && mode !== "air") return null;
  const heavy = cartons.some((c) => heavyCarton(mode, c));
  return mode === "sea" ? (heavy ? "seaHeavy" : "sea") : heavy ? "airHeavy" : "air";
}

/**
 * Who delivers the last leg on a parcel line, for its fees: on the sea line to
 * Germany, France, Italy and Spain the carrier assigns UPS or DPD and we count
 * DPD's; everywhere else, and by air, UPS.
 */
export function carrierOf(line: "sea" | "air", country: string): "ups" | "dpd" {
  return line === "sea" && ["DE", "FR", "IT", "ES"].includes(country) ? "dpd" : "ups";
}

/**
 * The last-leg carrier's fees for one carton on a parcel line (the card's
 * "UPS附加费" sheet): its size fee, the highest that applies (RMB), and the
 * fee for a carton that is not a plain cardboard box — a wooden crate.
 *
 * UPS: 240 RMB when a side reaches 100 cm, the second 76 cm, or the carton
 * weighs over 24 kg; 45 € for a crate. DPD: 350 RMB over 31 kg or a side over
 * 120 cm; otherwise 50 RMB over 25 volumetric kilos, 150 litres, or two sides
 * over 60 cm; 80 RMB for a crate.
 */
export function carrierFees(carrier: "ups" | "dpd", c: Carton, crated: boolean) {
  const { a, b } = sides(c);
  if (carrier === "ups") {
    return { size: a >= 100 || b >= 76 || c.weight > 24 ? 240 : 0, crate: crated ? { amount: 45, currency: "EUR" as const } : null };
  }
  const litres = (c.length * c.width * c.height) / 1000;
  const size = c.weight > 31 || a > 120 ? 350 : litres / 6 > 25 || litres > 150 || b > 60 ? 50 : 0;
  return { size, crate: crated ? { amount: 80, currency: "RMB" as const } : null };
}

/**
 * The large-parcel sea line's fee for a long piece, RMB: over 2.4 m, 300; over
 * 3.5 m, 600; times 1.2 in zone B and 1.4 in zone C. To the Netherlands, a
 * piece over 2.4 m on a shipment over a tonne pays 250 € instead.
 */
export function overlengthFee(c: Carton, zone: "A" | "B" | "C", country: string, billedKg: number) {
  const { a } = sides(c);
  if (a <= 240) return null;
  if (country === "NL" && billedKg > 1000) return { amount: 250, currency: "EUR" as const };
  const base = a > 350 ? 600 : 300;
  return { amount: base * (zone === "C" ? 1.4 : zone === "B" ? 1.2 : 1), currency: "RMB" as const };
}

/**
 * Product classes. `kg`: RMB per chargeable kilo of the product; `piece`: RMB
 * per unit; `eur`: euros per unit; `refused`.
 */
export type GoodsKey = "ordinary" | "kg1" | "kg2" | "kg3" | "kg4" | "kg5" | "kg7" | "phones" | "scooters" | "bikes" | "refused";
export type GoodsClass = { key: GoodsKey; kind: "none" | "kg" | "piece" | "eur" | "refused"; amount: number };

const c = (key: GoodsKey, kind: GoodsClass["kind"], amount = 0): GoodsClass => ({ key, kind, amount });

/** The sea sheet's classes. The quoted modes describe the goods with the same list. */
const SEA_GOODS: readonly GoodsClass[] = [c("ordinary", "none"), c("kg1", "kg", 1), c("kg3", "kg", 3), c("kg4", "kg", 4), c("phones", "piece", 3), c("scooters", "eur", 7.5), c("bikes", "eur", 75), c("refused", "refused")];

/**
 * The classes the form offers, mode by mode; the large-parcel lines use their
 * mode's. The quoted modes have no surcharge of their own: their list only
 * says what the goods are, for the quote.
 */
export const GOODS: Record<Mode, readonly GoodsClass[]> = {
  sea: SEA_GOODS,
  air: [c("ordinary", "none"), c("kg1", "kg", 1), c("kg2", "kg", 2), c("kg3", "kg", 3), c("kg5", "kg", 5), c("kg7", "kg", 7), c("refused", "refused")],
  container: SEA_GOODS,
  truck: SEA_GOODS,
  rail: SEA_GOODS,
};

/** Which list of goods a mode shows, for its wording: the quoted modes share one. */
export function goodsSheet(mode: Mode): "sea" | "air" | "quoted" {
  return mode === "sea" || mode === "air" ? mode : "quoted";
}

export function goodsClass(mode: Mode, key: string): GoodsClass | undefined {
  return GOODS[mode].find((g) => g.key === key);
}

/** A shipment of one carton (sea, air, large-parcel air), RMB. */
export const SINGLE_CARTON_FEE = 50;
/**
 * Separate export declaration, RMB: on the sea and air lines 350 a shipment,
 * by sea +50 a page beyond the first (5 lines a page); on the large-parcel air
 * line 200, +50 a page beyond the first (6 lines a page). The large-parcel sea
 * line's sheet gives no fee: the sea line's applies.
 */
export const DECLARATION: Record<Line, { fee: number; extraPage: number; linesPerPage: number }> = {
  sea: { fee: 350, extraPage: 50, linesPerPage: 5 },
  seaHeavy: { fee: 350, extraPage: 50, linesPerPage: 5 },
  air: { fee: 350, extraPage: 0, linesPerPage: 5 },
  airHeavy: { fee: 200, extraPage: 50, linesPerPage: 6 },
};

/** Why a request is taken and quoted by hand instead of priced. */
export type QuoteReason =
  | "formula"
  | "mode"
  | "container"
  | "country"
  | "postcode"
  | "air_battery"
  | "heavy_goods"
  | "out_of_gauge"
  | "too_many_products"
  | "too_many_pieces";

/**
 * The line a request takes and whether the card prices it, from what the
 * visitor entered — the form knows before asking, and the server decides the
 * same way.
 */
export function routeOf(req: {
  formula: Formula;
  mode: Mode;
  country: string;
  postcode: string;
  products: (Carton & { goods: string; battery: boolean; cartons: number })[];
}): { line: Line | null; zone: "A" | "B" | "C" | null; reason: QuoteReason | null } {
  const products = req.products.filter((p) => p.cartons > 0);
  const line = lineFor(req.mode, products);
  const zone = line === "seaHeavy" ? seaHeavyZone(req.country, req.postcode) : null;
  const reason = ((): QuoteReason | null => {
    if (req.mode === "container") return "container";
    if (!line) return "mode";
    if (req.formula !== "ddp") return "formula";
    if (products.some((p) => outOfGauge(line, p))) return "out_of_gauge";
    if (!lineServes(line, req.country)) return "country";
    if (line === "seaHeavy" && !zone) return "postcode";
    if (line === "air" && products.some((p) => p.battery)) return "air_battery";
    if (line === "seaHeavy" && products.some((p) => p.battery || p.goods !== "ordinary")) return "heavy_goods";
    if ((line === "sea" || line === "air") && products.length > MAX_DDP_PRODUCTS) return "too_many_products";
    if (line === "airHeavy" && products.reduce((s, p) => s + Math.round(p.cartons), 0) > MAX_AIR_HEAVY_PIECES) return "too_many_pieces";
    return null;
  })();
  return { line, zone, reason };
}
