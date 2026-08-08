"use server";

import { revalidatePath } from "next/cache";
import {
  InvoiceStatus,
  InvoiceType,
  NotificationType,
  Role,
  ShipmentStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import {
  FxNotConfiguredError,
  convertMinorUnits,
  rateForQuote,
} from "@/lib/payments/fx";

/**
 * Buyer acceptance of the shipper's freight price.
 *
 * Until this ran, a shipment quote was a note on a record: the shipper's
 * number was auto-accepted on submission, never shown to the buyer, and never
 * billed. Freight is now a transaction — which means the buyer has to agree to
 * the figure before an invoice exists, because billing someone for a number
 * they never saw is how chargebacks start.
 *
 * Two distinct acts, deliberately two columns:
 *   - `acceptedQuoteId`      — the shipper committing to a fixed price (§3.1)
 *   - `buyerAcceptedQuoteId` — the buyer agreeing to pay it
 *
 * The conversion is frozen here, not recomputed at invoice time: the buyer
 * accepted a specific EUR figure and that is what they must be billed.
 */

export type QuoteAcceptanceState =
  | { ok: true; invoiceReference?: string }
  | { ok: false; error: string };

/** What the buyer is shown before deciding. */
export async function getShippingQuoteForBuyer(orderId: string) {
  const user = await requireRole(Role.CLIENT);

  const shipment = await prisma.shipment.findFirst({
    // Scoped by the buyer's own org — an order id in the URL must never be
    // enough to read someone else's freight pricing.
    where: { orderId, order: { clientOrgId: user.organizationId } },
    select: {
      id: true,
      reference: true,
      status: true,
      buyerAcceptedAt: true,
      buyerDeclinedAt: true,
      buyerDeclineReason: true,
      billedAmountCentsEur: true,
      shippingInvoiceId: true,
      acceptedQuote: {
        select: {
          id: true,
          amountCents: true,
          currency: true,
          validUntil: true,
          conditions: true,
          notes: true,
        },
      },
    },
  });
  if (!shipment?.acceptedQuote) return null;

  // Quote the buyer-facing EUR figure up front so the number they see when
  // deciding is the number they will be billed.
  let previewEurCents: number | null = null;
  try {
    const rate = rateForQuote(shipment.acceptedQuote.currency);
    previewEurCents = convertMinorUnits(shipment.acceptedQuote.amountCents, rate);
  } catch {
    // No rate configured — the UI shows the original currency and the accept
    // button is disabled rather than showing a made-up euro figure.
    previewEurCents = null;
  }

  return { ...shipment, previewEurCents };
}

/**
 * Accept the freight price and raise the SHIPPING invoice.
 *
 * Everything that must not half-happen — freezing the conversion, stamping
 * acceptance, creating the invoice, linking it — is one transaction. A
 * shipment marked accepted with no invoice would be freight nobody ever bills.
 */
export async function acceptShippingQuoteAction(
  _prev: QuoteAcceptanceState | null,
  formData: FormData,
): Promise<QuoteAcceptanceState> {
  const user = await requireRole(Role.CLIENT);
  const shipmentId = String(formData.get("shipmentId") ?? "");

  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, order: { clientOrgId: user.organizationId } },
    select: {
      id: true,
      reference: true,
      buyerAcceptedAt: true,
      acceptedQuoteId: true,
      acceptedQuote: {
        select: { id: true, amountCents: true, currency: true, validUntil: true },
      },
      order: { select: { id: true, reference: true, clientOrgId: true } },
    },
  });
  if (!shipment) return { ok: false, error: "not_found" };
  if (shipment.buyerAcceptedAt) return { ok: false, error: "already_accepted" };

  const quote = shipment.acceptedQuote;
  if (!quote) return { ok: false, error: "no_quote" };

  // §3.1 — the fixed price is only held until validUntil. Accepting an expired
  // quote would bill a price the shipper is no longer standing behind.
  if (quote.validUntil.getTime() < Date.now()) {
    return { ok: false, error: "quote_expired" };
  }

  let rateBps: number;
  try {
    rateBps = rateForQuote(quote.currency);
  } catch (e) {
    if (e instanceof FxNotConfiguredError) return { ok: false, error: "no_fx_rate" };
    throw e;
  }
  const billedEurCents = convertMinorUnits(quote.amountCents, rateBps);
  if (billedEurCents <= 0) return { ok: false, error: "invalid_amount" };

  const invoiceReference = await generateUniqueReference("INV");
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        reference: invoiceReference,
        orderId: shipment.order.id,
        organizationId: shipment.order.clientOrgId,
        type: InvoiceType.SHIPPING,
        amountCents: billedEurCents,
        issuedAt: now,
        // Freight is due before the goods move, so it isn't given the
        // balance's longer terms.
        dueAt: now,
        status: InvoiceStatus.ISSUED,
        lineDescription: `Freight — ${shipment.reference}`,
      },
      select: { id: true },
    });

    await tx.shipment.update({
      where: { id: shipment.id },
      data: {
        buyerAcceptedQuoteId: quote.id,
        buyerAcceptedAt: now,
        buyerDeclinedAt: null,
        buyerDeclineReason: null,
        // The three numbers that let an auditor re-derive the arithmetic.
        quotedAmountCents: quote.amountCents,
        quotedCurrency: quote.currency,
        fxRateBps: rateBps,
        billedAmountCentsEur: billedEurCents,
        shippingInvoiceId: invoice.id,
      },
    });
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "shipment.freight_quote_accepted",
    targetType: "Shipment",
    targetId: shipment.id,
    payload: {
      reference: shipment.reference,
      quotedAmountCents: quote.amountCents,
      quotedCurrency: quote.currency,
      fxRateBps: rateBps,
      billedAmountCentsEur: billedEurCents,
      invoiceReference,
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, deletedAt: null },
    select: { id: true },
  });
  if (admins.length > 0) {
    await emitNotificationToMany(
      admins.map((a) => a.id),
      {
        type: NotificationType.SYSTEM,
        vars: {
          systemKey: "freight_quote_accepted",
          reference: shipment.reference,
        },
        contextType: "Shipment",
        contextId: shipment.id,
      },
    );
  }

  revalidatePath("/[lang]/client/orders/[id]", "page");
  return { ok: true, invoiceReference };
}

