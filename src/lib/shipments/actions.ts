"use server";

import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import {
  AttachmentContext,
  KycStatus,
  Locale,
  NotificationType,
  OrgType,
  Role,
  ShipmentStatus,
  SubRole,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { storeAttachments } from "@/lib/storage/attachments";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { isClientVisible } from "./status";

/**
 * Write side for the Expéditeur role.
 *
 * Every export here is an async server action — this file is covered by
 * `scripts/check-use-server.ts`, which fails the build on any non-async
 * export. Shared constants live in ./status.ts for that reason.
 *
 * Both take `(prevState, formData)` so they can drive `useActionState` in the
 * form components: a bare `<form action={fn}>` requires the action to return
 * void, which would mean swallowing the validation results below.
 *
 * Both actions notify the internal team (§6.2: the internal team and the
 * shipper both receive everything; the client receives only what the internal
 * team relays). Neither action can reach the client directly — that is §1.2,
 * and it is enforced structurally: nothing here writes to a client-facing
 * surface except via `ShipmentEvent.clientVisible`, which only ever gets set
 * from the allowlist in ./status.ts.
 */

/** Internal-team recipients for shipment notifications. */
async function internalTeamUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.AGENT] }, deletedAt: null },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

/**
 * §3 — submit or revise the logistics quote.
 *
 * Always inserts a new ShipmentQuote rather than updating the previous one:
 * §3.2 obliges the shipper to re-price on any change of weight, dimensions,
 * method, address or composition, and §3.3 obliges them to justify it. Keeping
 * revisions means the internal team can see what changed and why, and the
 * client-facing price history is auditable after the fact.
 */
export async function submitShipmentQuote(_prev: unknown, formData: FormData) {
  const user = await requireRole(Role.SHIPPER);

  const shipmentId = String(formData.get("shipmentId") ?? "");
  const amount = Number(formData.get("amount"));
  const currency = String(formData.get("currency") ?? "CNY").toUpperCase();
  const validUntilRaw = String(formData.get("validUntil") ?? "");
  const conditions = String(formData.get("conditions") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const revisionReason = String(formData.get("revisionReason") ?? "").trim();

  if (!shipmentId) return { ok: false as const, error: "missing_shipment" };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false as const, error: "invalid_amount" };
  }
  // §3.1 — a fixed price is meaningless without the window it holds for.
  const validUntil = new Date(validUntilRaw);
  if (Number.isNaN(validUntil.getTime())) {
    return { ok: false as const, error: "invalid_validity" };
  }
  if (!conditions) return { ok: false as const, error: "missing_conditions" };

  // Scope: the shipment must belong to this shipper's org.
  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, shipperOrgId: user.organizationId },
    select: { id: true, reference: true, quotes: { select: { id: true } } },
  });
  if (!shipment) return { ok: false as const, error: "not_found" };

  const isRevision = shipment.quotes.length > 0;
  if (isRevision && !revisionReason) {
    // §3.2 — tariff changes must be "détaillées et justifiées".
    return { ok: false as const, error: "missing_revision_reason" };
  }

  const quote = await prisma.shipmentQuote.create({
    data: {
      shipmentId: shipment.id,
      amountCents: Math.round(amount * 100),
      currency,
      validUntil,
      conditions,
      notes: notes || null,
      revisionReason: isRevision ? revisionReason : null,
      authorId: user.id,
    },
    select: { id: true },
  });

  // Submitting a quote moves the leg to "devis validé (prix fixe)" (§4.3) and
  // makes this revision the one the internal team acts on.
  await prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      status: ShipmentStatus.QUOTE_VALIDATED,
      acceptedQuoteId: quote.id,
      // The revision the stale flag was asking for has arrived.
      quoteStale: false,
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      status: ShipmentStatus.QUOTE_VALIDATED,
      note: isRevision ? revisionReason : conditions,
      actorId: user.id,
      // Pricing never auto-surfaces to the client — see ./status.ts.
      clientVisible: false,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: isRevision ? "shipment.quote.revised" : "shipment.quote.submitted",
    targetType: "Shipment",
    targetId: shipment.id,
  });

  await emitNotificationToMany(await internalTeamUserIds(), {
    type: NotificationType.SHIPMENT_QUOTE,
    vars: { reference: shipment.reference },
    contextType: "Shipment",
    contextId: shipment.id,
  });

  revalidatePath(`/[lang]/shipper/shipments/${shipment.id}`, "page");
  return { ok: true as const };
}

