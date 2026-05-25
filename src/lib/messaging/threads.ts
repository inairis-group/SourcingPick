import "server-only";
import { ThreadContextType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { resolveParticipantsFor } from "./participants";

/**
 * Find or lazy-create a Thread for a context. Idempotent — repeated calls
 * for the same (contextType, contextId) return the same Thread, and
 * participant rows are upserted so newly-joined parties (e.g. a freshly
 * assigned agent) get pulled in on the next access.
 */
export async function getOrCreateThread(
  contextType: ThreadContextType,
  contextId: string,
  joiningUserId: string,
): Promise<{ id: string }> {
  const existing = await prisma.thread.findFirst({
    where: { contextType, contextId },
    select: { id: true },
  });

  if (existing) {
    await ensureParticipant(existing.id, joiningUserId, contextType, contextId);
    return existing;
  }

  const participants = await resolveParticipantsFor(contextType, contextId);
  // Always include the joining user so an admin who opens the thread is
  // tracked even if they aren't in the default participant set.
  const joiningInSet = participants.some((p) => p.userId === joiningUserId);

  const thread = await prisma.thread.create({
    data: {
      contextType,
      contextId,
      participants: {
        createMany: {
          data: [
            ...participants.map((p) => ({ userId: p.userId })),
            ...(joiningInSet ? [] : [{ userId: joiningUserId }]),
          ],
          skipDuplicates: true,
        },
      },
    },
    select: { id: true },
  });

  return thread;
}

/**
 * Make sure a user has a ThreadParticipant row for the thread. Used when an
 * admin opens an existing thread (admins aren't auto-added) and when new
 * parties join (e.g. an agent assigned after the thread was created).
 */
async function ensureParticipant(
  threadId: string,
  userId: string,
  contextType: ThreadContextType,
  contextId: string,
): Promise<void> {
  const existing = await prisma.threadParticipant.findUnique({
    where: { threadId_userId: { threadId, userId } },
    select: { threadId: true },
  });
  if (existing) return;

  // Refresh the resolver — if a quote moved to ORDER context, factory rows
  // may have appeared since the thread was created.
  const fresh = await resolveParticipantsFor(contextType, contextId);
  const inFreshSet = fresh.some((p) => p.userId === userId);

  await prisma.threadParticipant.createMany({
    data: [
      ...fresh.map((p) => ({ threadId, userId: p.userId })),
      ...(inFreshSet ? [] : [{ threadId, userId }]),
    ],
    skipDuplicates: true,
  });
}
