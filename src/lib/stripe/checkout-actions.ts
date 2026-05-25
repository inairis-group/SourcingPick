"use server";

import { headers } from "next/headers";
import { InvoiceType, OrderStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getSiteUrl, getStripe } from "./client";
import { getOrCreateStripeCustomerId } from "./customer";

export type CreateCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

async function createOrderCheckoutSession(
  order: {
    id: string;
    reference: string;
    clientOrgId: string;
    request: { title: string };
  },
  amountCents: number,
  invoiceType: typeof InvoiceType.DEPOSIT | typeof InvoiceType.BALANCE,
  locale: Locale,
): Promise<CreateCheckoutResult> {
  let customerId: string;
  try {
    customerId = await getOrCreateStripeCustomerId(order.clientOrgId);
  } catch (e) {
    return {
      ok: false,
      error: `Couldn't reach Stripe: ${(e as Error).message}`,
    };
  }

  const siteUrl = getSiteUrl();
  const stripe = getStripe();

  const description =
    invoiceType === InvoiceType.DEPOSIT
      ? "Acompte 30% · SourcingPick"
      : "Solde 70% · SourcingPick";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: `${order.reference} · ${order.request.title}`,
              description,
            },
          },
        },
      ],
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          orderReference: order.reference,
          invoiceType,
        },
      },
      metadata: {
        orderId: order.id,
        orderReference: order.reference,
        invoiceType,
      },
      locale: STRIPE_LOCALE[locale] ?? "auto",
      success_url: `${siteUrl}/${locale}/client/orders/${order.id}?payment=success`,
      cancel_url: `${siteUrl}/${locale}/client/orders/${order.id}?payment=cancelled`,
    });
    if (!session.url) {
      return { ok: false, error: "Stripe didn't return a checkout URL." };
    }
    return { ok: true, url: session.url };
  } catch (e) {
    return {
      ok: false,
      error: `Stripe error: ${(e as Error).message}`,
    };
  }
}

/**
 * Create a Stripe Checkout Session for the order's 30% deposit.
 *
 * Webhook (`/api/stripe/webhook`) handles the success side: invoice + escrow
 * rows are written and the order is advanced to PREPARATION. Doing it via
 * webhook (rather than a polling success page) means a card-issuer 3DS
 * detour or a closed browser tab can't lose the payment.
 *
 * For v1 the platform collects the full deposit; payout to the factory's
 * Connect account happens after delivery confirmation (Turn 2 of Phase 3).
 */
export async function createDepositCheckoutAction(
  orderId: string,
): Promise<CreateCheckoutResult> {
  const user = await requireRole(Role.CLIENT);

  const order = await prisma.order.findFirst({
    where: { id: orderId, clientOrgId: user.organizationId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      status: true,
      depositCents: true,
      clientOrgId: true,
      request: { select: { title: true } },
    },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== OrderStatus.PAYMENT_PENDING) {
    return { ok: false, error: "This order is not awaiting payment." };
  }
  if (order.depositCents <= 0) {
    return { ok: false, error: "Deposit amount is invalid." };
  }

  const locale = await currentLocale();
  const result = await createOrderCheckoutSession(
    order,
    order.depositCents,
    InvoiceType.DEPOSIT,
    locale,
  );

  await writeAuditLog({
    actorUserId: user.id,
    action: "payment.checkout_created",
    targetType: "Order",
    targetId: order.id,
    payload: {
      amountCents: order.depositCents,
      type: "DEPOSIT",
      ok: result.ok,
    },
  });

  return result;
}

/**
 * Create a Stripe Checkout Session for the order's 70% balance.
 *
 * Triggered by the client's "confirm receipt" CTA on a SHIPPED / IN_TRANSIT
 * order. The webhook handles the success side: the balance invoice + escrow
 * are written, the order is advanced to COMPLETED, and the factory's
 * Stripe Connect payout is fired.
 */
export async function createBalanceCheckoutAction(
  orderId: string,
): Promise<CreateCheckoutResult> {
  const user = await requireRole(Role.CLIENT);

  const order = await prisma.order.findFirst({
    where: { id: orderId, clientOrgId: user.organizationId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      status: true,
      balanceCents: true,
      clientOrgId: true,
      request: { select: { title: true } },
    },
  });
  if (!order) return { ok: false, error: "Order not found." };
  if (
    order.status !== OrderStatus.SHIPPED &&
    order.status !== OrderStatus.IN_TRANSIT
  ) {
    return {
      ok: false,
      error: "Balance can only be paid once the order has shipped.",
    };
  }
  if (order.balanceCents <= 0) {
    return { ok: false, error: "Balance amount is invalid." };
  }

  // Guard against double-charging if a prior balance invoice exists.
  const existingBalance = await prisma.invoice.findFirst({
    where: {
      orderId: order.id,
      type: InvoiceType.BALANCE,
    },
    select: { id: true, status: true },
  });
  if (existingBalance && existingBalance.status === "PAID") {
    return { ok: false, error: "Balance has already been paid." };
  }

  const locale = await currentLocale();
  const result = await createOrderCheckoutSession(
    order,
    order.balanceCents,
    InvoiceType.BALANCE,
    locale,
  );

  await writeAuditLog({
    actorUserId: user.id,
    action: "payment.checkout_created",
    targetType: "Order",
    targetId: order.id,
    payload: {
      amountCents: order.balanceCents,
      type: "BALANCE",
      ok: result.ok,
    },
  });

  return result;
}

// Stripe Checkout doesn't support Arabic as of writing — fall back to
// `auto` (browser-detected) so the page still renders in a reasonable
// language for Arabic-speaking buyers (typically Arabic itself in their
// browser, otherwise English).
const STRIPE_LOCALE: Record<Locale, "fr" | "en" | "zh" | "auto"> = {
  fr: "fr",
  en: "en",
  zh: "zh",
  ar: "auto",
};

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
