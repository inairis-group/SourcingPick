import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions/guards";
import { fetchUserNotifications, notificationHref } from "@/lib/notifications/queries";
import { isLocale, defaultLocale } from "@/lib/i18n/config";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireAuth();
  const h = await headers();
  const fromProxy = h.get("x-locale");
  const lang = fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;

  const { items, unreadCount } = await fetchUserNotifications(user.id);

  return NextResponse.json({
    unreadCount,
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.description,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      href: notificationHref(lang, user.role, n.contextType, n.contextId),
    })),
  });
}
