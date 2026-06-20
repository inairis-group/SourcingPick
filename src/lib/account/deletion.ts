import "server-only";
import { DeletionRequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * The requester's open (PENDING) deletion request, if any. Used by the
 * settings privacy section to decide whether to show the "request deletion"
 * form or the "pending review / cancel" state. Read-only — mutations live in
 * deletion-actions.ts.
 */
export async function getMyPendingDeletionRequest(userId: string) {
  return prisma.accountDeletionRequest.findFirst({
    where: { userId, status: DeletionRequestStatus.PENDING },
    select: { id: true, reason: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}
