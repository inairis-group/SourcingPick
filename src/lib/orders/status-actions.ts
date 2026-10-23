"use server";

import { revalidatePath } from "next/cache";
import { AdminScope, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { hasAdminScope } from "@/lib/permissions/admin-scopes";
import { requireRole } from "@/lib/permissions/guards";
import { recordStage } from "./stage";
import { STAGES, statusFormStages, type OrderStage } from "./lifecycle";

export type UpdateStatusState = {
  /** A code the form turns into words; never prose from here. */
  error?: "no_stage" | "not_found" | "illegal_transition" | "comment_too_long";
  saved?: boolean;
};

const COMMENT_MAX = 2000;

/**
 * "Mettre à jour l'état" — `SaaS-Admin-Statut` and `SaaS-Agent-Statut`.
 *
 * Who: an agent on the orders assigned to them, an administrator on any order
 * (the canvas: "L'administration dispose de tous les droits d'un agent").
 *
 * What: one of the fifteen sub-states the form offers — and only those, so the
 * form cannot be used to enter a state that another event owns (a signed
 * quotation, a reconciled payment, a cancellation). `recordStage` then applies
 * the canvas's own rules: an order moves forward, never back.
 *
 * The comment is the "Commentaire pour le client". It is stored with the step
 * and therefore shown to the client with it — or not shown, when the step is
 * one the canvas marks internal, since the visibility is the step's.
 */
export async function updateOrderStatusAction(
  _prev: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const user = await requireRole(Role.AGENT, Role.ADMIN);

  const orderId = String(formData.get("orderId") ?? "");
  const stageRaw = String(formData.get("stage") ?? "");
  const stage = statusFormStages().find((s) => s === stageRaw) as OrderStage | undefined;
  if (!orderId || !stage) return { error: "no_stage" };

  // The admin screen is reached from the requests area, so it asks for the same
  // scope; an agent is held to their own orders in the query below.
  if (user.role === Role.ADMIN && !hasAdminScope(user.adminScopes, AdminScope.REQUESTS)) {
    return { error: "not_found" };
  }

  const comment = String(formData.get("comment") ?? "").trim();
  if (comment.length > COMMENT_MAX) return { error: "comment_too_long" };

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      deletedAt: null,
      ...(user.role === Role.AGENT ? { agentId: user.id } : {}),
    },
    select: { id: true },
  });
  if (!order) return { error: "not_found" };

  const result = await recordStage({
    orderId: order.id,
    state: STAGES[stage].state,
    stage,
    comment: comment || null,
    actorId: user.id,
  });
  if (!result.ok) {
    // `stage_mismatch` cannot happen here — the state is read off the stage —
    // so anything that is not a missing order is a move the canvas forbids.
    return { error: result.error === "not_found" ? "not_found" : "illegal_transition" };
  }

  revalidatePath("/[lang]/agent/orders/[id]", "page");
  revalidatePath("/[lang]/admin/orders/[id]", "page");
  revalidatePath("/[lang]/client/orders/[id]", "page");
  return { saved: true };
}
