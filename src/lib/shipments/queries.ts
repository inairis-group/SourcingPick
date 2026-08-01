import "server-only";
import { prisma } from "@/lib/db/client";

/**
 * Read side for the Expéditeur role and its internal-team counterpart.
 *
 * Scoping is enforced here rather than in the pages: a shipper may only ever
 * read shipments assigned to their own org (§1.2 — they have no business
 * seeing anyone else's, and certainly not the client relationship). Callers
 * pass the org id from the session; there is no unscoped variant exported.
 */

/** Columns the shipper's list view needs — deliberately no client identity. */
export async function listShipmentsForShipper(shipperOrgId: string) {
  return prisma.shipment.findMany({
    where: { shipperOrgId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      reference: true,
      status: true,
      destCity: true,
      destCountry: true,
      updatedAt: true,
      order: { select: { reference: true } },
    },
  });
}

/**
 * Full record for the shipper's detail view.
 *
 * Returns null when the shipment isn't theirs, so the page can 404 rather than
 * leak existence. Note what is NOT selected: the order's client org, totals,
 * commission or agent. The shipper needs the goods' declared value for customs
 * (ShipmentItem.unitPriceCents) and nothing else commercial.
 */
export async function getShipmentForShipper(id: string, shipperOrgId: string) {
  return prisma.shipment.findFirst({
    where: { id, shipperOrgId },
    select: {
      id: true,
      reference: true,
      status: true,
      shippingMethod: true,
      totalWeightKg: true,
      lengthCm: true,
      widthCm: true,
      heightCm: true,
      destName: true,
      destAddress: true,
      destCity: true,
      destPostalCode: true,
      destCountry: true,
      acceptedQuoteId: true,
      quoteStale: true,
      order: { select: { reference: true } },
      items: {
        select: {
          id: true,
          label: true,
          nature: true,
          quantity: true,
          unitPriceCents: true,
          imageUrl: true,
        },
      },
      quotes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amountCents: true,
          currency: true,
          validUntil: true,
          conditions: true,
          notes: true,
          revisionReason: true,
          createdAt: true,
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          note: true,
          clientVisible: true,
          createdAt: true,
        },
      },
    },
  });
}

/** Internal-team queue. Unlike the shipper view this spans every shipper org. */
export async function listShipmentsForInternal() {
  return prisma.shipment.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      reference: true,
      status: true,
      destCity: true,
      destCountry: true,
      updatedAt: true,
      order: { select: { reference: true } },
      shipperOrg: { select: { displayName: true } },
      acceptedQuote: {
        select: { amountCents: true, currency: true, validUntil: true },
      },
      quoteStale: true,
      // Newest event drives the §5 overdue badge.
      events: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });
}

/** Orders that could still be handed to a shipper — i.e. have no leg yet. */
export async function listShippableOrders() {
  return prisma.order.findMany({
    where: { shipment: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      reference: true,
      clientOrg: { select: { displayName: true } },
    },
  });
}

/** Shipper partner orgs available for assignment. */
export async function listShipperOrgs() {
  return prisma.organization.findMany({
    where: { type: "SHIPPER", deletedAt: null },
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true },
  });
}

/**
 * §7.1 — the client-facing slice of the logistics leg.
 *
 * Returns only events flagged `clientVisible`, and deliberately selects no
 * shipper identity, no quote and no logistics price: the client's counterparty
 * is SourcingPick, not the expéditeur (§1.2). Scoped by `clientOrgId` so one
 * client can never read another's shipment.
 *
 * Returns an empty array — not null — when the order has no shipper leg, so
 * callers can render nothing without special-casing.
 */
export async function getClientVisibleShipmentEvents(orderId: string, clientOrgId: string) {
  const shipment = await prisma.shipment.findFirst({
    where: { orderId, order: { clientOrgId } },
    select: {
      events: {
        where: { clientVisible: true },
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, createdAt: true },
      },
    },
  });
  return shipment?.events ?? [];
}

/**
 * Full record for the internal team's detail view.
 *
 * The mirror of `getShipmentForShipper`, with three differences: it spans all
 * shipper orgs, it returns the shipper's identity and the quoted prices, and
 * it returns **every** event rather than only the client-visible ones — this
 * is the surface §7.1 expects the team to work from when deciding what to
 * relay.
 */
export async function getShipmentForInternal(id: string) {
  return prisma.shipment.findUnique({
    where: { id },
    select: {
      id: true,
      reference: true,
      status: true,
      quoteStale: true,
      shippingMethod: true,
      totalWeightKg: true,
      lengthCm: true,
      widthCm: true,
      heightCm: true,
      destName: true,
      destAddress: true,
      destCity: true,
      destPostalCode: true,
      destCountry: true,
      order: { select: { reference: true } },
      shipperOrg: { select: { displayName: true } },
      items: {
        select: {
          id: true,
          label: true,
          nature: true,
          quantity: true,
          unitPriceCents: true,
        },
      },
      quotes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amountCents: true,
          currency: true,
          validUntil: true,
          conditions: true,
          notes: true,
          revisionReason: true,
          createdAt: true,
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          note: true,
          clientVisible: true,
          createdAt: true,
        },
      },
    },
  });
}