/**
 * §4 — advance the shipment through the 10-status lifecycle.
 *
 * `clientVisible` is derived, never taken from the form: the shipper cannot
 * choose to publish something to the client, which is what keeps §1.2 true no
 * matter what the UI does.
 */
export async function updateShipmentStatus(_prev: unknown, formData: FormData) {
  const user = await requireRole(Role.SHIPPER);

  const shipmentId = String(formData.get("shipmentId") ?? "");
  const next = String(formData.get("status") ?? "") as ShipmentStatus;
  const note = String(formData.get("note") ?? "").trim();

  if (!shipmentId) return { ok: false as const, error: "missing_shipment" };
  if (!Object.values(ShipmentStatus).includes(next)) {
    return { ok: false as const, error: "invalid_status" };
  }
  // §4.9 / §3.3 — an incident without a description is not a report.
  if (next === ShipmentStatus.INCIDENT && !note) {
    return { ok: false as const, error: "missing_incident_note" };
  }

  const shipment = await prisma.shipment.findFirst({
    where: { id: shipmentId, shipperOrgId: user.organizationId },
    select: { id: true, reference: true },
  });
  if (!shipment) return { ok: false as const, error: "not_found" };

  await prisma.shipment.update({
    where: { id: shipment.id },
    data: { status: next },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      status: next,
      note: note || null,
      actorId: user.id,
      clientVisible: isClientVisible(next),
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "shipment.status.updated",
    targetType: "Shipment",
    targetId: shipment.id,
    payload: { status: next },
  });

  await emitNotificationToMany(await internalTeamUserIds(), {
    type:
      next === ShipmentStatus.INCIDENT
        ? NotificationType.SHIPMENT_INCIDENT
        : NotificationType.SHIPMENT_STATUS,
    vars: { reference: shipment.reference },
    contextType: "Shipment",
    contextId: shipment.id,
  });

  revalidatePath(`/[lang]/shipper/shipments/${shipment.id}`, "page");
  return { ok: true as const };
}

/**
 * §2 — hand an order to a shipper.
 *
 * Internal team only. This is the seeding step the whole role hangs off: it
 * captures the §2.2 order-level data (method, weight, dimensions, destination)
 * and the §2.1 per-product rows in one go, because the spec treats them as a
 * single mandatory payload — a shipper cannot quote from a partial brief.
 *
 * The order is the source of truth for what is being shipped, but the
 * logistics figures are entered by hand: weight and dimensions are properties
 * of the packed parcel, which nothing upstream knows until it is packed.
 */
