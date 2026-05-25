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
    select: { id: true, agentId: true, status: true, category: true },
  });
  if (!request) return { ok: false, error: "Request not found." };
  if (request.agentId !== agent.id) {
    return { ok: false, error: "You are not assigned to this request." };
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

  await prisma.tenderInvitation.createMany({
    data: toCreate.map((f) => ({
      requestId: request.id,
      factoryOrgId: f.id,
      // Simple category-match score for v1. Full §4.3 matching scoring is Phase 6.
      matchingScore: f.factoryProfile?.category === request.category ? 90 : 60,
      status: TenderInvitationStatus.INVITED,
      expiresAt,
    })),
  });

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

  // Notify the owners of each invited factory.
  const factoryOwnerRows = await prisma.user.findMany({
    where: {
      organizationId: { in: toCreate.map((f) => f.id) },
      role: Role.FACTORY,
      deletedAt: null,
    },
    select: { id: true, organizationId: true },
  });
  await Promise.all(
    factoryOwnerRows.map((u) =>
      emitNotification({
        recipientUserId: u.id,
        type: NotificationType.SYSTEM,
        vars: { systemKey: "tender_invited" },
        contextType: "TenderInvitation",
        contextId: u.organizationId,
      }),
    ),
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
  moq: z.coerce.number().int().nonnegative("MOQ cannot be negative."),
  incoterm: z.enum(Incoterm),
  validityDays: z.coerce.number().int().min(1).max(60).default(14),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type SubmitQuoteState = {
  error?: string;
};

/**
 * Factory submits a quote in response to a tender invitation.
 *
 * v1 pricing math:
 *   unitPriceCentsClient = unitPriceCentsFactory × 1.12   (buyer-side 12%)
 *   marginCents          = totalClient − (factoryUnit × quantity)
 *
 * Caps (from docs/pricing-v2.md) aren't applied yet — that lands in
 * Phase 3 when commission is wired into Order/Invoice. Margin shown here
 * is the absolute platform take for the quote, not the per-side split.
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
  const unitPriceCentsClient = Math.round(unitPriceCentsFactory * 1.12);
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
          leadTimeDays: parsed.data.leadTimeDays,
          moq: parsed.data.moq,
          incoterm: parsed.data.incoterm,
          validUntil,
          qualificationScore: 80, // v1 default — full §4.4 scoring in Phase 6
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
  redirect(`/${locale}/factory/tenders`);
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