/**
 * Decline, with a reason the shipper can act on.
 *
 * Sends the leg back to QUOTE_REQUESTED rather than cancelling it: the goods
 * still need to move, and the shipper's §3.2 revision path already exists.
 */
export async function declineShippingQuoteAction(
  _prev: QuoteAcceptanceState | null,
  formData: FormData,
): Promise<QuoteAcceptanceState> {
  const user = await requireRole(Role.CLIENT);
  const shipmentId = String(formData.get("shipmentId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  if (reason.length < 5) return { ok: false, error: "reason_required" };

  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, order: { clientOrgId: user.organizationId } },
    select: { id: true, reference: true, buyerAcceptedAt: true, shipperOrgId: true },
  });
  if (!shipment) return { ok: false, error: "not_found" };
  if (shipment.buyerAcceptedAt) return { ok: false, error: "already_accepted" };

  await prisma.$transaction(async (tx) => {
    await tx.shipment.update({
      where: { id: shipment.id },
      data: {
        buyerDeclinedAt: new Date(),
        buyerDeclineReason: reason,
        status: ShipmentStatus.QUOTE_REQUESTED,
        quoteStale: true,
      },
    });
    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.QUOTE_REQUESTED,
        note: `Buyer declined the freight quote: ${reason}`,
        // Internal: the shipper and the team need it; relaying a pricing
        // rejection to the buyer they just wrote it is noise.
        clientVisible: false,
      },
    });
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "shipment.freight_quote_declined",
    targetType: "Shipment",
    targetId: shipment.id,
    payload: { reference: shipment.reference, reason },
  });

  if (shipment.shipperOrgId) {
    const shippers = await prisma.user.findMany({
      where: { organizationId: shipment.shipperOrgId, deletedAt: null },
      select: { id: true },
    });
    if (shippers.length > 0) {
      await emitNotificationToMany(
        shippers.map((s) => s.id),
        {
          type: NotificationType.SHIPMENT_QUOTE,
          vars: { reference: shipment.reference },
          contextType: "Shipment",
          contextId: shipment.id,
        },
      );
    }
  }

  revalidatePath("/[lang]/client/orders/[id]", "page");
  revalidatePath("/[lang]/shipper", "page");
  return { ok: true };
}
