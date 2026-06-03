import "server-only";
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db/client";

const PAGE_SIZE = 20;

/**
 * Best-effort deep link for a notification. Some routes are driven by the
 * notification's semantic type (e.g. INVOICE_DUE always goes to the invoices
 * page regardless of which entity it's attached to), the rest fall back to
 * routing by contextType + contextId.
 *
 * Async because some agent-side routes need a contextId → requestId lookup
 * to land on the right page (partner item #21 — agents were getting dumped
 * on /agent/requests for any order/quote notification).
 */
export async function notificationHref(
  lang: string,
  role: "CLIENT" | "FACTORY" | "AGENT" | "ADMIN",
  type: NotificationType,
  contextType: string | null,
  contextId: string | null,
): Promise<string | null> {
  const r = role.toLowerCase();

  // Type-driven overrides: an INVOICE_DUE notification points to where the
  // user actually acts on it. For clients with an Order context that
  // means the order's payment page (Wise wire panel lives there) — going
  // to the invoices list left them clicking through to find the order
  // and was the partner's #6/#10 redirect complaint. Order context wins;
  // missing-context invoices fall back to the list.
  if (type === "INVOICE_DUE") {
    if (r === "client") {
      if (contextType === "Order" && contextId) {
        return `/${lang}/client/orders/${contextId}`;
      }
      if (contextType === "SourcingRequest" && contextId) {
        return `/${lang}/client/requests/${contextId}`;
      }
      return `/${lang}/client/invoices`;
    }
    if (r === "factory") return `/${lang}/factory/payouts`;
    if (r === "admin") return `/${lang}/admin/finance`;
    if (r === "agent" && contextType === "SourcingRequest" && contextId) {
      return `/${lang}/agent/requests/${contextId}`;
    }
    return null;
  }

  if (!contextType || !contextId) return null;
  switch (contextType) {
    case "SourcingRequest":
      return r === "admin"
        ? `/${lang}/admin/requests`
        : r === "agent"
          ? `/${lang}/agent/requests/${contextId}`
          : `/${lang}/client/requests/${contextId}`;
    case "Quote": {
      if (r === "factory") return `/${lang}/factory/tenders`;
      if (r === "agent") {
        // Resolve to the owning request — that page renders the quotes
        // panel in context (partner item #21 — agents were landing on the
        // list and having to hunt for the row).
        const quote = await prisma.quote.findUnique({
          where: { id: contextId },
          select: { requestId: true },
        });
        return quote
          ? `/${lang}/agent/requests/${quote.requestId}`
          : `/${lang}/agent/requests`;
      }
      return `/${lang}/client/requests`;
    }
    case "Order": {
      if (r === "factory") return `/${lang}/factory/orders/${contextId}`;
      if (r === "client") return `/${lang}/client/orders/${contextId}`;
      if (r === "agent") {
        // Same fix as Quote — find the request that owns this order so
        // the agent lands on the record page, not the list.
        const order = await prisma.order.findUnique({
          where: { id: contextId },
          select: { requestId: true },
        });
        return order
          ? `/${lang}/agent/requests/${order.requestId}`
          : `/${lang}/agent/requests`;
      }
      return `/${lang}/admin/requests`;
    }
    case "TenderInvitation":
      // Partner item #11: route directly to the specific tender so the
      // factory lands inside the record. Used to drop them on the list,
      // which felt like a missed click.
      return r === "factory"
        ? `/${lang}/factory/tenders/${contextId}`
        : null;
    case "Auction":
      // Outbid notifications go to the buyer's auction detail so they can
      // re-bid. Factory-side auction-sold notifications use Order context
      // instead, so we only need the client/agent/admin views here.
      return r === "client"
        ? `/${lang}/client/auctions/${contextId}`
        : r === "factory"
          ? `/${lang}/factory/auctions/${contextId}`
          : r === "admin"
            ? `/${lang}/admin/auctions/${contextId}`
            : null;
    case "Organization":
      return r === "admin" ? `/${lang}/admin/kyc` : `/${lang}/factory/settings`;
    case "SupportTicket":
    case "SUPPORT":
      // Both forms point at the same place — the support ticket detail.
      // The two strings exist because `createSupportTicketAction` emits
      // the model name "SupportTicket" while `emitNotificationToMany`
      // inside `messaging/actions` reuses the ThreadContextType value
      // "SUPPORT" verbatim.
      return contextId ? `/${lang}/support/${contextId}` : null;
    default:
      return null;
  }
}

export async function fetchUserNotifications(userId: string) {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientUserId: userId },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        contextType: true,
        contextId: true,
        read: true,
        createdAt: true,
      },
      // `type` is selected above so callers can pass it to `notificationHref`
      // for type-driven routing (e.g. INVOICE_DUE → invoices page).
    }),
    prisma.notification.count({
      where: { recipientUserId: userId, read: false },
    }),
  ]);
  return { items, unreadCount };
}