export async function createShipmentForOrder(_prev: unknown, formData: FormData) {
  const user = await requireRole(Role.ADMIN, Role.AGENT);

  const orderId = String(formData.get("orderId") ?? "");
  const shipperOrgId = String(formData.get("shipperOrgId") ?? "");
  const shippingMethod = String(formData.get("shippingMethod") ?? "").trim();
  const totalWeightKg = Number(formData.get("totalWeightKg"));
  const lengthCm = Number(formData.get("lengthCm"));
  const widthCm = Number(formData.get("widthCm"));
  const heightCm = Number(formData.get("heightCm"));
  const destName = String(formData.get("destName") ?? "").trim();
  const destAddress = String(formData.get("destAddress") ?? "").trim();
  const destCity = String(formData.get("destCity") ?? "").trim();
  const destPostalCode = String(formData.get("destPostalCode") ?? "").trim();
  const destCountry = String(formData.get("destCountry") ?? "").trim();

  if (!orderId) return { ok: false as const, error: "missing_order" };
  if (!shipperOrgId) return { ok: false as const, error: "missing_shipper" };
  if (!shippingMethod) return { ok: false as const, error: "missing_method" };
  for (const n of [totalWeightKg, lengthCm, widthCm, heightCm]) {
    if (!Number.isFinite(n) || n <= 0) {
      return { ok: false as const, error: "invalid_measurements" };
    }
  }
  if (!destName || !destAddress || !destCity || !destCountry) {
    return { ok: false as const, error: "missing_destination" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, reference: true, shipment: { select: { id: true } } },
  });
  if (!order) return { ok: false as const, error: "order_not_found" };
  // Shipment↔Order is 1:1 (§2.2 allows one invoice to cover several products,
  // so a second leg would mean a second order, not a second shipment).
  if (order.shipment) return { ok: false as const, error: "already_shipped" };

  // §2.1 — the per-product rows arrive as parallel arrays from the form.
  const labels = formData.getAll("itemLabel").map(String);
  const natures = formData.getAll("itemNature").map(String);
  const quantities = formData.getAll("itemQuantity").map(Number);
  const prices = formData.getAll("itemUnitPrice").map(Number);
  const items = labels
    .map((label, i) => ({
      label: label.trim(),
      nature: (natures[i] ?? "").trim(),
      quantity: Number.isFinite(quantities[i]) ? quantities[i] : 1,
      unitPriceCents: Number.isFinite(prices[i]) ? Math.round(prices[i] * 100) : 0,
    }))
    .filter((it) => it.label && it.nature);

  if (items.length === 0) return { ok: false as const, error: "missing_items" };

  // §2.1.1 — one optional photo per product row, posted as a parallel array.
  // Empty file inputs still submit a zero-byte File, so index alignment with
  // the text rows only holds if we keep the blanks rather than filtering them.
  const rawImages = formData.getAll("itemImage");
  const imageForRow = labels.map((_, i) => {
    const f = rawImages[i];
    return f instanceof File && f.size > 0 ? f : null;
  });
  // `items` dropped rows with a blank label/nature, so re-derive which of the
  // original rows survived to keep photos attached to the right product.
  const keptRowIndexes = labels
    .map((label, i) => ({ i, keep: label.trim() && (natures[i] ?? "").trim() }))
    .filter((r) => r.keep)
    .map((r) => r.i);

  const reference = await generateUniqueReference("SHP");

  const shipment = await prisma.shipment.create({
    data: {
      reference,
      orderId: order.id,
      shipperOrgId,
      shippingMethod,
      totalWeightKg,
      lengthCm,
      widthCm,
      heightCm,
      destName,
      destAddress,
      destCity,
      destPostalCode,
      destCountry,
      items: { create: items },
      // §4.1 — the leg opens at "demande de devis reçue".
      events: {
        create: {
          status: ShipmentStatus.QUOTE_REQUESTED,
          actorId: user.id,
          clientVisible: false,
        },
      },
    },
    select: { id: true, reference: true },
  });

  // Photos are stored after the shipment exists: the item ids only come back
  // from a nested create once it has run, and a failed upload must not lose
  // the brief. Order is taken from the DB rather than assumed.
  const createdItems = await prisma.shipmentItem.findMany({
    where: { shipmentId: shipment.id },
    orderBy: { id: "asc" },
    select: { id: true },
  });
  for (const [n, rowIndex] of keptRowIndexes.entries()) {
    const file = imageForRow[rowIndex];
    const target = createdItems[n];
    if (!file || !target) continue;
    const { created } = await storeAttachments({
      contextType: AttachmentContext.SHIPMENT_ITEM_IMAGE,
      contextId: target.id,
      uploaderId: user.id,
      files: [file],
    });
    // A rejected photo (too large, wrong type) leaves the item without one
    // rather than failing the whole brief — the text data is what the shipper
    // cannot proceed without.
    if (created[0]) {
      await prisma.shipmentItem.update({
        where: { id: target.id },
        data: { imageUrl: created[0].storageUrl },
      });
    }
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: "shipment.created",
    targetType: "Shipment",
    targetId: shipment.id,
    payload: { orderReference: order.reference, shipperOrgId },
  });

  // §6.2 — the shipper is notified in-app and by email that a brief is waiting.
  const shipperUsers = await prisma.user.findMany({
    where: { organizationId: shipperOrgId, role: Role.SHIPPER, deletedAt: null },
    select: { id: true },
  });
  await emitNotificationToMany(
    shipperUsers.map((u) => u.id),
    {
      type: NotificationType.SHIPMENT_STATUS,
      vars: { reference: shipment.reference },
      contextType: "Shipment",
      contextId: shipment.id,
    },
  );

  revalidatePath("/[lang]/admin/shipments", "page");
  return { ok: true as const, id: shipment.id };
}

