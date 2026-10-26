/**
 * The price of a shipment from China to Europe, from the carrier's rate card
 * "Tarifs VIP Europe" (26 October) and its rules, with our margin per kilo
 * (rates.ts) and our 3 % commission on everything it adds up.
 *
 * Priced: delivered to the address, taxes included (DDP), by sea or air, on
 * the line the cartons call for (modes.ts: the parcel lines, or the
 * large-parcel lines when a carton is too big or too heavy for UPS and DPD).
 * Taken as a request and quoted by hand: a full container, truck and rail,
 * FOB and delivery to customs, a country or a postcode the line does not
 * serve, a carton beyond the large-parcel limits, and the other cases of
 * `routeOf`.
 *
 * Server side only — never import this from a client component.
 */
import {
  COMMISSION_RATE,
  DECLARATION,
  EXTRA_NAME_FEE,
  MAX_DDP_PRODUCTS,
  MIN_KG_DEFAULT,
  MIN_KG_PER_CARTON,
  REINFORCEMENT_USD_PER_M3,
  SINGLE_CARTON_FEE,
  bracketOf,
  carrierFees,
  carrierOf,
  goodsClass,
  overlengthFee,
  routeOf,
  wholeKg,
  type ContainerType,
  type Formula,
  type Line,
  type Mode,
  type QuoteReason,
} from "./modes";
import { ratesFor } from "./rates";
import type { SeaHeavyZone } from "./sea-heavy-zones";
import { productWeights, totalWeights, type Product, type ProductWeights } from "./weights";

export type { QuoteReason } from "./modes";

export type Address = { street: string; postcode: string; city: string; country: string };

export type FreightRequest = {
  formula: Formula;
  mode: Mode;
  address: Address;
  products: Product[];
  /** A separate export declaration. */
  declaration: boolean;
  /** The full containers asked for (mode "container"), quoted by hand. */
  container: { type: ContainerType; count: number } | null;
};

export type Currency = "RMB" | "EUR" | "USD";
export type Money = Record<Currency, number>;

export type LineItem = {
  key:
    | "freight"
    | "goods"
    | "pieces"
    | "units"
    | "singleCarton"
    | "oversize"
    | "crate"
    | "overlength"
    | "extraNames"
    | "declaration"
    | "reinforcement";
  amount: number;
  currency: Currency;
  /** Figures for the line's wording: kilos, rate, units, pages… */
  detail: Record<string, number>;
  /** The product a per-product line is for: its index in `products`. */
  product?: number;
};

type Weighed = {
  /** The card's line the shipment takes; null for the quoted modes. */
  line: Line | null;
  /** The postcode zone, on the large-parcel sea line. */
  zone: SeaHeavyZone | null;
  /** One entry per product with cartons, in the request's order. */
  products: (ProductWeights & { name: string })[];
  /** The shipment's weights, all products together. */
  weights: ProductWeights;
  billedKg: number;
  /** The weight bracket's label; null without a line. */
  bracket: string | null;
};

export type FreightEstimate =
  | (Weighed & {
      ok: true;
      priced: true;
      line: Line;
      bracket: string;
      rate: number;
      items: LineItem[];
      subtotal: Money;
      commission: Money;
      total: Money;
    })
  | (Weighed & { ok: true; priced: false; reason: QuoteReason })
  | { ok: false; reason: "no_products" | "invalid_goods" | "refused_goods" };

const round2 = (n: number) => Math.round(n * 100) / 100;
const money = (rmb = 0, eur = 0, usd = 0): Money => ({ RMB: round2(rmb), EUR: round2(eur), USD: round2(usd) });

