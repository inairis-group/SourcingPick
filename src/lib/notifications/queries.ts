import "server-only";
import { prisma } from "@/lib/db/client";

const PAGE_SIZE = 20;

/**
 * Best-effort deep link for a notification context. We don't know the
 * actor's role at query time, so the path uses the role layout — and we
 * keep the resolver close to the model rather than scattered across pages.
 */
export function notificationHref(
  lang: string,
  role: "CLIENT" | "FACTORY" | "AGENT" | "ADMIN",
  contextType: string | null,
  contextId: string | null,
): string | null {
  if (!contextType || !contextId) return null;
  const r = role.toLowerCase();
  switch (contextType) {
    case "SourcingRequest":
      return r === "admin"
        ? `/${lang}/admin/requests`
        : r === "agent"
          ? `/${lang}/agent/requests/${contextId}`
          : `/${lang}/client/requests/${contextId}`;
    case "Quote":
      return r === "factory"
        ? `/${lang}/factory/tenders`
        : r === "agent"
          ? `/${lang}/agent/requests`
          : `/${lang}/client/requests`;
    case "Order":
      return r === "factory"
        ? `/${lang}/factory/orders/${contextId}`
        : r === "client"
          ? `/${lang}/client/orders/${contextId}`
          : `/${lang}/agent/requests`;
    case "TenderInvitation":
      return r === "factory" ? `/${lang}/factory/tenders` : null;
    case "Organization":
      return r === "admin" ? `/${lang}/admin/kyc` : `/${lang}/factory/settings`;
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
    }),
    prisma.notification.count({
      where: { recipientUserId: userId, read: false },
    }),
  ]);
  return { items, unreadCount };
}
