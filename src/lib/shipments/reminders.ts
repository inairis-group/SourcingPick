import "server-only";
import { NotificationType, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { SHIPMENT_AWAITING_SHIPPER, isReportOverdue } from "./status";

/**
 * §6.3 — repeating reminders on every status pending action.
 *
 * "Les rappels se répètent jusqu'à résolution du statut de la commande", so
 * this deliberately does NOT mark a shipment as reminded-once: it re-fires on
 * every sweep while the status is still waiting on the shipper. The cadence is
 * therefore set by how often the cron runs, not by per-row state — which keeps
 * the rule and the implementation the same shape.
 *
 * §6.2 — both the shipper and the internal team are notified.
 */
export async function dispatchShipmentReminders(now: Date = new Date()) {
  const pending = await prisma.shipment.findMany({
    where: { status: { in: SHIPMENT_AWAITING_SHIPPER } },
    select: {
      id: true,
      reference: true,
      status: true,
      shipperOrgId: true,
      events: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const overdue = pending.filter((s) => {
    const last = s.events[0]?.createdAt;
    return last ? isReportOverdue(s.status, last, now) : false;
  });

  if (overdue.length === 0) return { scanned: pending.length, reminded: 0 };

  const internal = await prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.AGENT] }, deletedAt: null },
    select: { id: true },
  });
  const internalIds = internal.map((u) => u.id);

  for (const s of overdue) {
    const shipperIds = s.shipperOrgId
      ? (
          await prisma.user.findMany({
            where: {
              organizationId: s.shipperOrgId,
              role: Role.SHIPPER,
              deletedAt: null,
            },
            select: { id: true },
          })
        ).map((u) => u.id)
      : [];

    await emitNotificationToMany([...shipperIds, ...internalIds], {
      type: NotificationType.SHIPMENT_STATUS,
      vars: { reference: s.reference },
      contextType: "Shipment",
      contextId: s.id,
    });
  }

  return { scanned: pending.length, reminded: overdue.length };
}
