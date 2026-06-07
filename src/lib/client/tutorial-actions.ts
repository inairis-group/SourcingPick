"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Mark the first-order tutorial as dismissed for the caller. Partner
 * #16. Idempotent — re-calling on an already-dismissed user is a
 * no-op.
 */
export async function dismissClientTutorialAction(): Promise<{ ok: true }> {
  const user = await requireAuth();
  await prisma.user.update({
    where: { id: user.id },
    data: { clientTutorialDismissedAt: new Date() },
  });
  await writeAuditLog({
    actorUserId: user.id,
    action: "client.tutorial_dismissed",
    targetType: "User",
    targetId: user.id,
  });
  revalidatePath("/[lang]/client/dashboard", "page");
  return { ok: true };
}
