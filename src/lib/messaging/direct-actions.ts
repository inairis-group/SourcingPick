"use server";

import { revalidatePath } from "next/cache";
import { ThreadContextType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Open (or lazy-create) a 1:1 DIRECT thread between the caller and
 * another user. Partner #30 — messaging shouldn't be locked to a
 * specific request; users should be able to start a general
 * conversation with a counterpart.
 *
 * Convention for DIRECT threads:
 *   - `Thread.contextType = DIRECT`
 *   - `Thread.contextId   = Thread.id` (self-reference, written
 *     immediately after the row is created so the polymorphic
 *     `(contextType, contextId)` lookup still works).
 *   - Exactly two ThreadParticipant rows.
 *
 * Self-talk and talking to a deleted user are both rejected.
 */

export type OpenDirectThreadResult =
  | { ok: true; threadId: string }
  | { ok: false; error: string };

export async function openOrCreateDirectThreadAction(
  otherUserId: string,
): Promise<OpenDirectThreadResult> {
  const user = await requireAuth();
  if (otherUserId === user.id) {
    return { ok: false, error: "You can't start a thread with yourself." };
  }

  const other = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, deletedAt: true, firstName: true, lastName: true },
  });
  if (!other || other.deletedAt) {
    return { ok: false, error: "User not found." };
  }

  // Look up an existing DIRECT thread where BOTH users are
  // participants. Cheap groupBy over the participant table.
  const candidates = await prisma.threadParticipant.findMany({
    where: { userId: user.id, thread: { contextType: ThreadContextType.DIRECT } },
    select: { threadId: true },
  });
  if (candidates.length > 0) {
    const match = await prisma.threadParticipant.findFirst({
      where: {
        userId: other.id,
        threadId: { in: candidates.map((c) => c.threadId) },
      },
      select: { threadId: true },
    });
    if (match) {
      return { ok: true, threadId: match.threadId };
    }
  }

  // Create a new DIRECT thread. We write `contextId` in a second
  // update after we know the row id so the convention holds.
  const created = await prisma.thread.create({
    data: {
      contextType: ThreadContextType.DIRECT,
      // Placeholder — overwritten immediately below.
      contextId: "pending",
      participants: {
        createMany: {
          data: [{ userId: user.id }, { userId: other.id }],
          skipDuplicates: true,
        },
      },
    },
    select: { id: true },
  });
  await prisma.thread.update({
    where: { id: created.id },
    data: { contextId: created.id },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: "thread.direct_opened",
    targetType: "User",
    targetId: other.id,
    payload: { threadId: created.id },
  });

  revalidatePath("/[lang]/messages", "page");
  return { ok: true, threadId: created.id };
}
