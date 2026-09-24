import "server-only";
import { OrderStage as PrismaStage, OrderState as PrismaState } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";
import {
  STAGES,
  canTransition,
  type OrderStage,
  type OrderState,
} from "./lifecycle";

/**
 * Move an order, and remember that it moved.
 *
 * One function rather than an update scattered across the places that cause a
 * transition — a reconciled payment, a signed quotation, an agent pressing
 * "publish". Each of those used to set `Order.status` directly and none of
 * them left a trace, which is why the canvas's timeline had nothing to draw.
 *
 * Three things happen together or not at all: the order's position changes,
 * an event is appended, and the audit log records who did it. In one
 * transaction, because an order whose state moved but whose timeline did not
 * is exactly the inconsistency the timeline exists to rule out.
 */
export type StageChange = {
  orderId: string;
  state: OrderState;
  /** Optional: a state can be entered before any sub-state is chosen. */
  stage?: OrderStage | null;
  /** The note shown to the client, from "Commentaire pour le client". */
  comment?: string | null;
  /** Null for transitions a scheduled job made rather than a person. */
  actorId?: string | null;
};

export type StageResult =
  | { ok: true; eventId: string }
  | { ok: false; error: "not_found" | "illegal_transition" | "stage_mismatch" };

export async function recordStage(change: StageChange): Promise<StageResult> {
  const { orderId, state, stage = null, comment = null, actorId = null } = change;

  // A sub-state belongs to exactly one state. Accepting a mismatched pair
  // would put an order in a position the canvas does not have, and every
  // screen that reads it would then have to decide which half to believe.
  if (stage && STAGES[stage].state !== state) {
    return { ok: false, error: "stage_mismatch" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, state: true },
  });
  if (!order) return { ok: false, error: "not_found" };

  // An order with no state yet is being adopted into the lifecycle, and any
  // starting position is legitimate. After that the canvas's rules apply.
  if (order.state && !canTransition(order.state as OrderState, state)) {
    return { ok: false, error: "illegal_transition" };
  }

  const event = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { state: state as PrismaState, stage: (stage ?? null) as PrismaStage | null },
    });
    return tx.orderStageEvent.create({
      data: {
        orderId,
        state: state as PrismaState,
        stage: (stage ?? null) as PrismaStage | null,
        // Copied rather than joined: see the column's own note. What the
        // client was shown at the time must stay true even if the canvas
        // later reclassifies a sub-state.
        clientVisible: stage ? STAGES[stage].clientVisible : true,
        comment,
        actorId,
      },
      select: { id: true },
    });
  });

  await writeAuditLog({
    actorUserId: actorId ?? undefined,
    action: "order.stage_changed",
    targetType: "Order",
    targetId: orderId,
    payload: { from: order.state, state, stage, published: Boolean(comment) },
  });

  return { ok: true, eventId: event.id };
}

/**
 * An order's timeline, oldest first.
 *
 * `forClient` is the whole access-control story for this data: an agent and
 * an administrator see every step, a client sees the ones the canvas marks
 * public. Filtered in the query rather than after it, so an internal step
 * never reaches a page that would have to remember to drop it.
 */
export async function orderTimeline(orderId: string, forClient: boolean) {
  return prisma.orderStageEvent.findMany({
    where: { orderId, ...(forClient ? { clientVisible: true } : {}) },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      state: true,
      stage: true,
      comment: true,
      createdAt: true,
      clientVisible: true,
      actor: { select: { id: true, name: true, image: true } },
    },
  });
}
