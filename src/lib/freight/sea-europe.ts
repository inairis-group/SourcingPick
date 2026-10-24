/**
 * Sea freight China → Europe: the carrier's rate card ("Tarifs VIP Europe",
 * 30 July, sheet "Maritime Europe") and every rule it states, turned into a
 * calculation.
 *
 * Server code only reads the rates: the simulator on /livraisons shows the
 * weights and the rules but sends the price by e-mail once the visitor asks
 * for it (see actions.ts), so the rates never reach the browser. The options
 * the form needs (lines, countries, product classes) are in
 * sea-europe-options.ts, without prices.
 *
 * Prices are RMB per chargeable kilo, fuel surcharge and taxes included as the
 * card says; Sourcing Pick adds its 3 % on the freight it re-invoices.
 *
 * Where the card is silent, the reading used here (and printed in the
 * e-mail and on the page) is:
 * - the brackets are 21-70 kg, 71-100 kg and 300 kg+; from 71 to 299 kg the
 *   71-100 kg rate applies, and a shipment is billed at least 21 kg (71 kg on
 *   the lines that start at 71 kg);
 * - volumetric weight is length × width × height (cm) ÷ 6 000, carton by
 *   carton, as on the rest of the card;
 * - of the oversize surcharges that apply to one carton, the highest is
 *   charged; the card's rule (4) on L + 2 × (w + h) (120 RMB from 266 to
 *   320 cm, 900 RMB from 321 to 400 cm) replaces the 600 RMB one of rule (3)
 *   for size, as it says it does.
 */

import {
  SEA_LINES,
  type GoodsClass,
  type SeaLine,
  type SeaRegime,
} from "./sea-europe-options";
import { cartonRefused, cartonWeights, oversizeSurcharge, type Carton } from "./weights";

export { cartonRefused, oversizeSurcharge };

export const COMMISSION_RATE = 0.03;

/** RMB per chargeable kilo: [21-70 kg, 71-299 kg, 300 kg+]; null = not offered. */
export const SEA_RATES: Record<string, readonly [number | null, number, number]> = {
  // Taxes included (DDP) — Amazon warehouses delivered by truck (EU-5).
  "ddp-truck-dtm2": [null, 10.3, 7.4],
  "ddp-truck-haj1": [null, 10.8, 7.9],
  "ddp-truck-wro5": [null, 10.3, 7.4],
  "ddp-truck-cdg7": [null, 11.3, 8.4],
  "ddp-truck-de": [null, 11.3, 8.4],
  // Taxes included — UPS or DPD, carrier chosen by us.
  "ddp-upsdpd-de": [12.0, 10.5, 9.9],
  "ddp-upsdpd-fr": [14.8, 13.3, 10.4],
  "ddp-upsdpd-it-es": [15.8, 14.3, 11.4],
  // Taxes included — UPS.
  "ddp-ups-de": [14.2, 12.2, 11.4],
  "ddp-ups-fr": [15.9, 13.9, 13.2],
  "ddp-ups-it-es": [16.9, 14.9, 13.9],
  "ddp-ups-cz-be-lu-nl-pl": [17.4, 15.4, 14.4],
  "ddp-ups-fi-mc-at-dk": [17.9, 15.9, 14.9],
  "ddp-ups-gr-ie-pt-se-hu": [18.4, 16.4, 15.4],
  "ddp-ups-sk-si-bg-lt-ro": [18.9, 16.9, 15.9],
  // Under the client's VAT number, import VAT deferred — Amazon by truck.
  "vat-truck-dtm2": [10.3, 8.3, 7.3],
  "vat-truck-haj1": [10.7, 8.7, 7.7],
  "vat-truck-wro5-59225": [10.8, 8.8, 7.8],
  "vat-truck-wro5-06126": [10.8, 8.8, 7.8],
  "vat-truck-dtm1": [10.9, 8.9, 7.9],
  "vat-truck-04758": [11.2, 9.2, 8.2],
  "vat-truck-ber8": [11.3, 9.3, 8.3],
  "vat-truck-mhg9": [11.5, 9.5, 8.5],
  "vat-truck-cdg7": [11.8, 9.8, 8.8],
  // Third-party warehouses (4PX, Goodcang, Winit), by truck.
  "vat-truck-3pl": [11.5, 9.5, 8.5],
  // QOT Express (Germany; France and Poland), UPS (Italy, Spain).
  "vat-qot-de": [11.3, 9.3, 8.3],
  "vat-qot-fr-pl": [13.3, 11.3, 10.3],
  "vat-ups-it-es": [14.3, 12.3, 11.3],
};

/** RMB per kilo added for the goods' class (sea). */
const GOODS_SURCHARGE: Record<GoodsClass, number | null> = {
  ordinary: 0,
  plus1: 1,
  plus3: 3,
  plus4: 4,
  refused: null,
};

export type SeaRequest = {
  regime: SeaRegime;
  lineId: string;
  /** The delivery address is not an Amazon warehouse (private or business). */
  nonAmazon: boolean;
  goods: GoodsClass;
  cartons: Carton[];
  /** Number of different products (designations) declared. */
  designations: number;
  /** Mobile phones (+3 RMB each), scooters and treadmills (+7.5 € each), bicycles (+75 € each). */
  phones: number;
  scooters: number;
  bikes: number;
  separateDeclaration: boolean;
  /** Proof of delivery with signature (UPS deliveries). */
  signature: boolean;
};

