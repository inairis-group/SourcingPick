/**
 * Real, volumetric and chargeable weight of each product of a shipment — the
 * part of the calculation the simulator shows as you type. No prices.
 *
 * Each carton is billed at the highest of its real weight, its volumetric
 * weight (length × width × height in cm ÷ 6 000) and the least its line bills
 * a carton: 12 kg, 45 kg on the large-parcel air line (MIN_KG_PER_CARTON).
 */
import { MIN_KG_DEFAULT, VOLUMETRIC_DIVISOR, type GoodsKey } from "./modes";

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
  /** Units, for the classes priced per unit (phones, scooters, bicycles). */
  units: number;
  /** Contains a battery. */
  battery: boolean;
  /** To be reinforced with wood in our warehouse. */
  reinforce: boolean;
};

export type ProductWeights = { cartons: number; real: number; volumetric: number; chargeable: number; volume: number };

type Measured = Pick<Product, "cartons" | "length" | "width" | "height" | "weight">;

export function productWeights(p: Measured, minKg = MIN_KG_DEFAULT): ProductWeights {
  const n = Math.max(0, Math.round(p.cartons));
  const vol = (p.length * p.width * p.height) / VOLUMETRIC_DIVISOR;
  return {
    cartons: n,
    real: n * p.weight,
    volumetric: n * vol,
    chargeable: n * Math.max(p.weight, vol, minKg),
    volume: (n * p.length * p.width * p.height) / 1_000_000,
  };
}

export function totalWeights(products: Measured[], minKg = MIN_KG_DEFAULT): ProductWeights {
  return products.map((p) => productWeights(p, minKg)).reduce(
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