/**
 * Phase 1 — provision a shipper partner.
 *
 * Creates the organisation and its first user together, because a SHIPPER org
 * with no user is unreachable and a SHIPPER user needs an org to hang off.
 *
 * Deliberately admin-only with no self-signup counterpart: §1.2 makes the
 * expéditeur a vetted exclusive intermediary, not an open registration. The
 * admin sets the initial password and hands it over out of band.
 *
 * Locale defaults to `zh` per the language decision — the partner can switch
 * afterwards, but they land in Mandarin.
 */
export async function createShipperPartner(_prev: unknown, formData: FormData) {
  const admin = await requireRole(Role.ADMIN);

  const legalName = String(formData.get("legalName") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!legalName || !displayName || !country || !city || !address) {
    return { ok: false as const, error: "missing_org" };
  }
  if (!email.includes("@")) return { ok: false as const, error: "invalid_email" };
  if (!firstName || !lastName) return { ok: false as const, error: "missing_name" };
  if (password.length < 12) return { ok: false as const, error: "weak_password" };

  const clash = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (clash) return { ok: false as const, error: "email_taken" };

  const passwordHash = await hash(password, 12);

  // One transaction: a half-created partner (org without user) would show up
  // in the hand-off picker and produce shipments nobody can act on.
  const org = await prisma.$transaction(async (tx) => {
    const created = await tx.organization.create({
      data: {
        type: OrgType.SHIPPER,
        legalName,
        displayName,
        country,
        city,
        address,
        // Vetted offline before the account is cut, so the partner isn't
        // blocked behind a KYC queue that has no shipper flow.
        kycStatus: KycStatus.VERIFIED,
        kycVerifiedAt: new Date(),
      },
      select: { id: true, displayName: true },
    });

    await tx.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        emailVerified: new Date(),
        role: Role.SHIPPER,
        subRole: SubRole.OWNER,
        organizationId: created.id,
        // No onboarding flow exists for this role — see shipper/layout.tsx.
        hasOnboarded: true,
        locale: Locale.zh,
      },
    });

    return created;
  });

  await writeAuditLog({
    actorUserId: admin.id,
    action: "shipper.partner.created",
    targetType: "Organization",
    targetId: org.id,
    payload: { displayName: org.displayName, email },
  });

  revalidatePath("/[lang]/admin/shipments/new", "page");
  return { ok: true as const, id: org.id };
}

/**
 * §2.2.1 / §2.1.1 — attach the order invoice and product photos to a brief.
 *
 * Kept separate from `createShipmentForOrder` because files can't round-trip
 * through the same validation-and-retry path cleanly: if the brief is rejected
 * the uploads would be lost and the admin would have to re-pick them. The
 * shipment exists first; documents land against it.
 */
