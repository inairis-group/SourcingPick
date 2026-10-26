import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { estimateFreight, type FreightRequest } from "../src/lib/freight/estimate";
import { GOODS, LINE_BRACKETS, LINE_GROUPS, MODES, bracketOf, carrierFees, heavyCarton, routeOf } from "../src/lib/freight/modes";
import { RATES, ratesFor } from "../src/lib/freight/rates";
import { SEA_HEAVY_ZONES, seaHeavyZone } from "../src/lib/freight/sea-heavy-zones";
import { parseFreightRequest } from "../src/lib/freight/request";
import { productWeights } from "../src/lib/freight/weights";
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
  container: null,
};
const to = (country: string, postcode = "") => ({ ...base.address, country, postcode });

const by = (r: ReturnType<typeof estimateFreight>) => {
  assert.ok(r.ok && r.priced, JSON.stringify(r));
  return Object.fromEntries(r.items.map((i) => [i.key, i.amount]));
};
const reason = (r: ReturnType<typeof estimateFreight>) => (r.ok && !r.priced ? r.reason : null);

test("every line's country groups and postcode zones have their rates, one per bracket", () => {
  for (const line of ["sea", "air", "airHeavy"] as const) {
    assert.equal(RATES[line].length, LINE_GROUPS[line].length, line);
    for (const row of RATES[line]) assert.equal(row.length, LINE_BRACKETS[line].length, line);
  }
  assert.equal(RATES.airHeavyBattery.length, LINE_GROUPS.airHeavy.length);
  for (const [country, zones] of Object.entries(SEA_HEAVY_ZONES)) {
    for (const z of zones) assert.equal(RATES.seaHeavy[country]?.[z.zone]?.length, LINE_BRACKETS.seaHeavy.length, `${country} ${z.zone}`);
  }
});

test("our margin is on every rate: +1 RMB/kg by sea, +2 RMB/kg by air", () => {
  assert.deepEqual(ratesFor("sea", "DE"), [13, 11.5, 10.9]);
  assert.deepEqual(ratesFor("air", "DE"), [48, 47, 45, 44]);
  assert.deepEqual(ratesFor("airHeavy", "DE"), [50, 49, 48, 47]);
  assert.deepEqual(ratesFor("airHeavy", "DE", { battery: true }), [60, 59, 58, 57]);
  assert.equal(ratesFor("seaHeavy", "DE", { zone: "B" })?.[0], 22.4);
  assert.equal(ratesFor("seaHeavy", "DE"), undefined);
  assert.equal(ratesFor("sea", "GB"), undefined);
});

test("each product: real, volumetric (÷ 6000) and chargeable weight, with its line's least per carton", () => {
  assert.deepEqual(productWeights({ cartons: 20, length: 60, width: 40, height: 40, weight: 18 }), {
    cartons: 20, real: 360, volumetric: 320, chargeable: 360, volume: 1.92,
  });
  assert.equal(productWeights({ cartons: 2, length: 30, width: 30, height: 30, weight: 5 }).chargeable, 24);
  assert.equal(productWeights({ cartons: 2, length: 30, width: 30, height: 30, weight: 5 }, 45).chargeable, 90);
  assert.equal(productWeights({ cartons: 1, length: 100, width: 60, height: 60, weight: 20 }).chargeable, 60);
});

test("brackets start at the card's lower bounds, and a shipment is billed in whole kilos rounded up", () => {
  assert.equal(bracketOf("air", 60).label, "21–69");
  assert.equal(bracketOf("air", 70).label, "70–99");
  assert.equal(bracketOf("sea", 70.2).billedKg, 71);
  assert.equal(bracketOf("sea", 70.2).label, "71–299");
  assert.equal(bracketOf("sea", 360.0000001).billedKg, 360);
  assert.equal(bracketOf("seaHeavy", 12).billedKg, 30);
  assert.equal(bracketOf("airHeavy", 20).billedKg, 45);
  assert.equal(bracketOf("seaHeavy", 3200).label, "3000+");
});

