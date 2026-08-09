import "server-only";
import {
  InvoiceStatus,
  InvoiceType,
  NotificationType,
  PayoutKind,
  PayoutMethod,
  PayoutStatus,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { dispatchProviderPayout } from "@/lib/payouts/dispatch";

/**
 * Settle the shipper once the buyer has paid the freight invoice.
 *
 * Freight deliberately does **not** pass through escrow. Escrow exists because
 * the buyer needs protection until goods arrive conforming; the carrier's fee
 * is owed for moving them, and holding it until delivery would mean asking a
 * forwarder to finance our buyer protection. So: money in, carrier settled.
 *
 * What the shipper is owed is the amount they **quoted**, in the currency they
 * quoted it in. We billed the buyer a converted figure at a rate frozen on the
 * shipment; any drift between that rate and the one we settle at is ours,
 * which is exactly the trade agreed when we chose to freeze the buyer's price.
 *
 * Idempotent on `Payout.shipmentId` (unique) — a replayed payment webhook
 * cannot pay a carrier twice.
 */
export async function settleShipperForFreight(
  invoiceId: string,
): Promise<{ settled: boolean; reason?: string }> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, type: true, status: true, reference: true },
  });
  if (!invoice || invoice.type !== InvoiceType.SHIPPING) {
    return { settled: false, reason: "not_a_freight_invoice" };
  }
  if (invoice.status !== InvoiceStatus.PAID) {
    return { settled: false, reason: "invoice_not_paid" };
  }

  const shipment = await prisma.shipment.findFirst({
    where: { shippingInvoiceId: invoice.id },
    select: {
      id: true,
      reference: true,
      shipperOrgId: true,
      quotedAmountCents: true,
      quotedCurrency: true,
      freightPayout: { select: { id: true } },
      shipperOrg: {
        select: { payoutProvider: true, payoutAccountId: true },
      },
    },
  });
  if (!shipment) return { settled: false, reason: "shipment_not_found" };
  if (shipment.freightPayout) return { settled: false, reason: "already_settled" };
  if (!shipment.shipperOrgId || !shipment.quotedAmountCents) {
    return { settled: false, reason: "shipment_incomplete" };
  }

  const reference = await generateUniqueReference("PAY");
  const now = new Date();
  const org = shipment.shipperOrg;
  const canDispatch = Boolean(org?.payoutProvider && org.payoutAccountId);

  let providerRef: string | null = null;
  let status: PayoutStatus = PayoutStatus.PENDING;
  let failureReason: string | null = null;

  if (!canDispatch) {
    // Recorded as owed, not lost. The shipper onboards and an ops sweep sends
    // it — the alternative is a debt that exists only in someone's memory.
    failureReason = "shipper_payout_not_set_up";
  } else {
    const result = await dispatchProviderPayout(org!.payoutProvider!, {
      orgId: shipment.shipperOrgId,
      accountId: org!.payoutAccountId!,
      amountCents: shipment.quotedAmountCents,
      currency: shipment.quotedCurrency ?? "CNY",
      idempotencyKey: `freight:${shipment.id}`,
      description: `Freight ${shipment.reference}`,
    });
    if (result.ok) {
      providerRef = result.providerRef;
      status = PayoutStatus.SENT;
    } else {
      failureReason = result.error;
    }
  }

  await prisma.payout.create({
    data: {
      reference,
      kind: PayoutKind.FREIGHT,
      payeeOrgId: shipment.shipperOrgId,
      // Legacy required column. Freight has no factory, so it points at the
      // payee too — new readers use payeeOrg, and this keeps the NOT NULL
      // constraint satisfiable without rewriting historical semantics.
      factoryOrgId: shipment.shipperOrgId,
      shipmentId: shipment.id,
      amountCents: shipment.quotedAmountCents,
      // The platform takes its margin on goods, not on moving them.
      supplierFeeCents: 0,
      method: PayoutMethod.PINGPONG,
      status,
      scheduledAt: status === PayoutStatus.SENT ? null : now,
      sentAt: status === PayoutStatus.SENT ? now : null,
      providerRef,
      failureReason,
    },
  });

  await writeAuditLog({
    action:
      status === PayoutStatus.SENT
        ? "shipment.freight_settled"
        : "shipment.freight_settlement_pending",
    targetType: "Shipment",
    targetId: shipment.id,
    payload: {
      reference: shipment.reference,
      payoutReference: reference,
      amountCents: shipment.quotedAmountCents,
      currency: shipment.quotedCurrency,
      failureReason,
    },
  });

  const shippers = await prisma.user.findMany({
    where: { organizationId: shipment.shipperOrgId, deletedAt: null },
    select: { id: true },
  });
  if (shippers.length > 0) {
    await emitNotificationToMany(
      shippers.map((s) => s.id),
      {
        type: NotificationType.SYSTEM,
        vars: {
          systemKey:
            status === PayoutStatus.SENT
              ? "freight_settled"
              : "freight_settlement_pending",
          reference: shipment.reference,
        },
        contextType: "Shipment",
        contextId: shipment.id,
      },
    );
  }

  // Ops needs to know about money we owe but couldn't send.
  if (status !== PayoutStatus.SENT) {
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
            systemKey: "freight_settlement_pending",
            reference: shipment.reference,
          },
          contextType: "Shipment",
          contextId: shipment.id,
        },
      );
    }
  }

  return { settled: status === PayoutStatus.SENT };
}

/**
 * Mark a freight invoice paid and settle the carrier.
 *
 * Returns `handled: false` for anything that isn't a freight invoice, so the
 * webhook can fall through to the escrow path without this having to know
 * about order legs.
 *
 * Idempotent twice over: the invoice only transitions out of ISSUED once, and
 * `Payout.shipmentId` is unique, so a replayed delivery cannot pay a carrier
 * a second time.
 */
export async function markFreightInvoicePaid(
  invoiceId: string,
  providerRef: string,
): Promise<{ handled: boolean; settled?: boolean }> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, type: true, status: true },
  });
  if (!invoice || invoice.type !== InvoiceType.SHIPPING) return { handled: false };

  if (invoice.status !== InvoiceStatus.PAID) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { paidAt: new Date(), status: InvoiceStatus.PAID },
    });
    await writeAuditLog({
      action: "invoice.freight_paid",
      targetType: "Invoice",
      targetId: invoice.id,
      payload: { providerRef },
    });
  }

  const result = await settleShipperForFreight(invoice.id);
  return { handled: true, settled: result.settled };
}
