"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import {
  Incoterm,
  KycStatus,
  NotificationType,
  OrgType,
  QuoteStatus,
  Role,
  SourcingStatus,
  TenderInvitationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import {
  emitNotification,
  emitNotificationToMany,
} from "@/lib/notifications/emit";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { applyBuyerMarkup } from "@/lib/orders/pricing";

// =============================================================
// Tender invitations (agent → factories)
// =============================================================

const SendTendersSchema = z.object({
  requestId: z.string().min(1),
  factoryIds: z.array(z.string().min(1)).min(1).max(10),
});

const TENDER_TTL_DAYS = 7;

export type SendTendersResult =
  | { ok: true; created: number; skipped: number }
  | { ok: false; error: string };

/**
 * Send tender invitations from the agent to selected factories. Skips any
 * factory that already has an active invitation for the same request
 * (idempotency on the @@unique([requestId, factoryOrgId]) constraint).
 */
export async function sendTenderInvitationsAction(
  requestId: string,
  factoryIds: string[],
): Promise<SendTendersResult> {
  const parsed = SendTendersSchema.safeParse({ requestId, factoryIds });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const agent = await requireRole(Role.AGENT);

  const request = await prisma.sourcingRequest.findUnique({
    where: { id: parsed.data.requestId },
    select: {
      id: true,
      agentId: true,
      status: true,
      category: true,
      preTenderApprovedAt: true,
    },
  });
  if (!request) return { ok: false, error: "Request not found." };
  if (request.agentId !== agent.id) {
    return { ok: false, error: "You are not assigned to this request." };
  }
  // Partner #14: admin must validate the brief before tenders go out.
  if (!request.preTenderApprovedAt) {
    return {
      ok: false,
      error: "This request still needs admin pre-tender approval.",
    };
  }

  // Validate the factories exist + are verified
  const factories = await prisma.organization.findMany({
    where: {
      id: { in: parsed.data.factoryIds },
      type: OrgType.FACTORY,
      kycStatus: KycStatus.VERIFIED,
      deletedAt: null,
    },
    select: {
      id: true,
      factoryProfile: { select: { category: true } },
    },
  });
  if (factories.length !== parsed.data.factoryIds.length) {
    return { ok: false, error: "Some selected factories are not eligible." };
  }

  // Find any existing invites to skip
  const existing = await prisma.tenderInvitation.findMany({
    where: { requestId: request.id, factoryOrgId: { in: factories.map((f) => f.id) } },
    select: { factoryOrgId: true },
  });
  const alreadyInvited = new Set(existing.map((e) => e.factoryOrgId));

  const toCreate = factories.filter((f) => !alreadyInvited.has(f.id));
  if (toCreate.length === 0) {
    return { ok: false, error: "All selected factories are already invited." };
  }

  const expiresAt = new Date(Date.now() + TENDER_TTL_DAYS * 24 * 60 * 60 * 1000);

  // create() per item so we get IDs back — needed to wire each
  // notification to its specific TenderInvitation (partner #11). The
  // previous createMany + grouped notify lost the per-factory link.
  const created = await Promise.all(
    toCreate.map((f) =>
      prisma.tenderInvitation.create({
        data: {
          requestId: request.id,
          factoryOrgId: f.id,
          matchingScore:
            f.factoryProfile?.category === request.category ? 90 : 60,
          status: TenderInvitationStatus.INVITED,
          expiresAt,
        },
        select: { id: true, factoryOrgId: true },
      }),
    ),
  );

  await writeAuditLog({
    actorUserId: agent.id,
    action: "tender.invitations_sent",
    targetType: "SourcingRequest",
    targetId: request.id,
    payload: {
      factoryIds: toCreate.map((f) => f.id),
      count: toCreate.length,
    },
  });

  revalidatePath("/[lang]/agent/requests", "page");
  revalidatePath("/[lang]/factory/tenders", "page");

  // Notify the owners of each invited factory with their specific
  // invitation id, so clicking the notification opens the tender record
  // (partner item #11) instead of dumping them on the list.
  const invitationByOrg = new Map(
    created.map((c) => [c.factoryOrgId, c.id]),
  );
  const factoryOwnerRows = await prisma.user.findMany({
    where: {
      organizationId: { in: toCreate.map((f) => f.id) },
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true, organizationId: true },
  });
  await Promise.all(
    factoryOwnerRows.map((u) => {
      const invitationId = invitationByOrg.get(u.organizationId);
      if (!invitationId) return Promise.resolve();
      return emitNotification({
        recipientUserId: u.id,
        type: NotificationType.SYSTEM,
        vars: { systemKey: "tender_invited" },
        contextType: "TenderInvitation",
        contextId: invitationId,
      });
    }),
  );

  return { ok: true, created: toCreate.length, skipped: alreadyInvited.size };
}

