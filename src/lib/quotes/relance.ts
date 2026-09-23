import "server-only";
import { NotificationType, QuoteStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Quote relance — partner round 4.
 *
 * A quote that's been forwarded to the buyer (status=SENT_TO_CLIENT)
 * but hasn't been actioned (no accept / reject / order) within
 * `RELANCE_DAYS` triggers one reminder. We send the notification to:
 *   - every CLIENT user in the buyer's org (the deciders)
 *   - the assigned agent (so they know it's still stuck)
 *
 * Idempotent — once `Quote.relancedAt` is stamped we never re-send.
 * The agent can pick up the phone if the buyer still doesn't move.
 *
 * Runs from /api/cron/quotes-relance (cron-trigger pattern shared
 * with the other admin crons). Cadence: once a day at ~07:00 UTC.
 */

const RELANCE_DAYS = 3;
const DAY_MS = 1000 * 60 * 60 * 24;

export async function dispatchQuoteRelances(): Promise<{
  reviewed: number;
  reminded: number;
}> {
  const cutoff = new Date(Date.now() - RELANCE_DAYS * DAY_MS);

  const candidates = await prisma.quote.findMany({
    where: {
      status: QuoteStatus.SENT_TO_CLIENT,
      relancedAt: null,
      // Forwarded-to-client timestamp isn't tracked explicitly; the
      // updatedAt on a SENT_TO_CLIENT row reflects when the agent
      // forwarded it. Close enough for v1.
      updatedAt: { lt: cutoff },
      validUntil: { gt: new Date() },
    },
    select: {
      id: true,
      agentId: true,
      request: {
        select: {
          id: true,
          reference: true,
          title: true,
          clientOrgId: true,
        },
      },
    },
  });

  let reminded = 0;
  for (const q of candidates) {
    const recipients: string[] = [];
    const clientUsers = await prisma.user.findMany({
      where: {
        organizationId: q.request.clientOrgId,
        role: Role.CLIENT,
        deletedAt: null,
      },
      select: { id: true },
    });
    recipients.push(...clientUsers.map((u) => u.id));
    if (q.agentId) recipients.push(q.agentId);

    if (recipients.length === 0) continue;

    await emitNotificationToMany(recipients, {
      type: NotificationType.SYSTEM,
      vars: {
        systemKey: "quote_relance",
        reference: q.request.reference,
      },
      contextType: "SourcingRequest",
      contextId: q.request.id,
    });
    await prisma.quote.update({
      where: { id: q.id },
      data: { relancedAt: new Date() },
    });
    await writeAuditLog({
      // System cron — no actor user.
      action: "quote.relanced",
      targetType: "Quote",
      targetId: q.id,
      payload: { reference: q.request.reference, recipients: recipients.length },
    });
    reminded++;
  }

  return { reviewed: candidates.length, reminded };
}
