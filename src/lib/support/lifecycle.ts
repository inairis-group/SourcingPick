import "server-only";
import {
  Role,
  SupportTicketStatus,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * Post-message hook for support threads. Called from both message-send
 * actions after the message commits. Handles the auto-transitions that
 * keep the ticket status in sync with conversation activity:
 *
 *   - Admin posts in a PENDING ticket → flip to OPEN.
 *   - Requester posts in a RESOLVED ticket → reopen (back to OPEN), so
 *     a follow-up doesn't sit unread on a closed badge.
 *
 * No-op for any other contextType — cheap one extra findUnique on the
 * thread, no DB writes when nothing matches.
 */
export async function onSupportMessageSent(input: {
  threadId: string;
  authorUserId: string;
  authorRole: Role;
}): Promise<void> {
  const thread = await prisma.thread.findUnique({
    where: { id: input.threadId },
    select: { contextType: true, contextId: true },
  });
  if (!thread || thread.contextType !== ThreadContextType.SUPPORT) return;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: thread.contextId },
    select: { id: true, status: true, requesterUserId: true },
  });
  if (!ticket) return;

  const isAdmin = input.authorRole === Role.ADMIN;
  const isRequester = input.authorUserId === ticket.requesterUserId;

  if (isAdmin && ticket.status === SupportTicketStatus.PENDING) {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: SupportTicketStatus.OPEN,
        openedAt: new Date(),
      },
    });
    return;
  }

  if (isRequester && ticket.status === SupportTicketStatus.RESOLVED) {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: SupportTicketStatus.OPEN,
        resolvedAt: null,
        resolvedById: null,
      },
    });
    return;
  }
}
