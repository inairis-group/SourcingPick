import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { estimateFreight, type FreightRequest } from "../src/lib/freight/estimate";
import { BRACKETS, COUNTRY_GROUPS, GOODS, MODES, bracketOf } from "../src/lib/freight/modes";
import { RATES } from "../src/lib/freight/rates";
import { cartonRefused, oversizeSurcharge, productWeights } from "../src/lib/freight/weights";
import type { Product } from "../src/lib/freight/weights";

const product = (p: Partial<Product> = {}): Product => ({
  name: "Lampes",
  goods: "ordinary",
  cartons: 20,
  length: 60,
  width: 40,
  height: 40,
  weight: 18,
  units: 0,
  battery: false,
  reinforce: false,
  ...p,
});

const base: FreightRequest = {
  formula: "ddp",
  mode: "sea",
  address: { street: "1 rue de la Paix", postcode: "75002", city: "Paris", country: "FR" },
  products: [product()],
  declaration: false,
};

const by = (r: ReturnType<typeof estimateFreight>) => {
  assert.ok(r.ok && r.priced, JSON.stringify(r));
  return Object.fromEntries(r.items.map((i) => [i.key, i.amount]));
};

test("every country group has its rates, one per bracket", () => {
  for (const m of MODES) {
    assert.equal(RATES[m].length, COUNTRY_GROUPS[m].length, m);
    for (const row of RATES[m]) assert.equal(row.length, BRACKETS[m].length, m);
  }
});

test("each product: real, volumetric (÷ 6000) and chargeable (highest, 12 kg minimum per carton) weight", () => {
  assert.deepEqual(productWeights({ cartons: 20, length: 60, width: 40, height: 40, weight: 18 }), {
    cartons: 20, real: 360, volumetric: 320, chargeable: 360, volume: 1.92,
  });
  assert.equal(productWeights({ cartons: 2, length: 30, width: 30, height: 30, weight: 5 }).chargeable, 24);
  assert.equal(productWeights({ cartons: 1, length: 100, width: 60, height: 60, weight: 20 }).chargeable, 60);
});

test("sea to France, taxes included: 360 kg at the 300 kg+ rate (UPS/DPD), plus 3 %", () => {
  const r = estimateFreight(base);
  assert.ok(r.ok && r.priced);
  assert.equal(r.billedKg, 360);
  assert.equal(r.bracket, "300+");
  assert.equal(r.rate, 10.4);
  assert.equal(r.subtotal.RMB, 3744);
  assert.equal(r.commission.RMB, 112.32);
  assert.equal(r.total.RMB, 3856.32);
});

test("a single small carton is billed the mode's minimum, plus the single-carton fee", () => {
  const r = estimateFreight({ ...base, products: [product({ cartons: 1, length: 50, width: 40, height: 30, weight: 8 })] });
  assert.ok(r.ok && r.priced);
  assert.equal(r.weights.chargeable, 12);
  assert.equal(r.billedKg, 21);
  assert.equal(r.rate, 14.8);
  assert.deepEqual(by(r), { freight: 310.8, singleCarton: 80 });
});

test("brackets start at the card's lower bounds; the air gap 51-69 kg stays in the first column", () => {
  assert.equal(bracketOf("air", "DE", 60).label, "21–69");
  assert.equal(bracketOf("air", "DE", 70).label, "70–99");
  assert.equal(bracketOf("truck", "DE", 20).billedKg, 30);
  assert.equal(bracketOf("truck", "DE", 300).label, "101–499");
  assert.equal(bracketOf("truck", "GB", 300).label, "300+");
  assert.equal(bracketOf("rail", "FR", 50).billedKg, 50);
  assert.equal(bracketOf("rail", "FR", 30).billedKg, 45);
  assert.equal(bracketOf("sea", "FR", 70.5).label, "21–70");
});

test("air, rail and truck use their own rates and minimums", () => {
  const air = estimateFreight({ ...base, mode: "air", products: [product({ cartons: 5 })] });
  assert.ok(air.ok && air.priced);
  assert.equal(air.billedKg, 90);
  assert.equal(air.rate, 48);
  const rail = estimateFreight({ ...base, mode: "rail", products: [product({ cartons: 2 })] });
  assert.ok(rail.ok && rail.priced);
  assert.equal(rail.billedKg, 45);
  assert.equal(rail.rate, 24);
  const truck = estimateFreight({ ...base, mode: "truck", address: { ...base.address, country: "DE" } });
  assert.ok(truck.ok && truck.priced);
  assert.equal(truck.rate, 19);
});

