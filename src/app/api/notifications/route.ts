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

  // notificationHref is async so we can resolve a few contextType
  // shortcuts (Order/Quote for agents → owning request). Resolve them
  // all in parallel — usually 20 rows, single indexed lookup each.
  const hrefs = await Promise.all(
    items.map((n) =>
      notificationHref(lang, user.role, n.type, n.contextType, n.contextId),
    ),
  );

  return NextResponse.json({
    unreadCount,
    items: items.map((n, i) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      description: n.description,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      href: hrefs[i],
    })),
  });
}
