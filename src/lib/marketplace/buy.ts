"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import {
  Incoterm,
  MarketplaceProductStatus,
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
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

const BuySchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive("Quantity must be positive."),
  deliveryAddress: z
    .string()
    .trim()
    .min(5, "Delivery address is required.")
    .max(300),
  incoterm: z.enum(Incoterm),
});

export type BuyResult = {
  error?: string;
};

/**
 * One-click marketplace purchase.
 *
 * The marketplace bypasses the agent-led sourcing flow but reuses the
 * Order + escrow + payment infrastructure. We materialise a synthetic
 * SourcingRequest + Quote so downstream code (`finalizeStripePayment`,
 * the order detail UI, messaging threads, etc.) can stay role-agnostic.
 *
 *   SourcingRequest.status = QUOTE_ACCEPTED (skips DRAFT/RECEIVED/ASSIGNED)
 *   Quote.status           = ACCEPTED
 *   Order.status           = PAYMENT_PENDING (client redirected to Stripe)
 *
 * Stock decrement is best-effort: we use a conditional updateMany so two
 * simultaneous buyers can't race past stock=0. If the decrement fails the
 * order isn't created.
 */
export async function buyMarketplaceProductAction(
  _prev: BuyResult,
  formData: FormData,
): Promise<BuyResult> {
  const user = await requireRole(Role.CLIENT);

  const parsed = BuySchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
    deliveryAddress: formData.get("deliveryAddress"),
    incoterm: formData.get("incoterm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const product = await prisma.marketplaceProduct.findFirst({
    where: {
      id: parsed.data.productId,
      status: MarketplaceProductStatus.PUBLISHED,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      category: true,
      priceCentsFactory: true,
      priceCentsClient: true,
      moq: true,
      stockAvailable: true,
      leadTimeDays: true,
      factoryOrgId: true,
    },
  });
  if (!product) return { error: "Product not found or no longer available." };

  if (product.moq > 0 && parsed.data.quantity < product.moq) {
    return {
      error: `Minimum order quantity for this product is ${product.moq}.`,
    };
  }
  if (parsed.data.quantity > product.stockAvailable) {
    return {
      error: `Only ${product.stockAvailable} units in stock.`,
    };
  }

  const unitClient = product.priceCentsClient;
  const unitFactory = product.priceCentsFactory;
  const totalClient = unitClient * parsed.data.quantity;
  const marginCents = totalClient - unitFactory * parsed.data.quantity;
  const depositCents = Math.round(totalClient * 0.3);
  const balanceCents = totalClient - depositCents;
  const deadline = new Date(
    Date.now() + (product.leadTimeDays + 7) * 24 * 60 * 60 * 1000,
  );

  const reqReference = await generateUniqueReference("REQ");
  const ordReference = await generateUniqueReference("ORD");

  let orderId: string;
  try {
    orderId = await prisma.$transaction(async (tx) => {
      // Atomic stock check — fail the whole purchase if two clients race.
      const stockUpdate = await tx.marketplaceProduct.updateMany({
        where: {
          id: product.id,
          stockAvailable: { gte: parsed.data.quantity },
          status: MarketplaceProductStatus.PUBLISHED,
        },
        data: {
          stockAvailable: { decrement: parsed.data.quantity },
          soldCount: { increment: parsed.data.quantity },
        },
      });
      if (stockUpdate.count === 0) {
        throw new Error("OUT_OF_STOCK");
      }

      const request = await tx.sourcingRequest.create({
        data: {
          reference: reqReference,
          clientOrgId: user.organizationId,
          createdByUserId: user.id,
          title: product.name,
          category: product.category,
          quantity: parsed.data.quantity,
          deadline,
          deliveryAddress: parsed.data.deliveryAddress,
          incoterm: parsed.data.incoterm,
          sourcingRegion: SourcingRegion.ANYWHERE,
          requiredCerts: [],
          // Explicit marker so agent-assignment and dispatch surfaces can
          // hard-reject this row regardless of where it ends up in the
          // status machine.
          origin: SourcingRequestOrigin.MARKETPLACE,
          status: SourcingStatus.QUOTE_ACCEPTED,
          products: {
            create: [
              {
                name: product.name,
                quantity: parsed.data.quantity,
                images: [],
              },
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
          unitPriceCentsClient: unitClient,
          totalCentsClient: totalClient,
          quantity: parsed.data.quantity,
          leadTimeDays: product.leadTimeDays,
          moq: product.moq,
          incoterm: parsed.data.incoterm,
          validUntil: deadline,
          qualificationScore: 100,
          status: QuoteStatus.ACCEPTED,
        },
        select: { id: true },
      });

      const order = await tx.order.create({
        data: {
          reference: ordReference,
          quoteId: quote.id,
          requestId: request.id,
          clientOrgId: user.organizationId,
          factoryOrgId: product.factoryOrgId,
          totalCents: totalClient,
          depositCents,
          balanceCents,
          commissionCents: marginCents,
          status: OrderStatus.PAYMENT_PENDING,
          estimatedEta: deadline,
        },
        select: { id: true },
      });

      return order.id;
    });
  } catch (e) {
    if ((e as Error).message === "OUT_OF_STOCK") {
      return { error: "This product just went out of stock." };
    }
    return {
      error: "Couldn't create the order. Please try again.",
    };
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "marketplace.purchase",
    targetType: "Order",
    targetId: orderId,
    payload: {
      productId: product.id,
      quantity: parsed.data.quantity,
      totalCents: totalClient,
    },
  });

  const locale = await currentLocale();
  revalidatePath("/[lang]/client/orders", "page");
  revalidatePath("/[lang]/marketplace", "page");
  redirect(`/${locale}/client/orders/${orderId}`);
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