test("the line follows the cartons: too heavy or too big for UPS and DPD goes to the large-parcel line", () => {
  assert.equal(heavyCarton("air", { length: 60, width: 40, height: 40, weight: 30 }), false);
  assert.equal(heavyCarton("air", { length: 60, width: 40, height: 40, weight: 31 }), true);
  assert.equal(heavyCarton("sea", { length: 60, width: 40, height: 40, weight: 39 }), false);
  assert.equal(heavyCarton("sea", { length: 60, width: 40, height: 40, weight: 40 }), true);
  assert.equal(heavyCarton("sea", { length: 130, width: 65, height: 30, weight: 20 }), true);
  assert.equal(heavyCarton("sea", { length: 120, width: 80, height: 50, weight: 20 }), true);
  const route = (mode: "sea" | "air", weight: number) =>
    routeOf({ formula: "ddp", mode, country: "DE", postcode: "10115", products: [{ ...product({ weight }), goods: "ordinary" }] }).line;
  assert.equal(route("sea", 18), "sea");
  assert.equal(route("sea", 45), "seaHeavy");
  assert.equal(route("air", 18), "air");
  assert.equal(route("air", 35), "airHeavy");
});

test("sea to France, taxes included: 360 kg at the 300 kg+ rate and our margin, plus 3 %", () => {
  const r = estimateFreight(base);
  assert.ok(r.ok && r.priced);
  assert.equal(r.line, "sea");
  assert.equal(r.billedKg, 360);
  assert.equal(r.bracket, "300+");
  assert.equal(r.rate, 11.4);
  assert.deepEqual(by(r), { freight: 4104 });
  assert.equal(r.commission.RMB, 123.12);
  assert.equal(r.total.RMB, 4227.12);
});

test("a single small carton is billed the line's least, plus the single-carton fee", () => {
  const r = estimateFreight({ ...base, products: [product({ cartons: 1, length: 50, width: 40, height: 30, weight: 8 })] });
  assert.ok(r.ok && r.priced);
  assert.equal(r.weights.chargeable, 12);
  assert.equal(r.billedKg, 21);
  assert.equal(r.rate, 15.8);
  assert.deepEqual(by(r), { freight: 331.8, singleCarton: 50 });
});

test("air: the parcel line by UPS, and the large-parcel line from 31 kg a carton (45 kg billed a piece)", () => {
  const air = estimateFreight({ ...base, mode: "air", products: [product({ cartons: 5 })] });
  assert.ok(air.ok && air.priced);
  assert.equal(air.line, "air");
  assert.equal(air.billedKg, 90);
  assert.equal(air.rate, 49);
  const heavy = estimateFreight({ ...base, mode: "air", address: to("DE"), products: [product({ cartons: 2, weight: 35 })] });
  assert.ok(heavy.ok && heavy.priced);
  assert.equal(heavy.line, "airHeavy");
  assert.equal(heavy.billedKg, 90);
  assert.equal(heavy.bracket, "71–100");
  assert.equal(heavy.rate, 49);
  const one = estimateFreight({ ...base, mode: "air", address: to("DE"), products: [product({ cartons: 1, weight: 35 })] });
  assert.deepEqual(by(one), { freight: 2250, singleCarton: 50 });
});

test("battery: accepted by sea, its own rates on the large-parcel air line, a quote on the air parcel line", () => {
  assert.ok(by(estimateFreight({ ...base, products: [product({ battery: true })] })).freight > 0);
  const heavy = estimateFreight({ ...base, mode: "air", address: to("DE"), products: [product({ cartons: 2, weight: 35, battery: true })] });
  assert.ok(heavy.ok && heavy.priced);
  assert.equal(heavy.rate, 59);
  assert.equal(reason(estimateFreight({ ...base, mode: "air", products: [product({ battery: true })] })), "air_battery");
});

