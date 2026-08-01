import { ShipmentStatus } from "@prisma/client";

/**
 * The 10 official statuses (§4 of the Expéditeur spec) in lifecycle order.
 * Used to render progress and to validate transitions.
 */
export const SHIPMENT_STATUS_ORDER: ShipmentStatus[] = [
  ShipmentStatus.QUOTE_REQUESTED,
  ShipmentStatus.QUOTE_CALCULATING,
  ShipmentStatus.QUOTE_VALIDATED,
  ShipmentStatus.PREPARATION,
  ShipmentStatus.PICKED_UP,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.AWAITING_FINAL_DELIVERY,
  ShipmentStatus.DELIVERED,
];

/**
 * INCIDENT and CANCELLED sit outside the linear flow — either can be entered
 * from any live status, and INCIDENT is recoverable back into it.
 */
export const SHIPMENT_TERMINAL: ShipmentStatus[] = [
  ShipmentStatus.DELIVERED,
  ShipmentStatus.CANCELLED,
];

/**
 * Statuses that may mirror automatically onto the CLIENT's order timeline.
 *
 * This is the one product decision the spec leaves open, so the reasoning is
 * worth stating. §1.2 forbids any contact between the shipper and the end
 * client, and §7.1 makes the internal team the sole interlocutor — but §6.2
 * says the client receives what the internal team passes on
 * "manuellement/automatiquement via votre interface". Automatic relay is
 * therefore explicitly permitted; what is forbidden is a *contact path*.
 *
 * So physical-progress statuses mirror automatically, under SourcingPick's own
 * branding, with no shipper identity and no logistics price attached. That
 * satisfies §7.1's duty to keep the client informed of "tous les états
 * d'avancement" without anyone re-typing status updates by hand.
 *
 * Everything else stays off the client timeline until a human relays it:
 *
 *   - QUOTE_REQUESTED / QUOTE_CALCULATING / QUOTE_VALIDATED — procurement and
 *     pricing. The client buys a delivered order, not a freight quote; exposing
 *     this leaks the logistics margin.
 *   - INCIDENT — §4.9 covers delays, blockages, surcharges and customs. These
 *     need framing and usually a commercial decision before the client hears
 *     about them. Auto-publishing "incident" would be worse than silence.
 *   - CANCELLED — always warrants a human explanation.
 */
export const CLIENT_VISIBLE_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.PREPARATION,
  ShipmentStatus.PICKED_UP,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.AWAITING_FINAL_DELIVERY,
  ShipmentStatus.DELIVERED,
];

export function isClientVisible(status: ShipmentStatus): boolean {
  return CLIENT_VISIBLE_STATUSES.includes(status);
}

/**
 * §5 — the shipper must report any incident, price change, delay or status
 * change within 24h of it occurring. Exported as a constant so the (later)
 * reminder cron and the overdue badge in the internal queue agree on one
 * number rather than each hard-coding it.
 */
export const INCIDENT_REPORT_SLA_HOURS = 24;

/**
 * §5 — statuses that are waiting on the shipper to act.
 *
 * Used by both the overdue badge on the internal queue and the reminder cron,
 * so "pending action" means the same thing in both places. DELIVERED and
 * CANCELLED are terminal; QUOTE_VALIDATED and the in-transit states are
 * waiting on the world, not on the shipper.
 */
export const SHIPMENT_AWAITING_SHIPPER: ShipmentStatus[] = [
  ShipmentStatus.QUOTE_REQUESTED,
  ShipmentStatus.QUOTE_CALCULATING,
  ShipmentStatus.INCIDENT,
];

/**
 * Whether a shipment has gone quiet past the §5 reporting window.
 *
 * Measured from the last event rather than from creation: the duty is to
 * report *within 24h of the event*, so a shipment that was updated an hour ago
 * is compliant no matter how old it is.
 */
export function isReportOverdue(
  status: ShipmentStatus,
  lastEventAt: Date,
  now: Date = new Date(),
): boolean {
  if (!SHIPMENT_AWAITING_SHIPPER.includes(status)) return false;
  const elapsedHours = (now.getTime() - lastEventAt.getTime()) / 3_600_000;
  return elapsedHours > INCIDENT_REPORT_SLA_HOURS;
}
