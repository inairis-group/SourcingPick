"use server";

import { revalidatePath } from "next/cache";
import {
  Role,
  WebhookSource,
  WebhookStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";
import {
  reconcileWireCredit,
  type WireCreditEvent,
} from "@/lib/payments/reconcile";

/**
 * Admin manual replay for a stalled webhook event (partner item #6).
 *
 * Used when a buyer paid by wire but the memo didn't match — the
 * admin updates the order's reference / acks the deposit out-of-band,
 * then hits Replay so the same payload runs through the reconciler again.
 * Idempotent: if the reconciler already PROCESSED the event, the second
 * run is a no-op via the providerRef uniqueness check inside finalize.
 */
export type ReplayResult = { ok: true } | { ok: false; error: string };

export async function replayWebhookEventAction(
  webhookEventId: string,
): Promise<ReplayResult> {
  if (!webhookEventId) return { ok: false, error: "Invalid id." };

  const admin = await requireRole(Role.ADMIN);

  const event = await prisma.webhookEvent.findUnique({
    where: { id: webhookEventId },
    select: {
      id: true,
      source: true,
      eventType: true,
      payload: true,
      status: true,
      attempts: true,
    },
  });
  if (!event) return { ok: false, error: "Event not found." };

  if (event.source !== WebhookSource.PINGPONG) {
    return {
      ok: false,
      error: "Manual replay is only wired up for PingPong events.",
    };
  }
  if (event.eventType !== "balances#credit") {
    return {
      ok: false,
      error: "Only balance-credit events can be replayed.",
    };
  }

  // Re-parse the stored payload into the reconciler's shape. We don't
  // import the route's reader — it's a private helper there — but the
  // logic is small enough to inline.
  const credit = readBalanceCreditFromStoredPayload(event.payload);
  if (!credit) {
    return { ok: false, error: "Stored payload missing required fields." };
  }

  await prisma.webhookEvent.update({
    where: { id: event.id },
    data: {
      status: WebhookStatus.RETRYING,
      attempts: { increment: 1 },
      lastError: null,
    },
  });

  try {
    const result = await reconcileWireCredit(credit);
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: {
        status: result.matched
          ? WebhookStatus.PROCESSED
          : WebhookStatus.FAILED,
        lastError: result.matched ? null : result.reason,
        processedAt: new Date(),
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: result.matched
        ? "pingpong.webhook_replay_matched"
        : "pingpong.webhook_replay_unmatched",
      level: result.matched ? "INFO" : "WARN",
      targetType: "WebhookEvent",
      targetId: event.id,
      payload: result.matched
        ? { kind: result.kind, ref: result.ref }
        : { reason: result.reason },
    });

    revalidatePath("/[lang]/admin/webhooks", "page");
    if (!result.matched) {
      return { ok: false, error: result.reason };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: {
        status: WebhookStatus.FAILED,
        lastError: msg,
        processedAt: new Date(),
      },
    });
    await writeAuditLog({
      actorUserId: admin.id,
      action: "pingpong.webhook_replay_failed",
      level: "ALERT",
      targetType: "WebhookEvent",
      targetId: event.id,
      payload: { message: msg },
    });
    revalidatePath("/[lang]/admin/webhooks", "page");
    return { ok: false, error: msg };
  }
}

function readBalanceCreditFromStoredPayload(
  payload: unknown,
): WireCreditEvent | null {
  if (!payload || typeof payload !== "object") return null;
  const e = payload as Record<string, unknown>;
  const data = (e.data ?? e) as Record<string, unknown>;

  const transactionId = pickString(
    data.transaction_id,
    data.transactionId,
    data.transferId,
    data.id,
    e.id,
  );
  if (!transactionId) return null;

  const rawAmount = pickNumber(
    data.amount_value,
    data.amount,
    (data.amount as { value?: unknown } | undefined)?.value,
  );
  const currency = pickString(
    data.currency,
    (data.amount as { currency?: unknown } | undefined)?.currency,
  );
  if (rawAmount === null || !currency) return null;

  const amountCents =
    Number.isInteger(rawAmount) && rawAmount > 1000
      ? rawAmount
      : Math.round(rawAmount * 100);

  const memoCandidates = [
    pickString(data.reference, data.reference_number, data.referenceNumber),
    pickString(data.note, data.narrative, data.description),
    pickString(data.merchant_reference, data.merchantReference),
  ].filter((s): s is string => Boolean(s));

  return {
    transactionId,
    amountCents,
    currency: currency.toUpperCase(),
    memoCandidates,
  };
}

function pickString(...candidates: unknown[]): string | null {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim() !== "") return c;
  }
  return null;
}

function pickNumber(...candidates: unknown[]): number | null {
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string" && c.trim() !== "") {
      const n = Number(c);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}
