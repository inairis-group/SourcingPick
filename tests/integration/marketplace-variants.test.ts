import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MarketplaceProductStatus, ReviewStatus } from "@prisma/client";
import {
  prisma,
  resetDb,
  seedBaseFixtures,
  seedOrder,
  type BaseFixtures,
} from "./_helpers.ts";
import {
  readVehicleFacets,
  vehicleWhere,
} from "../../src/lib/marketplace/vehicle-filter.ts";
import {
  averageRating,
  effectiveStock,
  priceRangeCents,
} from "../../src/lib/marketplace/variants.ts";

/**
 * Variants, reviews and vehicle facets.
 *
 * These assert the *queries and invariants* the actions rely on rather than
 * the actions themselves — the actions need an authenticated session, and the
 * parts that actually go wrong under load are the conditional updates and the
 * aggregate recomputation, which are exercisable directly.
 */

let base: BaseFixtures;

before(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

beforeEach(async () => {
  await resetDb();
  base = await seedBaseFixtures();
});

async function seedProduct(
  overrides: Partial<{
    stock: number;
    isUniqueItem: boolean;
    status: MarketplaceProductStatus;
  }> = {},
) {
  return prisma.marketplaceProduct.create({
    data: {
      reference: `MKT-${randomUUID().slice(0, 8)}`,
      factoryOrgId: base.factoryOrg.id,
      name: "Variant fixture",
      category: "TEXTILE",
      description: "Fixture for variant + review assertions.",
      images: [],
      priceCentsClient: 1200,
      priceCentsFactory: 1000,
      moq: 0,
      stockAvailable: overrides.stock ?? 10,
      isUniqueItem: overrides.isUniqueItem ?? false,
      leadTimeDays: 14,
      certifications: [],
      status: overrides.status ?? MarketplaceProductStatus.PUBLISHED,
      testedAndApprovedAt: new Date(),
      depositPercentageBps: 3000,
    },
    select: { id: true },
  });
}

// ---------------------------------------------------------------- variants

test("variant stock is decremented conditionally — the last unit goes to one buyer", async () => {
  const product = await seedProduct();
  const variant = await prisma.marketplaceVariant.create({
    data: {
      productId: product.id,
      label: "Red",
      options: [{ name: "Colour", value: "Red" }],
      stockAvailable: 1,
      position: 0,
    },
    select: { id: true },
  });

  // The guard buy.ts puts on the variant row, run twice concurrently.
  const take = () =>
    prisma.marketplaceVariant.updateMany({
      where: { id: variant.id, stockAvailable: { gte: 1 } },
      data: { stockAvailable: { decrement: 1 } },
    });

  const [a, b] = await Promise.all([take(), take()]);
  assert.equal(
    a.count + b.count,
    1,
    "exactly one of two concurrent buyers may take the last unit",
  );

  const after = await prisma.marketplaceVariant.findUniqueOrThrow({
    where: { id: variant.id },
    select: { stockAvailable: true },
  });
  assert.equal(after.stockAvailable, 0, "stock must never go negative");
});

test("a variant with no price override inherits the listing price", async () => {
  const product = await seedProduct();
  await prisma.marketplaceVariant.createMany({
    data: [
      {
        productId: product.id,
        label: "Inherits",
        options: [],
        stockAvailable: 3,
        position: 0,
      },
      {
        productId: product.id,
        label: "Overrides",
        options: [],
        priceCentsFactory: 1500,
        priceCentsClient: 1900,
        stockAvailable: 4,
        position: 1,
      },
    ],
  });

  const loaded = await prisma.marketplaceProduct.findUniqueOrThrow({
    where: { id: product.id },
    select: {
      priceCentsClient: true,
      stockAvailable: true,
      variants: {
        select: { priceCentsClient: true, stockAvailable: true },
        orderBy: { position: "asc" },
      },
    },
  });

  assert.deepEqual(priceRangeCents(loaded.priceCentsClient, loaded.variants), {
    min: 1200,
    max: 1900,
    varies: true,
  });
  // The product still says 10; once variants exist they are the authority.
  assert.equal(effectiveStock(loaded.stockAvailable, loaded.variants), 7);
});

test("SKUs are unique per listing but reusable across listings", async () => {
  const a = await seedProduct();
  const b = await seedProduct();

  await prisma.marketplaceVariant.create({
    data: {
      productId: a.id,
      label: "A",
      options: [],
      sku: "SHARED-SKU",
      stockAvailable: 1,
      position: 0,
    },
  });

  await assert.rejects(
    prisma.marketplaceVariant.create({
      data: {
        productId: a.id,
        label: "A duplicate",
        options: [],
        sku: "SHARED-SKU",
        stockAvailable: 1,
        position: 1,
      },
    }),
    "the same SKU twice on one listing must be rejected",
  );

  // Two factories can legitimately both call something "SHARED-SKU".
  await prisma.marketplaceVariant.create({
    data: {
      productId: b.id,
      label: "B",
      options: [],
      sku: "SHARED-SKU",
      stockAvailable: 1,
      position: 0,
    },
  });
  assert.equal(
    await prisma.marketplaceVariant.count({ where: { sku: "SHARED-SKU" } }),
    2,
  );
});

test("deleting a variant leaves its orders standing, with the id nulled", async () => {
  const product = await seedProduct();
  const variant = await prisma.marketplaceVariant.create({
    data: {
      productId: product.id,
      label: "Doomed",
      options: [],
      stockAvailable: 1,
      position: 0,
    },
    select: { id: true },
  });

  const { orderId } = await seedOrder(base);
  await prisma.order.update({
    where: { id: orderId },
    data: { marketplaceVariantId: variant.id },
  });

  // onDelete: SetNull, deliberately not Restrict — a factory retiring an
  // option must not be blocked by an order from last year.
  await prisma.marketplaceVariant.delete({ where: { id: variant.id } });

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { id: true, marketplaceVariantId: true, request: { select: { title: true } } },
  });
  assert.equal(
    order.marketplaceVariantId,
    null,
    "the FK is nulled rather than cascading the order away",
  );
  assert.ok(
    order.request.title.length > 0,
    "the human-readable record of what was bought survives on the request",
  );
});

