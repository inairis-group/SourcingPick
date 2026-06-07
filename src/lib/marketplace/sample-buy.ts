"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  EscrowStatus,
  MarketplaceProductStatus,
  NotificationType,
  OrderStatus,
  QuoteStatus,
  Role,
  SourcingRegion,
  SourcingRequestOrigin,
  SourcingStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { headers } from "next/headers";
import { applyBuyerMarkup } from "@/lib/orders/pricing";
import { clampDepositBps } from "./buy-helpers";

/**
 * Sample-buy action — partner #31.
 *
 * Mirrors `buyMarketplaceProductAction` but constrained to a single
 * unit at `samplePriceCentsClient`. Materialises a SourcingRequest +
 * Quote + Order all in one transaction, marks the Order with
 * `isSample = true`, and routes the buyer to the order detail page
 * where the standard Wise wire panel handles payment.
 *
 * Stock decrement uses the same anti-race `updateMany` pattern as
 * bulk buys so two simultaneous sample requests can't both win when
 * only one unit remains.
 */

const SampleBuySchema = z.object({
  productId: z.string().min(1),
  deliveryStreet: z.string().trim().min(3).max(200),
  deliveryPostalCode: z.string().trim().min(2).max(20),
  deliveryCity: z.string().trim().min(2).max(100),
  deliveryCountry: z
    .string()
    .trim()
    .length(2, "ISO country code (2 letters).")
    .toUpperCase(),
});

export type SampleBuyResult = { error?: string };

