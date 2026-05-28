import { NextResponse } from "next/server";
import {
  InvoiceType,
  WebhookSource,
  WebhookStatus,
  type Prisma,
} from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/db/client";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe/client";
import {
  finalizeResearchFeePayment,
  finalizeStripePayment,
} from "@/lib/stripe/finalize";
import { writeAuditLog } from "@/lib/audit/log";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook endpoint.
 *
 * - We log every received event to `WebhookEvent` for audit + replay.
 * - We handle a small set of events in v1; the rest are acknowledged
 *   (200 OK) so Stripe doesn't keep retrying.
 * - Signature is verified against STRIPE_WEBHOOK_SECRET; a mismatch returns
 *   400 so Stripe will surface the failure in the dashboard.
 *
 * Local dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
 * The CLI prints a `whsec_...` value to put in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const bodyText = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      bodyText,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (e) {
    return NextResponse.json(
      { error: `Signature verification failed: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  // Record the event before any processing — gives us a paper trail even
  // if downstream handlers throw. Idempotency for processing is enforced
  // by `finalizeStripePayment` (which checks EscrowTransaction.providerRef).
  const eventRow = await prisma.webhookEvent.create({
    data: {
      source: WebhookSource.STRIPE,
      eventType: event.type,
      signature,
      payload: event as unknown as Prisma.InputJsonValue,
      status: WebhookStatus.RECEIVED,
    },
    select: { id: true },
  });

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;

        // Research-fee payments carry their own metadata.
        const researchFeeRequestId = pi.metadata?.researchFeeRequestId;
        if (researchFeeRequestId) {
          await finalizeResearchFeePayment({
            requestId: researchFeeRequestId,
            invoiceId: pi.metadata?.researchFeeInvoiceId ?? "",
            stripePaymentIntentId: pi.id,
          });
          break;
        }

        const orderId = pi.metadata?.orderId;
        const invoiceType = pi.metadata?.invoiceType as
          | "DEPOSIT"
          | "BALANCE"
          | undefined;
        if (!orderId || !invoiceType) {
          await writeAuditLog({
            action: "webhook.payment_missing_metadata",
            payload: { stripeEventId: event.id, paymentIntentId: pi.id },
            level: "WARN",
          });
          break;
        }
        const appliedCreditCents = Number.parseInt(
          pi.metadata?.appliedCreditCents ?? "0",
          10,
        );
        await finalizeStripePayment({
          orderId,
          type:
            invoiceType === "DEPOSIT"
              ? InvoiceType.DEPOSIT
              : InvoiceType.BALANCE,
          amountCents: pi.amount_received ?? pi.amount,
          appliedCreditCents: Number.isFinite(appliedCreditCents)
            ? appliedCreditCents
            : 0,
          stripePaymentIntentId: pi.id,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await writeAuditLog({
          action: "payment.failed",
          targetType: "Order",
          targetId: pi.metadata?.orderId ?? undefined,
          payload: {
            paymentIntentId: pi.id,
            reason: pi.last_payment_error?.message ?? "unknown",
          },
          level: "WARN",
        });
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        // We don't cache Connect status on our side (factory payouts page
        // fetches live) — but we log payouts_enabled flips so the audit
        // trail captures the moment a factory becomes payable.
        await writeAuditLog({
          action: "stripe.connect_account_updated",
          targetType: "Organization",
          targetId: account.metadata?.organizationId ?? undefined,
          payload: {
            accountId: account.id,
            payoutsEnabled: account.payouts_enabled,
            chargesEnabled: account.charges_enabled,
            requirementsDue: account.requirements?.currently_due ?? [],
          },
        });
        break;
      }

      // Other events are acknowledged silently — Stripe sends many event
      // types we don't care about (customer.updated, charge.* duplicates,
      // etc.). Adding noisy logging here would just create alarm fatigue.
      default:
        break;
    }
  } catch (e) {
    // Don't swallow — Stripe will retry. We log + return 500 so retries
    // happen with backoff rather than the same request looping.
    await prisma.webhookEvent.update({
      where: { id: eventRow.id },
      data: {
        status: WebhookStatus.FAILED,
        lastError: (e as Error).message,
        attempts: { increment: 1 },
      },
    });
    await writeAuditLog({
      action: "webhook.handler_failed",
      payload: {
        stripeEventId: event.id,
        type: event.type,
        message: (e as Error).message,
      },
      level: "ALERT",
    });
    return NextResponse.json(
      { error: "Handler failed; will retry." },
      { status: 500 },
    );
  }

  await prisma.webhookEvent.update({
    where: { id: eventRow.id },
    data: { status: WebhookStatus.PROCESSED, processedAt: new Date() },
  });

  return NextResponse.json({ received: true });
}
