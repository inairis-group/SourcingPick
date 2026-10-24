import { test } from "node:test";
import assert from "node:assert/strict";
import { cartonRefused, estimateSea, oversizeSurcharge, type SeaRequest } from "../src/lib/freight/sea-europe";
import { SEA_LINES, seaCountries, seaCountryLines } from "../src/lib/freight/sea-europe-options";
import { SEA_RATES } from "../src/lib/freight/sea-europe";

const base: SeaRequest = {
  regime: "ddp",
  lineId: "ddp-ups-fr",
  nonAmazon: false,
  goods: "ordinary",
  cartons: [{ quantity: 20, length: 60, width: 40, height: 40, weight: 18 }],
  designations: 1,
  phones: 0,
  scooters: 0,
  bikes: 0,
  separateDeclaration: false,
  signature: false,
};

test("every line of the card has its rates, and every rate a line", () => {
  assert.deepEqual(new Set(SEA_LINES.map((l) => l.id)), new Set(Object.keys(SEA_RATES)));
});

test("20 cartons of 18 kg to France, UPS, taxes included: 360 kg at the 300 kg+ rate, plus 3 %", () => {
  const r = estimateSea(base);
  assert.ok(r.ok);
  // 60 × 40 × 40 / 6000 = 16 kg volumetric < 18 kg real.
  assert.equal(r.chargeableKg, 360);
  assert.equal(r.bracket, "300+");
  assert.equal(r.rate, 13.2);
  assert.equal(r.subtotalRmb, 4752);
  assert.equal(r.commissionRmb, 142.56);
  assert.equal(r.totalRmb, 4894.56);
});

test("one small carton to a private address: 21 kg minimum, +1 RMB/kg with 100 RMB minimum, single-carton fee", () => {
  const r = estimateSea({
    ...base,
    lineId: "ddp-upsdpd-fr",
    nonAmazon: true,
    cartons: [{ quantity: 1, length: 50, width: 40, height: 30, weight: 8 }],
  });
  assert.ok(r.ok);
  // Volumetric 10 kg, real 8 kg, minimum 12 kg per carton; the shipment is billed 21 kg.
  assert.equal(r.chargeableKg, 12);
  assert.equal(r.billedKg, 21);
  assert.equal(r.rate, 14.8);
  const by = Object.fromEntries(r.items.map((i) => [i.key, i.amount]));
  assert.equal(by.freight, 310.8);
  assert.equal(by.nonAmazon, 100);
  assert.equal(by.singleCarton, 80);
  assert.equal(r.subtotalRmb, 490.8);
  assert.equal(r.totalRmb, 505.52);
});

test("a truck line with no 21-70 kg rate starts at 71 kg; its minimum per carton is 10 kg", () => {
  const r = estimateSea({
    ...base,
    lineId: "ddp-truck-dtm2",
    cartons: [{ quantity: 5, length: 30, width: 30, height: 30, weight: 6 }],
  });
  assert.ok(r.ok);
  assert.equal(r.chargeableKg, 50);
  assert.equal(r.billedKg, 71);
  assert.equal(r.bracket, "71-299");
  assert.equal(r.rate, 10.3);
});

test("71 to 299 kg use the 71-100 kg rate", () => {
  const r = estimateSea({ ...base, cartons: [{ quantity: 10, length: 50, width: 40, height: 40, weight: 15 }] });
  assert.ok(r.ok);
  assert.equal(r.chargeableKg, 150);
  assert.equal(r.bracket, "71-299");
  assert.equal(r.rate, 13.9);
});

test("oversize: the highest surcharge of a carton applies; over-limit cartons are refused", () => {
  assert.equal(oversizeSurcharge({ length: 60, width: 40, height: 40, weight: 18 }), 0);
  assert.equal(oversizeSurcharge({ length: 120, width: 50, height: 50, weight: 25 }), 130);
  assert.equal(oversizeSurcharge({ length: 90, width: 70, height: 70, weight: 20 }), 900);
  assert.equal(oversizeSurcharge({ length: 60, width: 40, height: 40, weight: 35 }), 130);
  assert.equal(oversizeSurcharge({ length: 60, width: 40, height: 40, weight: 45 }), 600);
  assert.equal(cartonRefused({ length: 60, width: 40, height: 40, weight: 66 }), true);
  assert.equal(cartonRefused({ length: 280, width: 10, height: 10, weight: 10 }), true);
  const r = estimateSea({ ...base, cartons: [{ quantity: 1, length: 60, width: 40, height: 40, weight: 70 }] });
  assert.deepEqual(r, { ok: false, reason: "refused_carton" });
});

test("under the client's VAT: 380 RMB customs operation, 30 RMB per designation beyond five", () => {
  const r = estimateSea({ ...base, regime: "vat", lineId: "vat-qot-fr-pl", designations: 7 });
  assert.ok(r.ok);
  const by = Object.fromEntries(r.items.map((i) => [i.key, i.amount]));
  assert.equal(by.vatClearance, 380);
  assert.equal(by.designations, 60);
  assert.equal(r.rate, 10.3);
});

test("taxes included takes five designations at most; refused goods are refused", () => {
  assert.deepEqual(estimateSea({ ...base, designations: 6 }), { ok: false, reason: "too_many_designations" });
  assert.deepEqual(estimateSea({ ...base, goods: "refused" }), { ok: false, reason: "refused_goods" });
});

test("product classes, phones, separate declaration and signature", () => {
  const r = estimateSea({ ...base, goods: "plus3", phones: 10, separateDeclaration: true, designations: 5, signature: true });
  assert.ok(r.ok);
  const by = Object.fromEntries(r.items.map((i) => [i.key, i.amount]));
  assert.equal(by.goods, 1080);
  assert.equal(by.phones, 30);
  assert.equal(by.declaration, 350);
  assert.equal(by.signature, 600);
});

test("scooters and bicycles are priced in euros, apart", () => {
  const r = estimateSea({ ...base, scooters: 2, bikes: 1 });
  assert.ok(r.ok);
  assert.equal(r.subtotalEur, 90);
  assert.equal(r.commissionEur, 2.7);
  assert.equal(r.totalEur, 92.7);
});

test("countries and their lines", () => {
  assert.ok(seaCountries("ddp").includes("RO"));
  assert.deepEqual(seaCountries("vat"), ["DE", "FR", "PL", "IT", "ES"]);
  assert.deepEqual(seaCountryLines("ddp", "FR").map((l) => l.carrier), ["upsDpd", "ups"]);
  assert.deepEqual(seaCountryLines("ddp", "NL").map((l) => l.carrier), ["ups"]);
});

test("a line starts at 71 kg exactly when the card gives it no 21-70 kg rate", () => {
  for (const l of SEA_LINES) assert.equal(l.minShipmentKg === 71, SEA_RATES[l.id][0] === null, l.id);
});
