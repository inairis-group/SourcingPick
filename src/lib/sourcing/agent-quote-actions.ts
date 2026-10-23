"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  Incoterm,
  KycStatus,
  NotificationType,
  OrgType,
  QuoteStatus,
  Role,
  SourcingStatus,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { applyBuyerMarkup } from "@/lib/orders/pricing";

/**
 * Agent-direct quote entry — partner round 4.
 *
 * Lets the agent enter a quote on behalf of a factory they've
 * negotiated with by phone / WeChat / email. The factory can be:
 *   - An existing platform factory (pick `factoryOrgId`), or
 *   - An off-platform factory: agent types `factoryName` + `factoryCountry`
 *     and we lazy-create a shadow Organization (`isShadowOrg = true`).
 *
 * The resulting Quote lands at `SENT_TO_CLIENT` — the agent has
 * already vetted the offer, so the buyer can act on it immediately.
 * Audit log records the agent + whether a shadow org was minted.
 */

const AgentQuoteSchema = z
  .object({
    requestId: z.string().min(1),
    factoryOrgId: z.string().optional(),
    factoryName: z.string().trim().max(200).optional(),
    factoryCountry: z
      .string()
      .trim()
      .length(2)
      .toUpperCase()
      .optional(),
    factoryCity: z.string().trim().max(100).optional(),
    unitPriceCentsFactory: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    leadTimeDays: z.coerce.number().int().positive(),
    moq: z.coerce.number().int().positive(),
    incoterm: z.enum(Incoterm),
    depositPercentage: z.coerce.number().int().min(30).max(50).default(40),
    validityDays: z.coerce.number().int().min(7).max(30).default(15),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine(
    (d) =>
      Boolean(d.factoryOrgId) ||
      (Boolean(d.factoryName) && Boolean(d.factoryCountry)),
    {
      path: ["factoryName"],
      message:
        "Either pick a registered factory or enter a name + country for an off-platform one.",
    },
  );

export type AgentQuoteResult =
  | { ok: true; quoteId: string }
  | { ok: false; error: string };

export async function agentSubmitDirectQuoteAction(
  input: z.input<typeof AgentQuoteSchema>,
): Promise<AgentQuoteResult> {
  const agent = await requireRole(Role.AGENT);
  const parsed = AgentQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const request = await prisma.sourcingRequest.findUnique({
    where: { id: parsed.data.requestId },
    select: {
      id: true,
      reference: true,
      agentId: true,
      clientOrgId: true,
      status: true,
    },
  });
  if (!request) return { ok: false, error: "Request not found." };
  if (request.agentId !== agent.id) {
    return { ok: false, error: "You're not assigned to this request." };
  }

  // Resolve the factory org — pick an existing one or mint a shadow.
  let factoryOrgId: string;
  let shadowCreated = false;
  if (parsed.data.factoryOrgId) {
    const existing = await prisma.organization.findUnique({
      where: { id: parsed.data.factoryOrgId },
      select: { id: true, type: true, deletedAt: true },
    });
    if (!existing || existing.deletedAt || existing.type !== OrgType.FACTORY) {
      return { ok: false, error: "Factory not found." };
    }
    factoryOrgId = existing.id;
  } else {
    const displayName = parsed.data.factoryName!;
    const country = parsed.data.factoryCountry!;
    const city = parsed.data.factoryCity?.trim() || country;
    // Reuse an existing shadow with the same name + country to avoid
    // duplicating shadows on repeat use.
    const existingShadow = await prisma.organization.findFirst({
      where: {
        isShadowOrg: true,
        type: OrgType.FACTORY,
        displayName,
        country,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (existingShadow) {
      factoryOrgId = existingShadow.id;
    } else {
      const shadow = await prisma.organization.create({
        data: {
          type: OrgType.FACTORY,
          legalName: displayName,
          displayName,
          country,
          city,
          address: "Off-platform — registered by agent",
          kycStatus: KycStatus.PENDING,
          isShadowOrg: true,
        },
        select: { id: true },
      });
      factoryOrgId = shadow.id;
      shadowCreated = true;
    }
  }

  const unitPriceCentsClient = applyBuyerMarkup(
    parsed.data.unitPriceCentsFactory,
    "sourcing",
  );
  const totalCentsClient = unitPriceCentsClient * parsed.data.quantity;
  const marginCents =
    totalCentsClient - parsed.data.unitPriceCentsFactory * parsed.data.quantity;
  const validUntil = new Date(
    Date.now() + parsed.data.validityDays * 24 * 60 * 60 * 1000,
  );

  const quote = await prisma.quote.create({
    data: {
      requestId: request.id,
      factoryOrgId,
      agentId: agent.id,
      unitPriceCentsFactory: parsed.data.unitPriceCentsFactory,
      marginCents,
      unitPriceCentsClient,
      totalCentsClient,
      quantity: parsed.data.quantity,
      leadTimeDays: parsed.data.leadTimeDays,
      moq: parsed.data.moq,
      incoterm: parsed.data.incoterm,
      validUntil,
      // Agent has already qualified the offer — default score reflects
      // that the agent's vouching for it. Buyer-side ranking still
      // sorts by total cost, lead time, etc.
      qualificationScore: 80,
      depositPercentageBps: parsed.data.depositPercentage * 100,
      status: QuoteStatus.SENT_TO_CLIENT,
      notes: parsed.data.notes || null,
    },
    select: { id: true },
  });

  // Bump the request to QUOTE_SENT if it isn't already further down.
  if (
    request.status === SourcingStatus.ASSIGNED ||
    request.status === SourcingStatus.REQUEST_RECEIVED
  ) {
    await prisma.sourcingRequest.update({
      where: { id: request.id },
      data: { status: SourcingStatus.QUOTE_SENT },
    });
  }

  // Spin up the polymorphic thread so client + agent can chat about it.
  await prisma.thread.create({
    data: {
      contextType: ThreadContextType.QUOTE,
      contextId: quote.id,
    },
  });

  await writeAuditLog({
    actorUserId: agent.id,
    action: "quote.agent_direct_submitted",
    targetType: "Quote",
    targetId: quote.id,
    payload: {
      requestRef: request.reference,
      factoryOrgId,
      shadowCreated,
      cents: {
        unitFactory: parsed.data.unitPriceCentsFactory,
        unitClient: unitPriceCentsClient,
        total: totalCentsClient,
        margin: marginCents,
      },
    },
    level: shadowCreated ? "WARN" : "INFO",
  });

  // Notify the buyer org.
  const clientUserIds = (
    await prisma.user.findMany({
      where: {
        organizationId: request.clientOrgId,
        role: Role.CLIENT,
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((u) => u.id);
  await emitNotificationToMany(clientUserIds, {
    type: NotificationType.QUOTE_RECEIVED,
    vars: { reference: request.reference },
    contextType: "SourcingRequest",
    contextId: request.id,
  });

  revalidatePath("/[lang]/client/quotes", "page");
  revalidatePath("/[lang]/client/requests/[id]", "page");
  revalidatePath("/[lang]/agent/quotes", "page");
  revalidatePath("/[lang]/agent/requests/[id]", "page");
  return { ok: true, quoteId: quote.id };
}
