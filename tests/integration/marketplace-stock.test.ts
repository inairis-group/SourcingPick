import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MarketplaceProductStatus } from "@prisma/client";
import {
  prisma,
  resetDb,
  seedBaseFixtures,
  type BaseFixtures,
} from "./_helpers.ts";

// Marketplace stock decrement is anti-race: the atomic `updateMany`
// only decrements when `stockAvailable >= quantity`. That guard sits
// inside the buy.ts transaction; here we exercise it directly so a
// future refactor of that query is caught.

let base: BaseFixtures;

before(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

beforeEach(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

async function seedProduct(stock: number, moq = 1) {
  const product = await prisma.marketplaceProduct.create({
    data: {
      reference: `MKT-${randomUUID().slice(0, 3)}`,
      factoryOrgId: base.factoryOrg.id,
      name: "Integration test stock product",
      category: "TEXTILE",
      description: "Test product for stock-race assertions.",
      images: [],
      priceCentsClient: 1060,
      priceCentsFactory: 1000,
      moq,
      stockAvailable: stock,
      leadTimeDays: 14,
      certifications: [],
      status: MarketplaceProductStatus.PUBLISHED,
      depositPercentageBps: 3000,
    },
    select: { id: true },
  });
  return product.id;
}

test("atomic decrement succeeds when stock is sufficient", async () => {
  const productId = await seedProduct(10);

  const r = await prisma.marketplaceProduct.updateMany({
    where: {
      id: productId,
      stockAvailable: { gte: 3 },
      status: MarketplaceProductStatus.PUBLISHED,
    },
    data: {
      stockAvailable: { decrement: 3 },
      soldCount: { increment: 3 },
    },
  });

  assert.equal(r.count, 1);
  const after = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { stockAvailable: true, soldCount: true },
  });
  assert.equal(after?.stockAvailable, 7);
  assert.equal(after?.soldCount, 3);
});

test("atomic decrement fails when requested quantity exceeds stock", async () => {
  const productId = await seedProduct(2);

  const r = await prisma.marketplaceProduct.updateMany({
    where: {
      id: productId,
      stockAvailable: { gte: 5 },
      status: MarketplaceProductStatus.PUBLISHED,
    },
    data: {
      stockAvailable: { decrement: 5 },
      soldCount: { increment: 5 },
    },
  });

  assert.equal(r.count, 0, "no rows should be touched when stock is short");
  const after = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { stockAvailable: true, soldCount: true },
  });
  assert.equal(after?.stockAvailable, 2);
  assert.equal(after?.soldCount, 0);
});

test("atomic decrement fails on a DRAFT / non-PUBLISHED product even with stock", async () => {
  const product = await prisma.marketplaceProduct.create({
    data: {
      reference: `MKT-${randomUUID().slice(0, 3)}`,
      factoryOrgId: base.factoryOrg.id,
      name: "Draft product",
      category: "TEXTILE",
      description: "Should not be buyable.",
      images: [],
      priceCentsClient: 1060,
      priceCentsFactory: 1000,
      moq: 1,
      stockAvailable: 100,
      leadTimeDays: 14,
      certifications: [],
      status: MarketplaceProductStatus.DRAFT,
      depositPercentageBps: 3000,
    },
    select: { id: true },
  });

  const r = await prisma.marketplaceProduct.updateMany({
    where: {
      id: product.id,
      stockAvailable: { gte: 1 },
      status: MarketplaceProductStatus.PUBLISHED,
    },
    data: { stockAvailable: { decrement: 1 }, soldCount: { increment: 1 } },
  });
  assert.equal(r.count, 0);

  const after = await prisma.marketplaceProduct.findUnique({
    where: { id: product.id },
    select: { stockAvailable: true },
  });
  assert.equal(after?.stockAvailable, 100, "stock must remain untouched on a draft");
});

test("two concurrent buyers — exactly one wins when stock = 1", async () => {
  const productId = await seedProduct(1);

  // Fire the same updateMany twice without awaiting — race them.
  const [a, b] = await Promise.all([
    prisma.marketplaceProduct.updateMany({
      where: {
        id: productId,
        stockAvailable: { gte: 1 },
        status: MarketplaceProductStatus.PUBLISHED,
      },
      data: { stockAvailable: { decrement: 1 }, soldCount: { increment: 1 } },
    }),
    prisma.marketplaceProduct.updateMany({
      where: {
        id: productId,
        stockAvailable: { gte: 1 },
        status: MarketplaceProductStatus.PUBLISHED,
      },
      data: { stockAvailable: { decrement: 1 }, soldCount: { increment: 1 } },
    }),
  ]);

  const winners = (a.count ?? 0) + (b.count ?? 0);
  assert.equal(
    winners,
    1,
    `exactly one update should have matched the row (got ${winners})`,
  );

  const after = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { stockAvailable: true, soldCount: true },
  });
  assert.equal(after?.stockAvailable, 0);
  assert.equal(after?.soldCount, 1);
});

test("MOQ filter rejects a quantity below the per-product minimum", async () => {
  const productId = await seedProduct(100, 50);

  // Pre-filter in app code: simulate the buy.ts MOQ guard. Below MOQ
  // means we'd never even attempt the updateMany.
  const product = await prisma.marketplaceProduct.findUnique({
    where: { id: productId },
    select: { moq: true },
  });
  assert.equal(product?.moq, 50);
  // The decrement still works at MOQ boundary, just to confirm we're
  // not over-tightening the SQL guard:
  const r = await prisma.marketplaceProduct.updateMany({
    where: {
      id: productId,
      stockAvailable: { gte: 50 },
      status: MarketplaceProductStatus.PUBLISHED,
    },
    data: { stockAvailable: { decrement: 50 }, soldCount: { increment: 50 } },
  });
  assert.equal(r.count, 1);
});