export async function buySampleAction(
  _prev: SampleBuyResult,
  formData: FormData,
): Promise<SampleBuyResult> {
  const user = await requireRole(Role.CLIENT);

  const parsed = SampleBuySchema.safeParse({
    productId: formData.get("productId"),
    deliveryStreet: formData.get("deliveryStreet"),
    deliveryPostalCode: formData.get("deliveryPostalCode"),
    deliveryCity: formData.get("deliveryCity"),
    deliveryCountry: formData.get("deliveryCountry"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const product = await prisma.marketplaceProduct.findFirst({
    where: {
      id: parsed.data.productId,
      status: MarketplaceProductStatus.PUBLISHED,
      blockedAt: null,
      sampleAvailable: true,
    },
    select: {
      id: true,
      name: true,
      category: true,
      priceCentsFactory: true,
      priceCentsClient: true,
      samplePriceCentsClient: true,
      stockAvailable: true,
      leadTimeDays: true,
      factoryOrgId: true,
      depositPercentageBps: true,
      incoterm: true,
    },
  });
  if (!product) {
    return { error: "Product not found or sample unavailable." };
  }
  if (
    !product.samplePriceCentsClient ||
    product.samplePriceCentsClient <= 0
  ) {
    return { error: "Sample price not set." };
  }
  if (product.stockAvailable < 1) {
    return { error: "Out of stock — no sample available." };
  }

  // Sample uses the listing's deposit % too (typical 30 %).
  const depositBps = clampDepositBps(product.depositPercentageBps);
  const totalClient = product.samplePriceCentsClient;
  const depositCents = Math.round((totalClient * depositBps) / 10000);
  const balanceCents = totalClient - depositCents;
  // Per-unit factory price derived from the sample price's implied
  // ratio: we keep the same factory margin proportion so the platform
  // doesn't quietly absorb sample shipping subsidy.
  const unitFactory = Math.round(
    product.samplePriceCentsClient /
      (product.priceCentsClient / product.priceCentsFactory),
  );
  const marginCents = totalClient - unitFactory;
  const commissionCents = Math.round(marginCents * 0.6);

  const [reqReference, orderReference] = await Promise.all([
    generateUniqueReference("REQ"),
    generateUniqueReference("ORD"),
  ]);
  const deadline = new Date(
    Date.now() + Math.max(7, product.leadTimeDays) * 24 * 60 * 60 * 1000,
  );

  let orderId: string;
  try {
    orderId = await prisma.$transaction(async (tx) => {
      const stockUpdate = await tx.marketplaceProduct.updateMany({
        where: {
          id: product.id,
          stockAvailable: { gte: 1 },
          status: MarketplaceProductStatus.PUBLISHED,
          blockedAt: null,
        },
        data: {
          stockAvailable: { decrement: 1 },
          soldCount: { increment: 1 },
        },
      });
      if (stockUpdate.count === 0) throw new Error("OUT_OF_STOCK");

      const request = await tx.sourcingRequest.create({
        data: {
          reference: reqReference,
          clientOrgId: user.organizationId,
          createdByUserId: user.id,
          title: `${product.name} (sample)`,
          category: product.category,
          quantity: 1,
          deadline,
          deliveryAddress: `${parsed.data.deliveryStreet}, ${parsed.data.deliveryPostalCode} ${parsed.data.deliveryCity}, ${parsed.data.deliveryCountry}`,
          deliveryStreet: parsed.data.deliveryStreet,
          deliveryPostalCode: parsed.data.deliveryPostalCode,
          deliveryCity: parsed.data.deliveryCity,
          deliveryCountry: parsed.data.deliveryCountry,
          incoterm: product.incoterm,
          sourcingRegion: SourcingRegion.ANYWHERE,
          requiredCerts: [],
          origin: SourcingRequestOrigin.MARKETPLACE,
          status: SourcingStatus.QUOTE_ACCEPTED,
          products: {
            create: [
              { name: `${product.name} (sample)`, quantity: 1, images: [] },
            ],
          },
        },
        select: { id: true },
      });

      const quote = await tx.quote.create({
        data: {
          requestId: request.id,
          factoryOrgId: product.factoryOrgId,
          unitPriceCentsFactory: unitFactory,
          marginCents,
          unitPriceCentsClient: totalClient,
          totalCentsClient: totalClient,
          quantity: 1,
          leadTimeDays: product.leadTimeDays,
          moq: 1,
          incoterm: product.incoterm,
          validUntil: deadline,
          qualificationScore: 100,
          depositPercentageBps: depositBps,
          status: QuoteStatus.ACCEPTED,
        },
        select: { id: true },
      });

      const order = await tx.order.create({
        data: {
          reference: orderReference,
          quoteId: quote.id,
          requestId: request.id,
          clientOrgId: user.organizationId,
          factoryOrgId: product.factoryOrgId,
          totalCents: totalClient,
          depositCents,
          balanceCents,
          commissionCents,
          status: OrderStatus.PAYMENT_PENDING,
          isSample: true,
        },
        select: { id: true },
      });

      return order.id;
    });
  } catch (e) {
    if (e instanceof Error && e.message === "OUT_OF_STOCK") {
      return { error: "Out of stock — no sample available." };
    }
    throw e;
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "marketplace.sample_ordered",
    targetType: "Order",
    targetId: orderId,
    payload: { productId: product.id, sampleCents: totalClient },
  });

  // Notify factory owners.
  const factoryOwnerIds = (
    await prisma.user.findMany({
      where: {
        organizationId: product.factoryOrgId,
        role: Role.FACTORY,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(factoryOwnerIds, {
    type: NotificationType.SYSTEM,
    vars: { systemKey: "marketplace_sample_ordered", reference: orderReference },
    contextType: "Order",
    contextId: orderId,
  });

  revalidatePath("/[lang]/client/orders", "page");
  revalidatePath("/[lang]/factory/orders", "page");

  const locale = await currentLocale();
  redirect(`/${locale}/client/orders/${orderId}`);
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const proxy = h.get("x-locale");
  return proxy && isLocale(proxy) ? proxy : defaultLocale;
}

// Suppress unused-import warnings for the EscrowStatus / applyBuyerMarkup
// helpers that the wider buy pipeline reaches for — keeping the imports
// makes the "sample buy is a slim mirror of buy.ts" relationship
// explicit when reading the file.
void EscrowStatus;
void applyBuyerMarkup;