test("a one-of-a-kind listing retires when its single unit sells", async () => {
  const product = await seedProduct({ stock: 1, isUniqueItem: true });

  // Exactly what buy.ts does inside its transaction.
  await prisma.$transaction(async (tx) => {
    const taken = await tx.marketplaceProduct.updateMany({
      where: {
        id: product.id,
        stockAvailable: { gte: 1 },
        status: MarketplaceProductStatus.PUBLISHED,
      },
      data: { stockAvailable: { decrement: 1 }, soldCount: { increment: 1 } },
    });
    assert.equal(taken.count, 1);
    await tx.marketplaceProduct.update({
      where: { id: product.id },
      data: { status: MarketplaceProductStatus.OUT_OF_STOCK },
    });
  });

  const after = await prisma.marketplaceProduct.findUniqueOrThrow({
    where: { id: product.id },
    select: { status: true, stockAvailable: true },
  });
  assert.equal(after.status, MarketplaceProductStatus.OUT_OF_STOCK);
  assert.equal(after.stockAvailable, 0);

  // A sold car must not merely be at zero — it must be unreachable to buy.
  assert.equal(
    await prisma.marketplaceProduct.count({
      where: { id: product.id, status: MarketplaceProductStatus.PUBLISHED },
    }),
    0,
  );
});

// ----------------------------------------------------------------- reviews

async function syncAggregate(productId: string) {
  const agg = await prisma.marketplaceReview.aggregate({
    where: { productId, status: ReviewStatus.PUBLISHED },
    _count: { rating: true },
    _sum: { rating: true },
  });
  await prisma.marketplaceProduct.update({
    where: { id: productId },
    data: {
      ratingCount: agg._count.rating,
      ratingSum: agg._sum.rating ?? 0,
    },
  });
  return prisma.marketplaceProduct.findUniqueOrThrow({
    where: { id: productId },
    select: { ratingCount: true, ratingSum: true },
  });
}

