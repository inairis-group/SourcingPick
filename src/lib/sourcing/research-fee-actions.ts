"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  InvoiceStatus,
  InvoiceType,
  NotificationType,
  ResearchFeeStatus,
  ResearchFeeUnit,
  Role,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { computeResearchFee } from "@/lib/orders/pricing";
import { generateUniqueReference } from "@/lib/sourcing/reference";

export type ResearchFeeResult = { ok: true } | { ok: false; error: string };

const QuoteSchema = z.object({
  unit: z.enum(ResearchFeeUnit),
  quantity: z.coerce.number().int().min(1).max(60),
});

/**
 * Agent quotes the research fee on a request they're assigned to.
 *
 *   - Computes the amount (€125/day or €500/week × quantity).
 *   - Issues a RESEARCH_FEE invoice to the client org (status ISSUED, due
 *     immediately — research is billed before agent work begins).
 *   - Stamps the fee fields on the request + status QUOTED.
 *   - Notifies the client.
 *
 * Re-quoting before payment replaces the prior invoice (VOID + new). Once
 * the fee is PAID, re-quoting is refused. Credit-back (returning the fee as
 * platform credit on order) is a later phase.
 */
export async function setResearchFeeAction(
  requestId: string,
  unit: ResearchFeeUnit,
  quantity: number,
): Promise<ResearchFeeResult> {
  const user = await requireRole(Role.AGENT);

  const parsed = QuoteSchema.safeParse({ unit, quantity });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const request = await prisma.sourcingRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      agentId: true,
      clientOrgId: true,
      researchFeeStatus: true,
      researchFeeInvoiceId: true,
    },
  });
  if (!request) return { ok: false, error: "Request not found." };
  if (request.agentId !== user.id) {
    return { ok: false, error: "You're not the assigned agent for this request." };
  }
  if (request.researchFeeStatus === ResearchFeeStatus.PAID) {
    return { ok: false, error: "The research fee has already been paid." };
  }

  const amountCents = computeResearchFee(parsed.data.unit, parsed.data.quantity);
  const now = new Date();
  const invoiceReference = await generateUniqueReference("INV");

  await prisma.$transaction(async (tx) => {
    // Void a prior unpaid research-fee invoice if re-quoting.
    if (request.researchFeeInvoiceId) {
      await tx.invoice.updateMany({
        where: {
          id: request.researchFeeInvoiceId,
          status: { in: [InvoiceStatus.DRAFT, InvoiceStatus.ISSUED] },
        },
        data: { status: InvoiceStatus.VOID },
      });
    }

    const invoice = await tx.invoice.create({
      data: {
        reference: invoiceReference,
        organizationId: request.clientOrgId,
        type: InvoiceType.RESEARCH_FEE,
        amountCents,
        issuedAt: now,
        dueAt: now,
        status: InvoiceStatus.ISSUED,
      },
      select: { id: true },
    });

    await tx.sourcingRequest.update({
      where: { id: request.id },
      data: {
        researchFeeUnit: parsed.data.unit,
        researchFeeQuantity: parsed.data.quantity,
        researchFeeCents: amountCents,
        researchFeeStatus: ResearchFeeStatus.QUOTED,
        researchFeeInvoiceId: invoice.id,
      },
    });
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "request.research_fee_quoted",
    targetType: "SourcingRequest",
    targetId: request.id,
    payload: { unit: parsed.data.unit, quantity: parsed.data.quantity, amountCents },
  });

  // Notify the client there's a research fee to settle.
  const clientUserIds = (
    await prisma.user.findMany({
      where: { organizationId: request.clientOrgId, deletedAt: null },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(clientUserIds, {
    type: NotificationType.INVOICE_DUE,
    vars: { reference: invoiceReference },
    contextType: "SourcingRequest",
    contextId: request.id,
  });

  revalidatePath("/[lang]/agent/requests", "page");
  revalidatePath("/[lang]/client/requests", "page");
  return { ok: true };
}

/**
 * Agent/admin waives the research fee — voids any outstanding invoice and
 * marks the fee WAIVED. Used when scope is trivial or as a goodwill gesture.
 */
export async function waiveResearchFeeAction(
  requestId: string,
): Promise<ResearchFeeResult> {
  const user = await requireRole(Role.AGENT);

  const request = await prisma.sourcingRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      agentId: true,
      researchFeeStatus: true,
      researchFeeInvoiceId: true,
    },
  });
  if (!request) return { ok: false, error: "Request not found." };
  if (request.agentId !== user.id) {
    return { ok: false, error: "You're not the assigned agent for this request." };
  }
  if (request.researchFeeStatus === ResearchFeeStatus.PAID) {
    return { ok: false, error: "The research fee has already been paid." };
  }

  await prisma.$transaction(async (tx) => {
    if (request.researchFeeInvoiceId) {
      await tx.invoice.updateMany({
        where: {
          id: request.researchFeeInvoiceId,
          status: { in: [InvoiceStatus.DRAFT, InvoiceStatus.ISSUED] },
        },
        data: { status: InvoiceStatus.VOID },
      });
    }
    await tx.sourcingRequest.update({
      where: { id: request.id },
      data: { researchFeeStatus: ResearchFeeStatus.WAIVED },
    });
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "request.research_fee_waived",
    targetType: "SourcingRequest",
    targetId: request.id,
  });

  revalidatePath("/[lang]/agent/requests", "page");
  revalidatePath("/[lang]/client/requests", "page");
  return { ok: true };
}
