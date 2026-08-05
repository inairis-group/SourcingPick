import "server-only";
import {
  NotificationType,
  Role,
  SupportTicketStatus,
  ThreadContextType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { emitNotification } from "@/lib/notifications/emit";
import { appUrl } from "@/lib/urls";

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
    select: {
      id: true,
      status: true,
      reference: true,
      requesterUserId: true,
      requester: { select: { locale: true } },
    },
  });
  if (!ticket) return;

  const isAdmin = input.authorRole === Role.ADMIN;
  const isRequester = input.authorUserId === ticket.requesterUserId;

  /**
   * Tell the requester by email, not just in-app.
   *
   * Until now a support answer produced an in-app row and nothing else, so it
   * only reached someone who happened to log in. That's backwards for a
   * channel people reach us on precisely because they aren't in the app — most
   * of all a public chat that was escalated, where the person started on the
   * marketing site and has no reason to come back and check.
   *
   * Fire-and-forget: an SMTP failure must not roll back the message that was
   * already written, and the in-app row stays authoritative either way.
   */
  if (isAdmin && !isRequester) {
    void emitNotification({
      recipientUserId: ticket.requesterUserId,
      type: NotificationType.SUPPORT_REPLY,
      vars: { reference: ticket.reference },
      contextType: "SupportTicket",
      contextId: ticket.id,
      // Inbound email isn't wired, so the mail has to point at the one place
      // a reply can actually be written.
      ctaUrl: appUrl(`/${ticket.requester.locale}/support/${ticket.id}`),
    }).catch(() => {
      /* in-app row is authoritative */
    });
  }

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