test("goods surcharges per product, on that product's chargeable weight; per unit in RMB or euros", () => {
  const r = estimateFreight({
    ...base,
    products: [product({ goods: "kg4", cartons: 10 }), product({ name: "Téléphones", goods: "phones", cartons: 2, units: 100 }), product({ name: "Vélos", goods: "bikes", cartons: 2, length: 140, width: 30, height: 70, weight: 25, units: 2 })],
  });
  const items = by(r);
  assert.equal(items.goods, 720);
  assert.equal(items.pieces, 300);
  assert.equal(items.units, 150);
  assert.ok(r.ok && r.priced);
  assert.equal(r.subtotal.EUR, 150);
  assert.equal(r.commission.EUR, 4.5);
});

test("wooden reinforcement: 15 USD per m³ of the reinforced products, and the 3 % applies to it too", () => {
  const r = estimateFreight({ ...base, products: [product({ reinforce: true }), product({ name: "Autre", cartons: 10 })] });
  assert.ok(r.ok && r.priced);
  assert.equal(by(r).reinforcement, 28.8);
  assert.equal(r.subtotal.USD, 28.8);
  assert.equal(r.commission.USD, 0.86);
  assert.equal(r.total.USD, 29.66);
});

test("oversize: the highest surcharge per carton; cartons over the limits are refused", () => {
  assert.equal(oversizeSurcharge({ length: 120, width: 50, height: 50, weight: 25 }), 130);
  assert.equal(oversizeSurcharge({ length: 90, width: 70, height: 70, weight: 20 }), 900);
  assert.equal(cartonRefused({ length: 60, width: 40, height: 40, weight: 66 }), true);
  const r = estimateFreight({ ...base, products: [product({ cartons: 2, length: 120, width: 50, height: 50, weight: 25 })] });
  assert.equal(by(r).oversize, 260);
  assert.deepEqual(estimateFreight({ ...base, products: [product({ weight: 70 })] }), { ok: false, reason: "refused_carton" });
});

test("battery: a fee by truck, a quote by air", () => {
  const truck = estimateFreight({ ...base, mode: "truck", products: [product({ battery: true })] });
  assert.equal(by(truck).battery, 100);
  const air = estimateFreight({ ...base, mode: "air", products: [product({ battery: true })] });
  assert.ok(air.ok && !air.priced && air.reason === "air_battery");
});

test("separate export declaration: 350 RMB, +50 per extra page by sea; none by truck", () => {
  const six = Array.from({ length: 6 }, (_, i) => product({ name: `P${i}`, cartons: 1 }));
  const truck = estimateFreight({ ...base, mode: "truck", declaration: true, products: six });
  assert.equal(by(truck).declaration, undefined);
  const sea = estimateFreight({ ...base, declaration: true, products: six.slice(0, 5) });
  assert.equal(by(sea).declaration, 350);
});

test("taken as a request, not priced: FOB, to customs, an unserved country, more than 5 products, goods on consultation", () => {
  const reason = (r: ReturnType<typeof estimateFreight>) => (r.ok && !r.priced ? r.reason : null);
  assert.equal(reason(estimateFreight({ ...base, formula: "fob" })), "formula");
  assert.equal(reason(estimateFreight({ ...base, formula: "customs" })), "formula");
  assert.equal(reason(estimateFreight({ ...base, address: { ...base.address, country: "GB" } })), "country");
  assert.equal(reason(estimateFreight({ ...base, products: Array.from({ length: 6 }, (_, i) => product({ name: `P${i}` })) })), "too_many_products");
  assert.equal(reason(estimateFreight({ ...base, mode: "truck", products: [product({ goods: "quote" })] })), "goods_quote");
});

test("refused goods and classes another mode does not have", () => {
  assert.deepEqual(estimateFreight({ ...base, products: [product({ goods: "refused" })] }), { ok: false, reason: "refused_goods" });
  assert.deepEqual(estimateFreight({ ...base, products: [product({ goods: "kg7" })] }), { ok: false, reason: "invalid_goods" });
  for (const m of MODES) assert.equal(GOODS[m][0].key, "ordinary");
});

test("no client component imports the rates or the estimate", () => {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(f)) files.push(p);
    }
  };
  walk(join(__dirname, "../src"));
  for (const f of files) {
    const s = readFileSync(f, "utf8");
    if (!/^["']use client["']/.test(s)) continue;
    // Type-only imports are erased and carry no rates; values would.
    assert.ok(!/^import(?!\s+type\b)[^;]*freight\/(rates|estimate)["']/m.test(s), `${f} imports the rates`);
  }
});
