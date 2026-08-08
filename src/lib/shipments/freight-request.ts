import "server-only";
import { NotificationType, Role, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { emitNotificationToMany } from "@/lib/notifications/emit";

/**
 * Ask for a freight price now that the goods are ready.
 *
 * Called when an order reaches QC. Two cases, and they need different people:
 *
 *  - A shipment already exists → put the leg back into QUOTE_REQUESTED and
 *    tell the shipper. Their weights and dimensions are now real rather than
 *    estimated, which is exactly why we wait until QC to ask.
 *  - No shipment yet → tell the internal team. We deliberately do NOT
 *    fabricate one: the §2 brief needs real weights, dimensions and a
 *    destination, and a shipment invented from defaults would be a quote
 *    against numbers nobody measured.
 *
 * Idempotent: an order re-entering QC re-notifies but changes nothing that has
 * already been accepted by the buyer.
 */
export async function requestFreightQuoteForOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      reference: true,
      shipment: {
        select: {
          id: true,
          reference: true,
          status: true,
          shipperOrgId: true,
          buyerAcceptedAt: true,
        },
      },
    },
  });
  if (!order) return;

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, deletedAt: null },
    select: { id: true },
  });

  if (!order.shipment) {
    // Nobody can quote what hasn't been briefed.
    if (admins.length > 0) {
      await emitNotificationToMany(
        admins.map((a) => a.id),
        {
          type: NotificationType.SYSTEM,
          vars: { systemKey: "freight_brief_needed", reference: order.reference },
          contextType: "Order",
          contextId: order.id,
        },
      );
    }
    return;
  }

  const shipment = order.shipment;
  // A price the buyer has already agreed to is settled — re-opening it here
  // would invalidate an invoice that may already be paid.
  if (shipment.buyerAcceptedAt) return;

  await prisma.$transaction(async (tx) => {
    await tx.shipment.update({
      where: { id: shipment.id },
      data: { status: ShipmentStatus.QUOTE_REQUESTED, quoteStale: true },
    });
    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: ShipmentStatus.QUOTE_REQUESTED,
        note: "Goods passed QC — final weights and dimensions available, freight quote requested.",
        clientVisible: false,
      },
    });
  });

  const recipients = shipment.shipperOrgId
    ? await prisma.user.findMany({
        where: { organizationId: shipment.shipperOrgId, deletedAt: null },
        select: { id: true },
      })
    : [];

  const targets = [
    ...recipients.map((r) => r.id),
    ...(recipients.length === 0 ? admins.map((a) => a.id) : []),
  ];
  if (targets.length > 0) {
    await emitNotificationToMany(targets, {
      type: NotificationType.SHIPMENT_QUOTE,
      vars: { reference: shipment.reference },
      contextType: "Shipment",
      contextId: shipment.id,
    });
  }
}