test("only PUBLISHED reviews count toward the rating aggregate", async () => {
  const product = await seedProduct();
  await prisma.marketplaceReview.create({
    data: {
      productId: product.id,
      authorOrgId: base.clientOrg.id,
      rating: 5,
      body: "Pending review, must not count yet.",
      status: ReviewStatus.PENDING,
    },
  });

  let agg = await syncAggregate(product.id);
  assert.equal(agg.ratingCount, 0, "a pending review is not a rating");
  assert.equal(averageRating(agg.ratingSum, agg.ratingCount), null);

  await prisma.marketplaceReview.updateMany({
    where: { productId: product.id },
    data: { status: ReviewStatus.PUBLISHED },
  });
  agg = await syncAggregate(product.id);
  assert.equal(averageRating(agg.ratingSum, agg.ratingCount), 5);

  // Rejecting after the fact has to walk the aggregate back down.
  await prisma.marketplaceReview.updateMany({
    where: { productId: product.id },
    data: { status: ReviewStatus.REJECTED },
  });
  agg = await syncAggregate(product.id);
  assert.equal(agg.ratingCount, 0);
  assert.equal(
    averageRating(agg.ratingSum, agg.ratingCount),
    null,
    "an unrated listing is null, not zero — zero would sort it with the worst",
  );
});

test("an organisation can only review a given listing once", async () => {
  const product = await seedProduct();
  const row = {
    productId: product.id,
    authorOrgId: base.clientOrg.id,
    rating: 4,
    body: "First and only review from this org.",
  };
  await prisma.marketplaceReview.create({ data: row });
  await assert.rejects(
    prisma.marketplaceReview.create({ data: { ...row, rating: 1 } }),
    "a second review from the same org must be rejected by the unique index",
  );
});

// ---------------------------------------------------------------- vehicles

test("vehicle facets narrow to real cars and reject junk input", async () => {
  const car = await seedProduct();
  await prisma.marketplaceProduct.update({
    where: { id: car.id },
    data: {
      category: "VEHICLE",
      vehicle: {
        create: {
          makeName: "Toyota",
          modelName: "Avensis",
          year: 2016,
          mileageKm: 120_000,
          fuel: "DIESEL",
          transmission: "MANUAL",
          hasCoc: true,
        },
      },
    },
  });
  const plain = await seedProduct(); // no VehicleDetail

  const matches = async (raw: Record<string, string>, id: string) =>
    (await prisma.marketplaceProduct.count({
      where: { id, ...vehicleWhere(readVehicleFacets(raw)) },
    })) === 1;

  assert.ok(await matches({ make: "toyota" }, car.id), "make is case-insensitive");
  assert.ok(await matches({ yearMin: "2016" }, car.id));
  assert.ok(!(await matches({ yearMin: "2020" }, car.id)));
  assert.ok(await matches({ kmMax: "150000" }, car.id));
  assert.ok(!(await matches({ kmMax: "100000" }, car.id)));
  assert.ok(!(await matches({ fuel: "PETROL" }, car.id)));

  // A car facet must exclude everything that isn't a car at all.
  assert.ok(
    !(await matches({ fuel: "DIESEL" }, plain.id)),
    "a listing with no VehicleDetail must drop out the moment a car facet is set",
  );

  // Garbage in the URL must not become a filter — it would silently empty
  // the catalogue rather than being ignored.
  assert.deepEqual(vehicleWhere(readVehicleFacets({ fuel: "NOPE" })), {});
  assert.deepEqual(vehicleWhere(readVehicleFacets({ yearMin: "-5" })), {});
  assert.deepEqual(
    vehicleWhere(readVehicleFacets({ kmMax: "9999999999" })),
    {},
  );
  assert.deepEqual(vehicleWhere(readVehicleFacets({})), {});
});
