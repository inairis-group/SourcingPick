/**
 * Real, volumetric and chargeable weight of a shipment, carton by carton —
 * the part of the calculation the simulator shows as you type. No prices.
 *
 * Each carton is billed at the highest of its real weight, its volumetric
 * weight (length × width × height in cm ÷ 6 000) and the line's minimum per
 * carton (12 kg; 10 kg on the lines delivered by truck).
 */

export const VOLUMETRIC_DIVISOR = 6000;

export type Carton = {
  /** Number of identical cartons. */
  quantity: number;
  /** cm */
  length: number;
  width: number;
  height: number;
  /** Real weight of one carton, kg. */
  weight: number;
};

export function cartonWeights(cartons: Carton[], minKgPerCarton: number) {
  let real = 0;
  let volumetric = 0;
  let chargeable = 0;
  let count = 0;
  let volume = 0;
  for (const c of cartons) {
    const q = Math.max(0, Math.round(c.quantity));
    if (!q) continue;
    const vol = (c.length * c.width * c.height) / VOLUMETRIC_DIVISOR;
    real += q * c.weight;
    volumetric += q * vol;
    chargeable += q * Math.max(c.weight, vol, minKgPerCarton);
    volume += (q * c.length * c.width * c.height) / 1_000_000;
    count += q;
  }
  return { real, volumetric, chargeable, cartons: count, volume };
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

/** A carton the line will not take: over 65 kg, a side over 270 cm, or L + 2(w + h) over 400 cm. */
export function cartonRefused(c: { length: number; width: number; height: number; weight: number }): boolean {
  const [a, b, d] = [c.length, c.width, c.height].sort((x, y) => y - x);
  return c.weight > 65 || a > 270 || a + 2 * (b + d) > 400;
}