test("the large-parcel sea line is priced by postcode zone; a postcode outside its zones is a quote", () => {
  const heavy = (address: FreightRequest["address"], p: Partial<Product> = {}) =>
    estimateFreight({ ...base, address, products: [product({ cartons: 10, length: 80, width: 60, height: 60, weight: 45, ...p })] });
  const berlin = heavy(to("DE", "10115"));
  assert.ok(berlin.ok && berlin.priced);
  assert.equal(berlin.line, "seaHeavy");
  assert.equal(berlin.zone, "B");
  assert.equal(berlin.billedKg, 480);
  assert.equal(berlin.bracket, "300–500");
  assert.equal(berlin.rate, 13.6);
  assert.equal(seaHeavyZone("NL", ""), "A");
  assert.equal(seaHeavyZone("IE", "D02 X285"), "A");
  assert.equal(seaHeavyZone("FR", "06000"), "C");
  assert.equal(reason(heavy(to("FR", "20000"))), "postcode");
  assert.equal(reason(heavy(to("DE", ""))), "postcode");
  assert.equal(reason(heavy(to("GR", "10431"))), "country");
  assert.equal(reason(heavy(to("FR", "75002"), { goods: "kg1" })), "heavy_goods");
  assert.equal(reason(heavy(to("FR", "75002"), { battery: true })), "heavy_goods");
});

test("goods surcharges per product, on that product's chargeable weight; per unit in RMB or euros", () => {
  const r = estimateFreight({
    ...base,
    products: [
      product({ goods: "kg4", cartons: 10 }),
      product({ name: "Téléphones", goods: "phones", cartons: 2, units: 100 }),
      product({ name: "Vélos", goods: "bikes", cartons: 2, length: 110, width: 30, height: 60, weight: 20, units: 2 }),
    ],
  });
  const items = by(r);
  assert.equal(items.goods, 720);
  assert.equal(items.pieces, 300);
  assert.equal(items.units, 150);
  assert.ok(r.ok && r.priced);
  assert.equal(r.subtotal.EUR, 150);
  assert.equal(r.commission.EUR, 4.5);
});

test("the parcel carriers' fees: DPD by sea to France, UPS elsewhere, per carton out of format", () => {
  assert.deepEqual(carrierFees("dpd", { length: 110, width: 30, height: 60, weight: 20 }, false), { size: 50, crate: null });
  assert.equal(carrierFees("dpd", { length: 60, width: 40, height: 40, weight: 33 }, false).size, 350);
  assert.equal(carrierFees("ups", { length: 105, width: 50, height: 40, weight: 20 }, false).size, 240);
  assert.equal(carrierFees("ups", { length: 60, width: 40, height: 40, weight: 25 }, false).size, 240);
  const nl = estimateFreight({ ...base, address: to("NL"), products: [product({ cartons: 3, length: 105, width: 50, height: 40, weight: 20 })] });
  assert.equal(by(nl).oversize, 720);
  const air = estimateFreight({ ...base, mode: "air", products: [product({ cartons: 2, weight: 26 })] });
  assert.equal(by(air).oversize, 480);
});

test("wooden reinforcement: 15 USD per m³, and on the parcel lines the carrier's fee for a crate", () => {
  const fr = estimateFreight({ ...base, products: [product({ reinforce: true }), product({ name: "Autre", cartons: 10 })] });
  assert.ok(fr.ok && fr.priced);
  assert.equal(by(fr).reinforcement, 28.8);
  assert.equal(by(fr).crate, 1600);
  assert.equal(fr.subtotal.USD, 28.8);
  assert.equal(fr.commission.USD, 0.86);
  assert.equal(fr.total.USD, 29.66);
  const nl = estimateFreight({ ...base, address: to("NL"), products: [product({ cartons: 2, reinforce: true })] });
  assert.ok(nl.ok && nl.priced);
  assert.equal(nl.items.find((i) => i.key === "crate")?.currency, "EUR");
  assert.equal(nl.subtotal.EUR, 90);
});