export type SeaLineItem = {
  key:
    | "freight"
    | "goods"
    | "nonAmazon"
    | "singleCarton"
    | "oversize"
    | "phones"
    | "vatClearance"
    | "declaration"
    | "designations"
    | "signature"
    | "scooters"
    | "bikes";
  /** RMB, or EUR for the per-unit charges the card prices in euros. */
  amount: number;
  currency: "RMB" | "EUR";
  /** Figures for the line's wording: quantity, rate, kilos… */
  detail: Record<string, number>;
};

export type SeaEstimate =
  | {
      ok: true;
      line: SeaLine;
      chargeableKg: number;
      billedKg: number;
      bracket: "21-70" | "71-299" | "300+";
      rate: number;
      items: SeaLineItem[];
      subtotalRmb: number;
      subtotalEur: number;
      commissionRmb: number;
      commissionEur: number;
      totalRmb: number;
      totalEur: number;
    }
  | {
      ok: false;
      reason: "no_line" | "refused_goods" | "refused_carton" | "no_cartons" | "too_many_designations";
    };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function estimateSea(req: SeaRequest): SeaEstimate {
  const line = SEA_LINES.find((l) => l.id === req.lineId && l.regime === req.regime);
  const rates = line ? SEA_RATES[line.id] : undefined;
  if (!line || !rates) return { ok: false, reason: "no_line" };
  const goodsRate = GOODS_SURCHARGE[req.goods];
  if (goodsRate === null) return { ok: false, reason: "refused_goods" };
  const cartons = req.cartons.filter((c) => c.quantity > 0);
  if (!cartons.length) return { ok: false, reason: "no_cartons" };
  if (cartons.some(cartonRefused)) return { ok: false, reason: "refused_carton" };
  if (req.regime === "ddp" && req.designations > 5) return { ok: false, reason: "too_many_designations" };

  const weights = cartonWeights(cartons, line.minKgPerCarton);
  const count = weights.cartons;
  const chargeableKg = weights.chargeable;
  let bracket: "21-70" | "71-299" | "300+";
  let rate: number;
  let billedKg: number;
  if (chargeableKg >= 300) {
    bracket = "300+";
    rate = rates[2];
    billedKg = chargeableKg;
  } else if (chargeableKg > 70 || rates[0] === null || line.minShipmentKg === 71) {
    bracket = "71-299";
    rate = rates[1];
    billedKg = Math.max(chargeableKg, 71);
  } else {
    bracket = "21-70";
    rate = rates[0];
    billedKg = Math.max(chargeableKg, 21);
  }
  billedKg = round2(billedKg);

  const items: SeaLineItem[] = [];
  const rmb = (key: SeaLineItem["key"], amount: number, detail: Record<string, number> = {}) => {
    if (amount > 0) items.push({ key, amount: round2(amount), currency: "RMB", detail });
  };
  rmb("freight", billedKg * rate, { kg: billedKg, rate });
  rmb("goods", billedKg * goodsRate, { kg: billedKg, rate: goodsRate });
  if (req.nonAmazon && line.nonAmazonAllowed) {
    rmb("nonAmazon", Math.max(billedKg * 1, count === 1 ? 100 : 0), { kg: billedKg, rate: 1 });
  }
  if (count === 1) rmb("singleCarton", 80);
  const oversize = cartons.reduce((sum, c) => sum + oversizeSurcharge(c) * c.quantity, 0);
  rmb("oversize", oversize, { cartons: cartons.reduce((n, c) => n + (oversizeSurcharge(c) ? c.quantity : 0), 0) });
  rmb("phones", req.phones * 3, { units: req.phones, rate: 3 });
  if (req.regime === "vat") rmb("vatClearance", 380);
  if (req.separateDeclaration) {
    const pages = Math.max(1, Math.ceil(Math.max(1, req.designations) / 5));
    rmb("declaration", 350 + (pages - 1) * 50, { pages });
  }
  if (req.regime === "vat" && req.designations > 5) {
    rmb("designations", (req.designations - 5) * 30, { extra: req.designations - 5, rate: 30 });
  }
  if (req.signature && line.carrier === "ups") rmb("signature", count * 30, { cartons: count, rate: 30 });
  if (req.scooters > 0) items.push({ key: "scooters", amount: round2(req.scooters * 7.5), currency: "EUR", detail: { units: req.scooters, rate: 7.5 } });
  if (req.bikes > 0) items.push({ key: "bikes", amount: round2(req.bikes * 75), currency: "EUR", detail: { units: req.bikes, rate: 75 } });

  const subtotalRmb = round2(items.filter((i) => i.currency === "RMB").reduce((s, i) => s + i.amount, 0));
  const subtotalEur = round2(items.filter((i) => i.currency === "EUR").reduce((s, i) => s + i.amount, 0));
  const commissionRmb = round2(subtotalRmb * COMMISSION_RATE);
  const commissionEur = round2(subtotalEur * COMMISSION_RATE);
  return {
    ok: true,
    line,
    chargeableKg: round2(chargeableKg),
    billedKg,
    bracket,
    rate,
    items,
    subtotalRmb,
    subtotalEur,
    commissionRmb,
    commissionEur,
    totalRmb: round2(subtotalRmb + commissionRmb),
    totalEur: round2(subtotalEur + commissionEur),
  };
}