// =============================================================
// Factory quote submission
// =============================================================

const QuoteSchema = z.object({
  invitationId: z.string().min(1),
  unitPriceEur: z.coerce.number().positive("Unit price must be positive."),
  quantity: z.coerce.number().int().positive("Quantity must be positive."),
  leadTimeDays: z.coerce.number().int().positive("Lead time must be positive."),
  // Lead time unit — the entered value is converted to canonical days
  // below before persisting. Same pattern as the marketplace product form.
  leadTimeUnit: z.enum(["DAY", "MONTH"]).default("DAY"),
  moq: z.coerce.number().int().nonnegative("MOQ cannot be negative."),
  incoterm: z.enum(Incoterm),
  validityDays: z.coerce.number().int().min(1).max(60).default(14),
  // Deposit as a whole-number percentage 30–50. Stored as basis points
  // (`pct * 100`) so the math + DB column stays integer.
  depositPercentage: z.coerce
    .number()
    .int()
    .min(30, "Deposit must be at least 30%.")
    .max(50, "Deposit cannot exceed 50%.")
    .default(30),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type SubmitQuoteState = {
  error?: string;
};

/**
 * Factory submits a quote in response to a tender invitation.
 *
 * v1 pricing math (rates live in src/lib/orders/pricing.ts):
 *   unitPriceCentsClient = applyBuyerMarkup(unitPriceCentsFactory)
 *   marginCents          = totalClient − (factoryUnit × quantity)
 *
 * No caps (removed 2026-05-26 — see docs/pricing-v2.md). Margin shown
 * here is the absolute platform take for the quote, not the per-side
 * split — supplier fee is deducted later at payout time.
 *
 * qualificationScore defaults to 80 — proper scoring per spec §4.4 is a
 * Phase 6 item once we have median-of-received-quotes context.
 */
export async function submitQuoteAction(
  _prev: SubmitQuoteState,
  formData: FormData,
): Promise<SubmitQuoteState> {
  const factory = await requireRole(Role.FACTORY);

  const parsed = QuoteSchema.safeParse({
    invitationId: formData.get("invitationId"),
    unitPriceEur: formData.get("unitPriceEur"),
    quantity: formData.get("quantity"),
    leadTimeDays: formData.get("leadTimeDays"),
    moq: formData.get("moq"),
    incoterm: formData.get("incoterm"),
    validityDays: formData.get("validityDays") ?? "14",
    depositPercentage: formData.get("depositPercentage") ?? "30",
    leadTimeUnit: formData.get("leadTimeUnit") ?? "DAY",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const invitation = await prisma.tenderInvitation.findUnique({
    where: { id: parsed.data.invitationId },
    select: {
      id: true,
      requestId: true,
      factoryOrgId: true,
      status: true,
      expiresAt: true,
      request: { select: { agentId: true, quantity: true } },
    },
  });
  if (!invitation) return { error: "Tender invitation not found." };
  if (invitation.factoryOrgId !== factory.organizationId) {
    return { error: "This invitation isn't addressed to your factory." };
  }
  if (invitation.expiresAt < new Date()) {
    return { error: "This invitation has expired." };
  }
  if (invitation.status === TenderInvitationStatus.RESPONDED) {
    return { error: "You've already submitted a quote for this invitation." };
  }

  const unitPriceCentsFactory = Math.round(parsed.data.unitPriceEur * 100);
  const unitPriceCentsClient = applyBuyerMarkup(unitPriceCentsFactory);
  const totalCentsClient = unitPriceCentsClient * parsed.data.quantity;
  const marginCents = totalCentsClient - unitPriceCentsFactory * parsed.data.quantity;
  const validUntil = new Date(
    Date.now() + parsed.data.validityDays * 24 * 60 * 60 * 1000,
  );

  let quoteId: string;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          requestId: invitation.requestId,
          factoryOrgId: factory.organizationId,
          agentId: invitation.request.agentId,
          unitPriceCentsFactory,
          marginCents,
          unitPriceCentsClient,
          totalCentsClient,
          quantity: parsed.data.quantity,
          // Quote stores canonical days regardless of how the factory
          // entered it. leadTimeUnit lets us render back in the original
          // unit and pre-fill the form on edit.
          leadTimeDays:
            parsed.data.leadTimeUnit === "MONTH"
              ? Math.round(parsed.data.leadTimeDays * 30)
              : parsed.data.leadTimeDays,
          leadTimeUnit: parsed.data.leadTimeUnit,
          moq: parsed.data.moq,
          incoterm: parsed.data.incoterm,
          validUntil,
          qualificationScore: 80, // v1 default — full §4.4 scoring in Phase 6
          depositPercentageBps: parsed.data.depositPercentage * 100,
          status: QuoteStatus.SENT_TO_AGENT,
          notes: parsed.data.notes || null,
        },
        select: { id: true },
      });

      await tx.tenderInvitation.update({
        where: { id: invitation.id },
        data: {
          status: TenderInvitationStatus.RESPONDED,
          respondedAt: new Date(),
        },
      });

      return quote;
    });
    quoteId = result.id;
  } catch (e) {
    await writeAuditLog({
      actorUserId: factory.id,
      action: "quote.submit_failed",
      payload: { invitationId: invitation.id, message: String(e) },
      level: "WARN",
    });
    return { error: "Something went wrong submitting your quote. Please try again." };
  }

  await writeAuditLog({
    actorUserId: factory.id,
    action: "quote.submitted",
    targetType: "Quote",
    targetId: quoteId,
    payload: { requestId: invitation.requestId, factoryOrgId: factory.organizationId },
  });

  // Notify the agent that a new quote is in their queue.
  if (invitation.request.agentId) {
    const requestRow = await prisma.sourcingRequest.findUnique({
      where: { id: invitation.requestId },
      select: { reference: true },
    });
    const factoryOrg = await prisma.organization.findUnique({
      where: { id: factory.organizationId },
      select: { displayName: true },
    });
    await emitNotification({
      recipientUserId: invitation.request.agentId,
      type: NotificationType.QUOTE_RECEIVED,
      vars: {
        reference: requestRow?.reference,
        factoryName: factoryOrg?.displayName,
      },
      contextType: "Quote",
      contextId: quoteId,
    });
  }

  const locale = await currentLocale();
  revalidatePath("/[lang]/factory/tenders", "page");
  revalidatePath("/[lang]/agent/requests", "page");
  // Stay on the tender we just acted on so the factory sees the "quote
  // submitted" success state in place. Going back to the list buried the
  // outcome and forced the factory to find the record again.
  redirect(`/${locale}/factory/tenders/${parsed.data.invitationId}`);
}

