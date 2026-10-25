/**
 * Real, volumetric and chargeable weight of each product of a shipment — the
 * part of the calculation the simulator shows as you type. No prices.
 *
 * Each carton is billed at the highest of its real weight, its volumetric
 * weight (length × width × height in cm ÷ 6 000) and 12 kg.
 */
import { MIN_KG_PER_CARTON, VOLUMETRIC_DIVISOR, type GoodsKey } from "./modes";

export type Product = {
  name: string;
  goods: GoodsKey;
  /** Number of identical cartons. */
  cartons: number;
  /** One carton, cm. */
  length: number;
  width: number;
  height: number;
  /** Real weight of one carton, kg. */
  weight: number;
  /** Units, for the classes priced per unit (phones, scooters, bicycles…). */
  units: number;
  /** Contains a battery. */
  battery: boolean;
  /** To be reinforced with wood in our warehouse. */
  reinforce: boolean;
};

export type ProductWeights = { cartons: number; real: number; volumetric: number; chargeable: number; volume: number };

export function productWeights(p: Pick<Product, "cartons" | "length" | "width" | "height" | "weight">): ProductWeights {
  const n = Math.max(0, Math.round(p.cartons));
  const vol = (p.length * p.width * p.height) / VOLUMETRIC_DIVISOR;
  return {
    cartons: n,
    real: n * p.weight,
    volumetric: n * vol,
    chargeable: n * Math.max(p.weight, vol, MIN_KG_PER_CARTON),
    volume: (n * p.length * p.width * p.height) / 1_000_000,
  };
}

export function totalWeights(products: Pick<Product, "cartons" | "length" | "width" | "height" | "weight">[]): ProductWeights {
  return products.map(productWeights).reduce(
    (t, w) => ({
      cartons: t.cartons + w.cartons,
      real: t.real + w.real,
      volumetric: t.volumetric + w.volumetric,
      chargeable: t.chargeable + w.chargeable,
      volume: t.volume + w.volume,
    }),
    { cartons: 0, real: 0, volumetric: 0, chargeable: 0, volume: 0 },
  );
}

/** The oversize surcharge for one carton (RMB), the highest that applies. */
export function oversizeSurcharge(c: { length: number; width: number; height: number; weight: number }): number {
  const [a, b, d] = [c.length, c.width, c.height].sort((x, y) => y - x);
  const girth = a + 2 * (b + d);
  let fee = 0;
  if (c.weight > 40) fee = Math.max(fee, 600);
  else if (c.weight > 30) fee = Math.max(fee, 130);
  if (a > 100 || b > 76) fee = Math.max(fee, 130);
  if (girth > 320) fee = Math.max(fee, 900);
  else if (girth >= 266) fee = Math.max(fee, 120);
  return fee;
}

/** A carton no line will take: over 65 kg, a side over 270 cm, or L + 2(w + h) over 400 cm. */
export function cartonRefused(c: { length: number; width: number; height: number; weight: number }): boolean {
  const [a, b, d] = [c.length, c.width, c.height].sort((x, y) => y - x);
  return c.weight > 65 || a > 270 || a + 2 * (b + d) > 400;
}
