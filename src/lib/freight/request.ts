/**
 * The simulator's request as the browser sends it (JSON), checked and bounded
 * before it is priced: anything malformed is refused rather than repaired.
 */
import { ALL_COUNTRIES, CONTAINER_TYPES, FORMULAS, MODES, type ContainerType, type Formula, type GoodsKey, type Mode } from "./modes";
import type { FreightRequest } from "./estimate";

const num = (v: unknown, max: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
};
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function parseFreightRequest(raw: unknown): FreightRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (!FORMULAS.includes(r.formula as Formula) || !MODES.includes(r.mode as Mode)) return null;
  const a = (r.address ?? {}) as Record<string, unknown>;
  const country = text(a.country, 2).toUpperCase();
  if (!ALL_COUNTRIES.includes(country)) return null;
  if (!Array.isArray(r.products) || r.products.length === 0 || r.products.length > 30) return null;
  const products = r.products.map((p) => {
    const x = (p ?? {}) as Record<string, unknown>;
    return {
      name: text(x.name, 120),
      goods: text(x.goods, 20) as GoodsKey,
      cartons: Math.round(num(x.cartons, 10_000)),
      length: num(x.length, 1_000),
      width: num(x.width, 1_000),
      height: num(x.height, 1_000),
      weight: num(x.weight, 5_000),
      units: Math.round(num(x.units, 1_000_000)),
      battery: x.battery === true,
      reinforce: x.reinforce === true,
    };
  });
  const mode = r.mode as Mode;
  // A container is quoted from what the visitor knows: the dimensions of its
  // cartons may be left out. Everywhere else they are what the price is made of.
  if (mode !== "container" && products.some((p) => p.cartons > 0 && (!p.length || !p.width || !p.height || !p.weight))) return null;
  let container: FreightRequest["container"] = null;
  if (mode === "container") {
    const x = (r.container ?? {}) as Record<string, unknown>;
    const count = Math.round(num(x.count, 100));
    if (!CONTAINER_TYPES.includes(x.type as ContainerType) || count < 1) return null;
    container = { type: x.type as ContainerType, count };
  }
  return {
    formula: r.formula as Formula,
    mode,
    address: { street: text(a.street, 200), postcode: text(a.postcode, 20), city: text(a.city, 100), country },
    products,
    declaration: r.declaration === true,
    container,
  };
}