export function estimateFreight(req: FreightRequest): FreightEstimate {
  const products = req.products.filter((p) => p.cartons > 0);
  if (!products.length) return { ok: false, reason: "no_products" };
  const classes = products.map((p) => goodsClass(req.mode, p.goods));
  if (classes.some((g) => !g)) return { ok: false, reason: "invalid_goods" };
  if (classes.some((g) => g?.kind === "refused")) return { ok: false, reason: "refused_goods" };

  const country = req.address.country;
  const { line, zone, reason } = routeOf({ formula: req.formula, mode: req.mode, country, postcode: req.address.postcode, products });
  const minKg = line ? MIN_KG_PER_CARTON[line] : MIN_KG_DEFAULT;
  const total = totalWeights(products, minKg);
  const bracket = line ? bracketOf(line, total.chargeable) : null;
  const weighed: Weighed = {
    line,
    zone,
    products: products.map((p) => ({ name: p.name, ...productWeights(p, minKg) })),
    weights: total,
    billedKg: bracket ? bracket.billedKg : wholeKg(total.chargeable),
    bracket: bracket?.label ?? null,
  };

  const rates = line ? ratesFor(line, country, { battery: products.some((p) => p.battery), zone }) : undefined;
  if (reason || !line || !bracket || !rates) return { ...weighed, ok: true, priced: false, reason: reason ?? "country" };

  const rate = rates[bracket.index];
  const items: LineItem[] = [];
  const add = (item: LineItem) => {
    if (item.amount > 0) items.push({ ...item, amount: round2(item.amount) });
  };
  const cartonsOf = (p: Product) => Math.round(p.cartons);

  add({ key: "freight", amount: weighed.billedKg * rate, currency: "RMB", detail: { kg: weighed.billedKg, rate } });
  products.forEach((p, i) => {
    const g = classes[i]!;
    const w = weighed.products[i];
    if (g.kind === "kg") add({ key: "goods", amount: w.chargeable * g.amount, currency: "RMB", detail: { kg: round2(w.chargeable), rate: g.amount }, product: i });
    if (g.kind === "piece") add({ key: "pieces", amount: p.units * g.amount, currency: "RMB", detail: { units: p.units, rate: g.amount }, product: i });
    if (g.kind === "eur") add({ key: "units", amount: p.units * g.amount, currency: "EUR", detail: { units: p.units, rate: g.amount }, product: i });
  });
  if (total.cartons === 1 && line !== "seaHeavy") add({ key: "singleCarton", amount: SINGLE_CARTON_FEE, currency: "RMB", detail: {} });

  // The parcel lines' last-leg carrier: its fee for a carton out of format,
  // and for one that is not a plain cardboard box (reinforced with wood).
  if (line === "sea" || line === "air") {
    const carrier = carrierOf(line, country);
    const sized = products.filter((p) => carrierFees(carrier, p, false).size > 0);
    add({
      key: "oversize",
      amount: sized.reduce((s, p) => s + carrierFees(carrier, p, false).size * cartonsOf(p), 0),
      currency: "RMB",
      detail: { cartons: sized.reduce((s, p) => s + cartonsOf(p), 0) },
    });
    const crated = products.filter((p) => p.reinforce);
    const crate = carrierFees(carrier, products[0], true).crate!;
    add({
      key: "crate",
      amount: crated.reduce((s, p) => s + crate.amount * cartonsOf(p), 0),
      currency: crate.currency,
      detail: { cartons: crated.reduce((s, p) => s + cartonsOf(p), 0), rate: crate.amount },
    });
  }

  // The large-parcel sea line's fee for a piece over 2.4 m.
  if (line === "seaHeavy" && zone) {
    const long = products.map((p) => ({ p, fee: overlengthFee(p, zone, country, weighed.billedKg) })).filter((x) => x.fee);
    if (long.length) {
      add({
        key: "overlength",
        amount: long.reduce((s, x) => s + x.fee!.amount * cartonsOf(x.p), 0),
        currency: long[0].fee!.currency,
        detail: { pieces: long.reduce((s, x) => s + cartonsOf(x.p), 0) },
      });
    }
  }

  // The large-parcel lines take more than five product names, at a fee for each.
  if ((line === "seaHeavy" || line === "airHeavy") && products.length > MAX_DDP_PRODUCTS) {
    const extra = products.length - MAX_DDP_PRODUCTS;
    add({ key: "extraNames", amount: extra * EXTRA_NAME_FEE[line], currency: "RMB", detail: { names: extra, rate: EXTRA_NAME_FEE[line] } });
  }

  if (req.declaration) {
    const d = DECLARATION[line];
    const pages = Math.max(1, Math.ceil(products.length / d.linesPerPage));
    add({ key: "declaration", amount: d.fee + (pages - 1) * d.extraPage, currency: "RMB", detail: { pages: d.extraPage ? pages : 1 } });
  }

  const reinforced = round2(weighed.products.filter((_, i) => products[i].reinforce).reduce((s, w) => s + w.volume, 0));
  add({ key: "reinforcement", amount: reinforced * REINFORCEMENT_USD_PER_M3, currency: "USD", detail: { m3: reinforced, rate: REINFORCEMENT_USD_PER_M3 } });

  const sum = (cur: Currency) => items.filter((i) => i.currency === cur).reduce((s, i) => s + i.amount, 0);
  const subtotal = money(sum("RMB"), sum("EUR"), sum("USD"));
  const commission = money(subtotal.RMB * COMMISSION_RATE, subtotal.EUR * COMMISSION_RATE, subtotal.USD * COMMISSION_RATE);
  return {
    ...weighed,
    ok: true,
    priced: true,
    line,
    bracket: bracket.label,
    rate,
    items,
    subtotal,
    commission,
    total: money(subtotal.RMB + commission.RMB, subtotal.EUR + commission.EUR, subtotal.USD + commission.USD),
  };
}
