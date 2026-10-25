/**
 * The price of a shipment from China to Europe, from the carrier's rate card
 * "Tarifs VIP Europe" (30 July) and its rules, plus our 3 % commission on
 * everything it adds up.
 *
 * Priced: delivered to the address, taxes included (DDP), by sea, air, truck
 * or rail. Taken as a request and quoted by hand: FOB and delivery to customs
 * (no price on the card), a country the mode does not serve, air goods with a
 * battery (their line serves Amazon and third-party warehouses only), more
 * than five different products where the card caps them, and the classes the
 * card prices "on consultation".
 *
 * Server side only — never import this from a client component.
 */
import {
  COMMISSION_RATE,
  DECLARATION_EXTRA_PAGE_SEA,
  DECLARATION_FEE,
  DECLARATION_LINES_PER_PAGE,
  REINFORCEMENT_USD_PER_M3,
  SINGLE_CARTON_FEE,
  SINGLE_CARTON_FEE_UK_TRUCK,
  TRUCK_BATTERY_FEE,
  bracketOf,
  goodsClass,
  quoteReason,
  type Formula,
  type Mode,
  type QuoteReason,
} from "./modes";
import { ratesFor } from "./rates";

export type { QuoteReason } from "./modes";
import { cartonRefused, oversizeSurcharge, productWeights, totalWeights, type Product, type ProductWeights } from "./weights";

export type Address = { street: string; postcode: string; city: string; country: string };

export type FreightRequest = {
  formula: Formula;
  mode: Mode;
  address: Address;
  products: Product[];
  /** A separate export declaration (sea, air, rail). */
  declaration: boolean;
};

export type Currency = "RMB" | "EUR" | "USD";
export type Money = Record<Currency, number>;

export type LineItem = {
  key: "freight" | "goods" | "pieces" | "units" | "singleCarton" | "oversize" | "battery" | "declaration" | "reinforcement";
  amount: number;
  currency: Currency;
  /** Figures for the line's wording: kilos, rate, units, pages… */
  detail: Record<string, number>;
  /** The product a per-product line is for: its index in `products`. */
  product?: number;
};

type Weighed = {
  /** One entry per product with cartons, in the request's order. */
  products: (ProductWeights & { name: string })[];
  /** The shipment's weights, all products together. */
  weights: ProductWeights;
  billedKg: number;
  bracket: string;
};

export type FreightEstimate =
  | (Weighed & { ok: true; priced: true; rate: number; items: LineItem[]; subtotal: Money; commission: Money; total: Money })
  | (Weighed & { ok: true; priced: false; reason: QuoteReason })
  | { ok: false; reason: "no_products" | "invalid_goods" | "refused_goods" | "refused_carton" };

const round2 = (n: number) => Math.round(n * 100) / 100;
const money = (rmb = 0, eur = 0, usd = 0): Money => ({ RMB: round2(rmb), EUR: round2(eur), USD: round2(usd) });

export function estimateFreight(req: FreightRequest): FreightEstimate {
  const products = req.products.filter((p) => p.cartons > 0);
  if (!products.length) return { ok: false, reason: "no_products" };
  const classes = products.map((p) => goodsClass(req.mode, p.goods));
  if (classes.some((g) => !g)) return { ok: false, reason: "invalid_goods" };
  if (classes.some((g) => g?.kind === "refused")) return { ok: false, reason: "refused_goods" };
  if (products.some(cartonRefused)) return { ok: false, reason: "refused_carton" };

  const country = req.address.country;
  const total = totalWeights(products);
  const { billedKg, index, label } = bracketOf(req.mode, country, total.chargeable);
  const weighed: Weighed = {
    products: products.map((p) => ({ name: p.name, ...productWeights(p) })),
    weights: total,
    billedKg: round2(billedKg),
    bracket: label,
  };

  const reason = quoteReason({ ...req, country, products });
  const rates = ratesFor(req.mode, country);
  if (reason || !rates) return { ...weighed, ok: true, priced: false, reason: reason ?? "country" };

  const rate = rates[index];
  const items: LineItem[] = [];
  const add = (item: LineItem) => {
    if (item.amount > 0) items.push({ ...item, amount: round2(item.amount) });
  };

  add({ key: "freight", amount: weighed.billedKg * rate, currency: "RMB", detail: { kg: weighed.billedKg, rate } });
  products.forEach((p, i) => {
    const g = classes[i]!;
    const w = weighed.products[i];
    if (g.kind === "kg") add({ key: "goods", amount: w.chargeable * g.amount, currency: "RMB", detail: { kg: round2(w.chargeable), rate: g.amount }, product: i });
    if (g.kind === "piece") add({ key: "pieces", amount: p.units * g.amount, currency: "RMB", detail: { units: p.units, rate: g.amount }, product: i });
    if (g.kind === "eur") add({ key: "units", amount: p.units * g.amount, currency: "EUR", detail: { units: p.units, rate: g.amount }, product: i });
  });
  if (total.cartons === 1) {
    add({ key: "singleCarton", amount: req.mode === "truck" && country === "GB" ? SINGLE_CARTON_FEE_UK_TRUCK : SINGLE_CARTON_FEE, currency: "RMB", detail: {} });
  }
  const oversized = products.filter((p) => oversizeSurcharge(p) > 0);
  add({
    key: "oversize",
    amount: oversized.reduce((s, p) => s + oversizeSurcharge(p) * Math.round(p.cartons), 0),
    currency: "RMB",
    detail: { cartons: oversized.reduce((s, p) => s + Math.round(p.cartons), 0) },
  });
  if (req.mode === "truck" && products.some((p) => p.battery)) add({ key: "battery", amount: TRUCK_BATTERY_FEE, currency: "RMB", detail: {} });
  if (req.declaration && req.mode !== "truck") {
    const pages = Math.max(1, Math.ceil(products.length / DECLARATION_LINES_PER_PAGE));
    const extra = req.mode === "sea" ? (pages - 1) * DECLARATION_EXTRA_PAGE_SEA : 0;
    add({ key: "declaration", amount: DECLARATION_FEE + extra, currency: "RMB", detail: { pages: req.mode === "sea" ? pages : 1 } });
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
    rate,
    items,
    subtotal,
    commission,
    total: money(subtotal.RMB + commission.RMB, subtotal.EUR + commission.EUR, subtotal.USD + commission.USD),
  };
}