// =============================================================
// Agent → client quote forwarding
// =============================================================

export type ForwardQuoteResult = { ok: true } | { ok: false; error: string };

export async function sendQuoteToClientAction(
  quoteId: string,
): Promise<ForwardQuoteResult> {
  const agent = await requireRole(Role.AGENT);

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: {
      id: true,
      status: true,
      agentId: true,
      requestId: true,
      validUntil: true,
    },
  });
  if (!quote) return { ok: false, error: "Quote not found." };
  if (quote.agentId !== agent.id) {
    return { ok: false, error: "This quote isn't on a request you handle." };
  }
  if (quote.status === QuoteStatus.SENT_TO_CLIENT) {
    return { ok: false, error: "Already sent to client." };
  }
  if (quote.status !== QuoteStatus.SENT_TO_AGENT) {
    return { ok: false, error: "This quote can't be forwarded right now." };
  }
  if (quote.validUntil < new Date()) {
    return { ok: false, error: "This quote has expired — ask the factory for a new one." };
  }

  await prisma.$transaction([
    prisma.quote.update({
      where: { id: quote.id },
      data: { status: QuoteStatus.SENT_TO_CLIENT },
    }),
    // Bump request status if this is the first quote going to the client
    prisma.sourcingRequest.updateMany({
      where: {
        id: quote.requestId,
        status: { in: [SourcingStatus.ASSIGNED, SourcingStatus.REQUEST_RECEIVED] },
      },
      data: { status: SourcingStatus.QUOTE_SENT },
    }),
  ]);

  await writeAuditLog({
    actorUserId: agent.id,
    action: "quote.sent_to_client",
    targetType: "Quote",
    targetId: quote.id,
    payload: { requestId: quote.requestId },
  });

  // Notify the client's owners that a quote is awaiting their decision.
  const request = await prisma.sourcingRequest.findUnique({
    where: { id: quote.requestId },
    select: { reference: true, clientOrgId: true },
  });
  if (request) {
    const clientOwnerIds = await prisma.user.findMany({
      where: {
        organizationId: request.clientOrgId,
        role: Role.CLIENT,
        deletedAt: null,
      },
      select: { id: true },
    });
    await emitNotificationToMany(
      clientOwnerIds.map((u) => u.id),
      {
        type: NotificationType.QUOTE_RECEIVED,
        vars: { reference: request.reference },
        contextType: "Quote",
        contextId: quote.id,
      },
    );
  }

  revalidatePath("/[lang]/agent/requests", "page");
  revalidatePath("/[lang]/client/requests", "page");
  return { ok: true };
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}
