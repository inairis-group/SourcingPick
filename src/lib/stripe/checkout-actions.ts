"use server";

import { headers } from "next/headers";
import {
  InvoiceType,
  OrderStatus,
  ResearchFeeStatus,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import {
  computeCreditApplication,
  getOrgCreditBalanceCents,
} from "@/lib/credit/balance";
import { getSiteUrl, getStripe } from "./client";
import { getOrCreateStripeCustomerId } from "./customer";
import { finalizeDepositByCredit } from "./finalize";

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
  appliedCreditCents = 0,
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
          appliedCreditCents: String(appliedCreditCents),
        },
      },
      metadata: {
        orderId: order.id,
        orderReference: order.reference,
        invoiceType,
        appliedCreditCents: String(appliedCreditCents),
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

  // Apply any platform credit (e.g. a credited-back research fee) to the
  // deposit. `computeCreditApplication` refuses to leave an un-chargeable
  // sub-minimum remainder.
  const balanceCents = await getOrgCreditBalanceCents(order.clientOrgId);
  const { appliedCents, remainderCents } = computeCreditApplication({
    chargeCents: order.depositCents,
    balanceCents,
  });

  // Full coverage by credit → no Stripe charge. Settle the deposit
  // directly: debit the credit, write invoice + escrow, advance the order.
  if (appliedCents > 0 && remainderCents === 0) {
    const settled = await finalizeDepositByCredit({
      orderId: order.id,
      appliedCreditCents: appliedCents,
    });
    await writeAuditLog({
      actorUserId: user.id,
      action: "payment.deposit_settled_by_credit",
      targetType: "Order",
      targetId: order.id,
      payload: { appliedCreditCents: appliedCents },
    });
    if (!settled.ok) return { ok: false, error: settled.error };
    // No Stripe redirect needed — send the buyer to the order with the
    // same success marker the webhook path uses.
    const siteUrl = getSiteUrl();
    return {
      ok: true,
      url: `${siteUrl}/${locale}/client/orders/${order.id}?payment=success`,
    };
  }

  const result = await createOrderCheckoutSession(
    order,
    remainderCents,
    InvoiceType.DEPOSIT,
    locale,
    appliedCents,
  );

  await writeAuditLog({
    actorUserId: user.id,
    action: "payment.checkout_created",
    targetType: "Order",
    targetId: order.id,
    payload: {
      amountCents: order.depositCents,
      chargedCents: remainderCents,
      appliedCreditCents: appliedCents,
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

/**
 * Create a Stripe Checkout Session for a request's research fee.
 *
 * The agent quotes the fee (status QUOTED → an ISSUED invoice). This lets
 * the buyer pay it. The webhook marks the invoice PAID and stamps
 * researchFeeStatus=PAID + researchFeePaidAt (which anchors the 30-day
 * credit-back window).
 */
export async function createResearchFeeCheckoutAction(
  requestId: string,
): Promise<CreateCheckoutResult> {
  const user = await requireRole(Role.CLIENT);

  const request = await prisma.sourcingRequest.findFirst({
    where: { id: requestId, clientOrgId: user.organizationId },
    select: {
      id: true,
      reference: true,
      title: true,
      clientOrgId: true,
      researchFeeStatus: true,
      researchFeeCents: true,
      researchFeeInvoiceId: true,
    },
  });
  if (!request) return { ok: false, error: "Request not found." };
  if (request.researchFeeStatus !== ResearchFeeStatus.QUOTED) {
    return { ok: false, error: "There's no research fee awaiting payment." };
  }
  if (!request.researchFeeCents || request.researchFeeCents <= 0) {
    return { ok: false, error: "The research fee amount is invalid." };
  }

  let customerId: string;
  try {
    customerId = await getOrCreateStripeCustomerId(request.clientOrgId);
  } catch (e) {
    return { ok: false, error: `Couldn't reach Stripe: ${(e as Error).message}` };
  }

  const locale = await currentLocale();
  const siteUrl = getSiteUrl();
  const stripe = getStripe();

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
            unit_amount: request.researchFeeCents,
            product_data: {
              name: `${request.reference} · ${request.title}`,
              description: "Frais de recherche · SourcingPick",
            },
          },
        },
      ],
      payment_intent_data: {
        metadata: {
          researchFeeRequestId: request.id,
          researchFeeInvoiceId: request.researchFeeInvoiceId ?? "",
        },
      },
      metadata: {
        researchFeeRequestId: request.id,
        researchFeeInvoiceId: request.researchFeeInvoiceId ?? "",
      },
      locale: STRIPE_LOCALE[locale] ?? "auto",
      success_url: `${siteUrl}/${locale}/client/requests/${request.id}?research=success`,
      cancel_url: `${siteUrl}/${locale}/client/requests/${request.id}?research=cancelled`,
    });
    if (!session.url) {
      return { ok: false, error: "Stripe didn't return a checkout URL." };
    }
    await writeAuditLog({
      actorUserId: user.id,
      action: "research_fee.checkout_created",
      targetType: "SourcingRequest",
      targetId: request.id,
      payload: { amountCents: request.researchFeeCents },
    });
    return { ok: true, url: session.url };
  } catch (e) {
    return { ok: false, error: `Stripe error: ${(e as Error).message}` };
  }
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
