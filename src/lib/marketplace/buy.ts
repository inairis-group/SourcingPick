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
  /// Empty for a listing without variants. Validated against the product
  /// below rather than trusted — it arrives from a form field.
  variantId: z.union([z.string().min(1), z.literal("")]).optional(),
  quantity: z.coerce.number().int().positive("Quantity must be positive."),
  // Partner #12: structured fields. The freeform `deliveryAddress`
  // legacy field is synthesised server-side from these so existing
  // readers (shipping labels, audit, etc.) keep working.
  deliveryStreet: z.string().trim().min(3).max(200),
  deliveryPostalCode: z.string().trim().min(2).max(20),
  deliveryCity: z.string().trim().min(2).max(100),
  deliveryCountry: z
    .string()
    .trim()
    .length(2, "ISO country code (2 letters).")
    .toUpperCase(),
  // Partner #15: incoterm no longer accepted from the buyer — it's
  // locked on the product and read server-side from the listing. The
  // field is still parsed here as optional so an out-of-date client
  // posting it doesn't fail validation; we just ignore the value.
  incoterm: z.enum(Incoterm).optional(),
});

export type BuyResult = {
  error?: string;
};

/**
 * One-click marketplace purchase.
 *
 * The marketplace bypasses the agent-led sourcing flow but reuses the
 * Order + escrow + payment infrastructure. We materialise a synthetic
 * SourcingRequest + Quote so downstream code (the PingPong webhook
 * reconciler, the order detail UI, messaging threads, etc.) can stay
 * role-agnostic.
 *
 *   SourcingRequest.status = QUOTE_ACCEPTED (skips DRAFT/RECEIVED/ASSIGNED)
 *   Quote.status           = ACCEPTED
 *   Order.status           = PAYMENT_PENDING (client lands on the order
 *                           detail page where the WiseWirePanel shows
 *                           the deposit wire details — buyer wires from
 *                           their own bank, webhook reconciler advances)
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
    variantId: formData.get("variantId") ?? "",
    quantity: formData.get("quantity"),
    deliveryStreet: formData.get("deliveryStreet"),
    deliveryPostalCode: formData.get("deliveryPostalCode"),
    deliveryCity: formData.get("deliveryCity"),
    deliveryCountry: formData.get("deliveryCountry"),
    incoterm: formData.get("incoterm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // CTO audit F7: dropped the unused `deletedAt: null` filter — the
  // column itself was removed in the audit-corrections migration and
  // marketplace soft-delete has always been driven by status=ARCHIVED.
  const product = await prisma.marketplaceProduct.findFirst({
    where: {
      id: parsed.data.productId,
      status: MarketplaceProductStatus.PUBLISHED,
      blockedAt: null,
      // Pricing-v3 Phase 2: untested products can't be ordered, even
      // by URL — admin must mark them tested-and-approved first.
      testedAndApprovedAt: { not: null },
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
      depositPercentageBps: true,
      incoterm: true,
      isUniqueItem: true,
      variants: {
        select: {
          id: true,
          label: true,
          priceCentsFactory: true,
          priceCentsClient: true,
          stockAvailable: true,
        },
      },
    },
  });
  if (!product) return { error: "Product not found or no longer available." };

  /**
   * Variant resolution.
   *
   * Once a listing has variants they own both the price and the stock, so a
   * purchase that doesn't name one is ambiguous — refuse it rather than
   * guessing at the first row. A variant posted against a listing that has
   * none is equally wrong, and silently ignoring it would charge the buyer for
   * something other than what they picked.
   */
  const variantId = parsed.data.variantId || null;
  const variant = variantId
    ? (product.variants.find((v) => v.id === variantId) ?? null)
    : null;
  if (variantId && !variant) {
    return { error: "That option is no longer available." };
  }
  if (product.variants.length > 0 && !variant) {
    return { error: "Choose an option before ordering." };
  }

  if (product.moq > 0 && parsed.data.quantity < product.moq) {
    return {
      error: `Minimum order quantity for this product is ${product.moq}.`,
    };
  }
  const availableStock = variant
    ? variant.stockAvailable
    : product.stockAvailable;
  if (parsed.data.quantity > availableStock) {
    return {
      error: `Only ${availableStock} units in stock.`,
    };
  }

  // A variant with no price override inherits the listing's, which is the
  // common case — most ranges are one price across every option.
  const unitClient = variant?.priceCentsClient ?? product.priceCentsClient;
  const unitFactory = variant?.priceCentsFactory ?? product.priceCentsFactory;
  const totalClient = unitClient * parsed.data.quantity;
  const marginCents = totalClient - unitFactory * parsed.data.quantity;
  // CTO audit F4: marketplace + sourcing share the same acompte policy
  // (30–50 %). The hardcoded 0.3 used to diverge from quote-driven
  // sourcing. Field is bounded 30–50 % at the form layer; we clamp here
  // defensively in case a stray DB value slipped in.
  const depositBps = clampDepositBps(product.depositPercentageBps);
  const depositCents = Math.round((totalClient * depositBps) / 10000);
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
      // With a variant the conditional guard has to sit on the variant row:
      // that is the one that can actually run out, and guarding only the
      // product total would let two buyers take the last red one.
      if (variant) {
        const variantUpdate = await tx.marketplaceVariant.updateMany({
          where: {
            id: variant.id,
            stockAvailable: { gte: parsed.data.quantity },
          },
          data: { stockAvailable: { decrement: parsed.data.quantity } },
        });
        if (variantUpdate.count === 0) throw new Error("OUT_OF_STOCK");
      }

      const stockUpdate = await tx.marketplaceProduct.updateMany({
        where: {
          id: product.id,
          stockAvailable: { gte: parsed.data.quantity },
          status: MarketplaceProductStatus.PUBLISHED,
          blockedAt: null,
          testedAndApprovedAt: { not: null },
        },
        data: {
          stockAvailable: { decrement: parsed.data.quantity },
          soldCount: { increment: parsed.data.quantity },
        },
      });
      if (stockUpdate.count === 0) {
        throw new Error("OUT_OF_STOCK");
      }

      /**
       * A one-of-a-kind listing is a specific object, not a stock line: once
       * it's gone it can never come back, so leaving it PUBLISHED at zero
       * would keep showing a car that has already been sold. Retire it in the
       * same transaction as the sale.
       */
      if (product.isUniqueItem) {
        await tx.marketplaceProduct.update({
          where: { id: product.id },
          data: { status: MarketplaceProductStatus.OUT_OF_STOCK },
        });
      }

      const request = await tx.sourcingRequest.create({
        data: {
          reference: reqReference,
          clientOrgId: user.organizationId,
          createdByUserId: user.id,
          title: variant ? `${product.name} — ${variant.label}` : product.name,
          category: product.category,
          quantity: parsed.data.quantity,
          deadline,
          // Freeform legacy field is synthesised from the structured
          // ones so older readers (PDF labels, audit log, etc.) keep
          // working without changes.
          deliveryAddress: `${parsed.data.deliveryStreet}, ${parsed.data.deliveryPostalCode} ${parsed.data.deliveryCity}, ${parsed.data.deliveryCountry}`,
          deliveryStreet: parsed.data.deliveryStreet,
          deliveryPostalCode: parsed.data.deliveryPostalCode,
          deliveryCity: parsed.data.deliveryCity,
          deliveryCountry: parsed.data.deliveryCountry,
          incoterm: product.incoterm,
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
                name: variant ? `${product.name} — ${variant.label}` : product.name,
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
          incoterm: product.incoterm,
          validUntil: deadline,
          qualificationScore: 100,
          // Mirror the marketplace product's acompte choice onto the
          // synthetic Quote so the historical record matches and any
          // downstream code (refunds, dispute computations) reads the
          // same split (CTO audit F4).
          depositPercentageBps: depositBps,
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
          marketplaceVariantId: variant?.id ?? null,
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
      variantId: variant?.id ?? null,
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

/**
 * Clamp a marketplace product's stored depositPercentageBps to the
 * shared 30–50 % policy. Defensive only — the form enforces the same
 * bounds, but a stray import or legacy row should never be allowed to
 * mint a 0 % or 99 % acompte.
 */
// Local implementation kept for back-compat — sample-buy.ts imports
// the shared `buy-helpers.ts` version. Both round and clamp to the
// 30–50 % window.
function clampDepositBps(value: number): number {
  if (!Number.isFinite(value)) return 3000;
  return Math.max(3000, Math.min(5000, Math.round(value)));
}
