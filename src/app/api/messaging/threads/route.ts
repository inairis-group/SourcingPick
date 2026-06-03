import { NextResponse } from "next/server";
import { ThreadContextType } from "@prisma/client";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

/**
 * Recent threads for the authenticated user — used by the MessagesBell.
 *
 * Returns the 20 most recent threads the user is part of, plus a total
 * unread count across all threads. Each thread is enriched with a one-line
 * subject + a deep-link `href` derived from its context.
 */
export async function GET() {
  const user = await requireAuth();
  const h = await headers();
  const fromProxy = h.get("x-locale");
  const lang = fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;

  const [participants, unreadAgg] = await Promise.all([
    prisma.threadParticipant.findMany({
      where: { userId: user.id },
      orderBy: { thread: { lastMessageAt: "desc" } },
      take: 20,
      select: {
        unreadCount: true,
        thread: {
          select: {
            id: true,
            contextType: true,
            contextId: true,
            lastMessageAt: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                body: true,
                authorUserId: true,
                author: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    }),
    prisma.threadParticipant.aggregate({
      where: { userId: user.id, unreadCount: { gt: 0 } },
      _sum: { unreadCount: true },
      _count: true,
    }),
  ]);

  // Resolve titles + hrefs per context. Batched lookups by type so we don't
  // do N+1 queries when several threads share a context family.
  const requestIds = participants
    .filter((p) => p.thread.contextType === ThreadContextType.REQUEST)
    .map((p) => p.thread.contextId);
  const orderIds = participants
    .filter((p) => p.thread.contextType === ThreadContextType.ORDER)
    .map((p) => p.thread.contextId);
  const quoteIds = participants
    .filter((p) => p.thread.contextType === ThreadContextType.QUOTE)
    .map((p) => p.thread.contextId);
  const tenderIds = participants
    .filter((p) => p.thread.contextType === ThreadContextType.TENDER)
    .map((p) => p.thread.contextId);
  const supportIds = participants
    .filter((p) => p.thread.contextType === ThreadContextType.SUPPORT)
    .map((p) => p.thread.contextId);

  const [requests, orders, quotes, tenders, supports] = await Promise.all([
    requestIds.length > 0
      ? prisma.sourcingRequest.findMany({
          where: { id: { in: requestIds } },
          select: { id: true, reference: true, title: true },
        })
      : Promise.resolve([]),
    orderIds.length > 0
      ? prisma.order.findMany({
          where: { id: { in: orderIds } },
          select: {
            id: true,
            reference: true,
            request: { select: { title: true } },
          },
        })
      : Promise.resolve([]),
    quoteIds.length > 0
      ? prisma.quote.findMany({
          where: { id: { in: quoteIds } },
          select: {
            id: true,
            request: { select: { reference: true, title: true } },
            factoryOrg: { select: { displayName: true } },
          },
        })
      : Promise.resolve([]),
    tenderIds.length > 0
      ? prisma.tenderInvitation.findMany({
          where: { id: { in: tenderIds } },
          select: {
            id: true,
            request: { select: { reference: true, title: true } },
            factoryOrg: { select: { displayName: true } },
          },
        })
      : Promise.resolve([]),
    supportIds.length > 0
      ? prisma.supportTicket.findMany({
          where: { id: { in: supportIds }, deletedAt: null },
          select: { id: true, reference: true, subject: true },
        })
      : Promise.resolve([]),
  ]);

  const requestMap = new Map(requests.map((r) => [r.id, r]));
  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const quoteMap = new Map(quotes.map((q) => [q.id, q]));
  const tenderMap = new Map(tenders.map((t) => [t.id, t]));
  const supportMap = new Map(supports.map((s) => [s.id, s]));

  const rolePrefix = user.role.toLowerCase();

  const items = participants
    .map((p) => {
      const t = p.thread;
      let title = "";
      let href: string | null = null;

      switch (t.contextType) {
        case ThreadContextType.REQUEST: {
          const r = requestMap.get(t.contextId);
          if (!r) return null;
          title = r.title;
          href =
            rolePrefix === "client"
              ? `/${lang}/client/requests/${r.id}`
              : rolePrefix === "agent"
                ? `/${lang}/agent/requests/${r.id}`
                : `/${lang}/admin/requests`;
          break;
        }
        case ThreadContextType.ORDER: {
          const o = orderMap.get(t.contextId);
          if (!o) return null;
          title = o.request.title;
          href =
            rolePrefix === "client"
              ? `/${lang}/client/orders/${o.id}`
              : rolePrefix === "factory"
                ? `/${lang}/factory/orders/${o.id}`
                : `/${lang}/agent/requests`;
          break;
        }
        case ThreadContextType.QUOTE: {
          const q = quoteMap.get(t.contextId);
          if (!q) return null;
          title = q.request.title;
          href =
            rolePrefix === "client"
              ? `/${lang}/client/requests`
              : rolePrefix === "factory"
                ? `/${lang}/factory/tenders`
                : `/${lang}/agent/requests`;
          break;
        }
        case ThreadContextType.TENDER: {
          const inv = tenderMap.get(t.contextId);
          if (!inv) return null;
          title = inv.request.title;
          href =
            rolePrefix === "factory"
              ? `/${lang}/factory/tenders/${inv.id}`
              : `/${lang}/agent/requests`;
          break;
        }
        case ThreadContextType.SUPPORT: {
          const s = supportMap.get(t.contextId);
          if (!s) return null;
          title = s.subject;
          href = `/${lang}/support/${s.id}`;
          break;
        }
        default:
          return null;
      }

      const last = t.messages[0];
      return {
        threadId: t.id,
        title,
        href,
        unreadCount: p.unreadCount,
        lastMessageAt: t.lastMessageAt.toISOString(),
        preview: last ? last.body.slice(0, 140) : null,
        previewAuthor: last?.author
          ? `${last.author.firstName} ${last.author.lastName}`
          : null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return NextResponse.json({
    unreadCount: unreadAgg._sum.unreadCount ?? 0,
    unreadThreads: unreadAgg._count,
    items,
  });
}