export async function attachShipmentDocuments(_prev: unknown, formData: FormData) {
  const user = await requireRole(Role.ADMIN, Role.AGENT);

  const shipmentId = String(formData.get("shipmentId") ?? "");
  if (!shipmentId) return { ok: false as const, error: "missing_shipment" };

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    select: { id: true },
  });
  if (!shipment) return { ok: false as const, error: "not_found" };

  const invoices = formData.getAll("invoice").filter((f): f is File => f instanceof File);
  if (invoices.length === 0) return { ok: false as const, error: "missing_invoice" };

  const { errors } = await storeAttachments({
    contextType: AttachmentContext.SHIPMENT_INVOICE,
    contextId: shipment.id,
    uploaderId: user.id,
    files: invoices,
  });
  if (errors.length > 0) return { ok: false as const, error: "upload_failed" };

  await writeAuditLog({
    actorUserId: user.id,
    action: "shipment.invoice.attached",
    targetType: "Shipment",
    targetId: shipment.id,
  });

  revalidatePath("/[lang]/admin/shipments", "page");
  return { ok: true as const };
}

/**
 * §3.2 — revise the brief after the fact.
 *
 * The spec makes re-pricing mandatory whenever weight, dimensions, method,
 * address or composition change, so this does not silently edit: it flips
 * `quoteStale`, which invalidates the fixed price, and tells the shipper a
 * justified revision is owed. Only the fields §3.2 names are editable here —
 * changing anything else wouldn't oblige a re-quote and belongs elsewhere.
 */
export async function reviseShipmentBrief(_prev: unknown, formData: FormData) {
  const user = await requireRole(Role.ADMIN, Role.AGENT);

  const shipmentId = String(formData.get("shipmentId") ?? "");
  const shippingMethod = String(formData.get("shippingMethod") ?? "").trim();
  const totalWeightKg = Number(formData.get("totalWeightKg"));
  const lengthCm = Number(formData.get("lengthCm"));
  const widthCm = Number(formData.get("widthCm"));
  const heightCm = Number(formData.get("heightCm"));
  const destAddress = String(formData.get("destAddress") ?? "").trim();
  const destCity = String(formData.get("destCity") ?? "").trim();
  const destCountry = String(formData.get("destCountry") ?? "").trim();

  if (!shipmentId) return { ok: false as const, error: "missing_shipment" };
  if (!shippingMethod) return { ok: false as const, error: "missing_method" };
  for (const n of [totalWeightKg, lengthCm, widthCm, heightCm]) {
    if (!Number.isFinite(n) || n <= 0) {
      return { ok: false as const, error: "invalid_measurements" };
    }
  }
  if (!destAddress || !destCity || !destCountry) {
    return { ok: false as const, error: "missing_destination" };
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    select: { id: true, reference: true, acceptedQuoteId: true, shipperOrgId: true },
  });
  if (!shipment) return { ok: false as const, error: "not_found" };

  await prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      shippingMethod,
      totalWeightKg,
      lengthCm,
      widthCm,
      heightCm,
      destAddress,
      destCity,
      destCountry,
      // Only meaningful if a price was actually locked in.
      quoteStale: shipment.acceptedQuoteId !== null,
    },
  });

  await prisma.shipmentEvent.create({
    data: {
      shipmentId: shipment.id,
      status: ShipmentStatus.QUOTE_REQUESTED,
      note: "Brief revised — re-quote required (§3.2)",
      actorId: user.id,
      clientVisible: false,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "shipment.brief.revised",
    targetType: "Shipment",
    targetId: shipment.id,
  });

  if (shipment.shipperOrgId) {
    const shipperUsers = await prisma.user.findMany({
      where: { organizationId: shipment.shipperOrgId, role: Role.SHIPPER, deletedAt: null },
      select: { id: true },
    });
    await emitNotificationToMany(
      shipperUsers.map((u) => u.id),
      {
        type: NotificationType.SHIPMENT_QUOTE,
        vars: { reference: shipment.reference },
        contextType: "Shipment",
        contextId: shipment.id,
      },
    );
  }

  revalidatePath("/[lang]/admin/shipments", "page");
  return { ok: true as const };
}