test("the large-parcel sea line: a piece over 2.4 m pays by zone, more than five names pay each", () => {
  const long = (address: FreightRequest["address"], cartons = 1) =>
    estimateFreight({ ...base, address, products: [product({ cartons, length: 250, width: 100, height: 80, weight: 200 })] });
  assert.equal(by(long(to("FR", "75002"))).overlength, 300);
  assert.equal(by(long(to("FR", "06000"))).overlength, 420);
  const nl = long(to("NL"), 6);
  assert.ok(nl.ok && nl.priced);
  assert.equal(nl.items.find((i) => i.key === "overlength")?.currency, "EUR");
  assert.equal(by(nl).overlength, 1500);
  const seven = Array.from({ length: 7 }, (_, i) => product({ name: `P${i}`, cartons: 1, weight: 45 }));
  assert.equal(by(estimateFreight({ ...base, products: seven })).extraNames, 60);
  assert.equal(by(estimateFreight({ ...base, mode: "air", address: to("DE"), products: seven })).extraNames, 70);
});

test("separate export declaration, line by line", () => {
  const five = Array.from({ length: 5 }, (_, i) => product({ name: `P${i}`, cartons: 1 }));
  assert.equal(by(estimateFreight({ ...base, declaration: true, products: five })).declaration, 350);
  assert.equal(by(estimateFreight({ ...base, mode: "air", declaration: true, products: five })).declaration, 350);
  const seven = Array.from({ length: 7 }, (_, i) => product({ name: `P${i}`, cartons: 1, weight: 45 }));
  assert.equal(by(estimateFreight({ ...base, declaration: true, products: seven })).declaration, 400);
  assert.equal(by(estimateFreight({ ...base, mode: "air", address: to("DE"), declaration: true, products: seven })).declaration, 250);
});

test("taken as a request, not priced", () => {
  assert.equal(reason(estimateFreight({ ...base, mode: "container", container: { type: "40hc", count: 1 } })), "container");
  assert.equal(reason(estimateFreight({ ...base, mode: "truck" })), "mode");
  assert.equal(reason(estimateFreight({ ...base, mode: "rail" })), "mode");
  assert.equal(reason(estimateFreight({ ...base, formula: "fob" })), "formula");
  assert.equal(reason(estimateFreight({ ...base, formula: "customs" })), "formula");
  assert.equal(reason(estimateFreight({ ...base, address: to("GB") })), "country");
  assert.equal(reason(estimateFreight({ ...base, products: Array.from({ length: 6 }, (_, i) => product({ name: `P${i}` })) })), "too_many_products");
  assert.equal(reason(estimateFreight({ ...base, mode: "air", address: to("DE"), products: [product({ cartons: 41, weight: 35 })] })), "too_many_pieces");
  assert.equal(reason(estimateFreight({ ...base, mode: "air", address: to("DE"), products: [product({ length: 310, weight: 35 })] })), "out_of_gauge");
  assert.equal(reason(estimateFreight({ ...base, products: [product({ length: 400, weight: 100 })] })), "out_of_gauge");
  assert.equal(reason(estimateFreight({ ...base, products: [product({ weight: 1600 })] })), "out_of_gauge");
});

test("a full container: DDP, DAP or FOB, anywhere in the world; the other modes keep their formulas and countries", () => {
  const raw = (patch: Record<string, unknown>) => ({ ...base, ...patch, address: { ...base.address, ...(patch.address as object) } });
  const container = { mode: "container", container: { type: "20", count: 2 } };
  for (const formula of ["ddp", "dap", "fob"]) assert.ok(parseFreightRequest(raw({ ...container, formula })), formula);
  assert.equal(parseFreightRequest(raw({ ...container, formula: "customs" })), null);
  assert.equal(parseFreightRequest(raw({ formula: "dap" })), null);
  const usa = parseFreightRequest(raw({ ...container, formula: "dap", address: { country: "US" } }));
  assert.ok(usa && usa.container?.count === 2);
  assert.equal(reason(estimateFreight(usa)), "container");
  assert.equal(parseFreightRequest(raw({ address: { country: "US" } })), null);
  assert.equal(parseFreightRequest(raw({ ...container, address: { country: "CN" } })), null);
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
