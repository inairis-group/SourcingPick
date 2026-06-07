import { notFound } from "next/navigation";
import { Role, ThreadContextType } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBag01Icon,
  PackageIcon,
  Mail01Icon,
  InvoiceIcon,
  Message01Icon,
  CustomerService01Icon,
  ScrollIcon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { buttonClass } from "@/components/ui/button";
import { ContextThread } from "@/components/messaging/context-thread";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireAuth } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/messages">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.messaging.globalTitle };
}

const CTX_ICONS: Partial<Record<ThreadContextType, typeof Message01Icon>> = {
  REQUEST: ShoppingBag01Icon,
  ORDER: PackageIcon,
  QUOTE: InvoiceIcon,
  TENDER: Mail01Icon,
  SUPPORT: CustomerService01Icon,
  DISPUTE: ScrollIcon,
  DIRECT: Message01Icon,
};

export default async function GlobalMessagesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/messages">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  const user = await requireAuth();
  const dict = await getDictionary(lang);

  const filter =
    typeof search?.filter === "string" && search.filter === "unread"
      ? "unread"
      : "all";
  // Partner #30: ?dm=<threadId> opens a DIRECT thread inline at the
  // top of the page. The participant guard catches mismatches — only
  // the two members can read it.
  const dmThreadId =
    typeof search?.dm === "string" ? search.dm : null;

  const participants = await prisma.threadParticipant.findMany({
    where: {
      userId: user.id,
      ...(filter === "unread" ? { unreadCount: { gt: 0 } } : {}),
    },
    orderBy: { thread: { lastMessageAt: "desc" } },
    take: 100,
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
              author: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });

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
  const disputeIds = participants
    .filter((p) => p.thread.contextType === ThreadContextType.DISPUTE)
    .map((p) => p.thread.contextId);
  // Partner #30: DIRECT threads. The contextId IS the thread id, so
  // we resolve the OTHER participant per thread to render a real name.
  const directThreadIds = participants
    .filter((p) => p.thread.contextType === ThreadContextType.DIRECT)
    .map((p) => p.thread.id);
  const directOthers =
    directThreadIds.length > 0
      ? await prisma.threadParticipant.findMany({
          where: {
            threadId: { in: directThreadIds },
            userId: { not: user.id },
          },
          select: {
            threadId: true,
            user: { select: { id: true, firstName: true, lastName: true, role: true } },
          },
        })
      : [];
  const directOtherByThread = new Map(
    directOthers.map((d) => [d.threadId, d.user]),
  );

  const [requests, orders, quotes, tenders, supports, disputes] = await Promise.all([
    requestIds.length > 0
      ? prisma.sourcingRequest.findMany({
          where: { id: { in: requestIds } },
          select: {
            id: true,
            reference: true,
            title: true,
            clientOrg: { select: { displayName: true } },
          },
        })
      : Promise.resolve([]),
    orderIds.length > 0
      ? prisma.order.findMany({
          where: { id: { in: orderIds } },
          select: {
            id: true,
            reference: true,
            request: { select: { title: true } },
            factoryOrg: { select: { displayName: true } },
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
          select: {
            id: true,
            reference: true,
            subject: true,
            status: true,
            requester: { select: { firstName: true, lastName: true } },
          },
        })
      : Promise.resolve([]),
    disputeIds.length > 0
      ? prisma.dispute.findMany({
          where: { id: { in: disputeIds } },
          select: {
            id: true,
            reference: true,
            status: true,
            order: {
              select: {
                id: true,
                reference: true,
                request: { select: { title: true } },
                clientOrg: { select: { displayName: true } },
                factoryOrg: { select: { displayName: true } },
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const requestMap = new Map(requests.map((r) => [r.id, r]));
  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const quoteMap = new Map(quotes.map((q) => [q.id, q]));
  const tenderMap = new Map(tenders.map((t) => [t.id, t]));
  const supportMap = new Map(supports.map((s) => [s.id, s]));
  const disputeMap = new Map(disputes.map((d) => [d.id, d]));

  const role = user.role.toLowerCase();

  const rows = participants
    .map((p) => {
      const t = p.thread;
      let title = "";
      let reference: string | null = null;
      let subtitle: string | null = null;
      let href: string | null = null;

      switch (t.contextType) {
        case ThreadContextType.REQUEST: {
          const r = requestMap.get(t.contextId);
          if (!r) return null;
          title = r.title;
          reference = r.reference;
          subtitle = r.clientOrg?.displayName ?? null;
          href =
            role === "client"
              ? `/${lang}/client/requests/${r.id}`
              : role === "agent"
                ? `/${lang}/agent/requests/${r.id}`
                : `/${lang}/admin/requests`;
          break;
        }
        case ThreadContextType.ORDER: {
          const o = orderMap.get(t.contextId);
          if (!o) return null;
          title = o.request.title;
          reference = o.reference;
          subtitle = o.factoryOrg?.displayName ?? null;
          href =
            role === "client"
              ? `/${lang}/client/orders/${o.id}`
              : role === "factory"
                ? `/${lang}/factory/orders/${o.id}`
                : `/${lang}/agent/requests`;
          break;
        }
        case ThreadContextType.QUOTE: {
          const q = quoteMap.get(t.contextId);
          if (!q) return null;
          title = q.request.title;
          reference = q.request.reference;
          subtitle = q.factoryOrg.displayName;
          href =
            role === "client"
              ? `/${lang}/client/requests`
              : role === "factory"
                ? `/${lang}/factory/tenders`
                : `/${lang}/agent/requests`;
          break;
        }
        case ThreadContextType.TENDER: {
          const inv = tenderMap.get(t.contextId);
          if (!inv) return null;
          title = inv.request.title;
          reference = inv.request.reference;
          subtitle = inv.factoryOrg.displayName;
          href =
            role === "factory"
              ? `/${lang}/factory/tenders/${inv.id}`
              : `/${lang}/agent/requests`;
          break;
        }
        case ThreadContextType.SUPPORT: {
          const s = supportMap.get(t.contextId);
          if (!s) return null;
          title = s.subject;
          reference = s.reference;
          subtitle =
            role === "admin"
              ? `${s.requester.firstName} ${s.requester.lastName} · ${dict.support[`status${s.status[0]}${s.status.slice(1).toLowerCase()}` as never]}`
              : dict.support[`status${s.status[0]}${s.status.slice(1).toLowerCase()}` as never];
          href = `/${lang}/support/${s.id}`;
          break;
        }
        case ThreadContextType.DISPUTE: {
          const d = disputeMap.get(t.contextId);
          if (!d) return null;
          title = d.order.request.title;
          reference = d.reference;
          subtitle =
            role === "admin"
              ? `${d.order.clientOrg.displayName} ↔ ${d.order.factoryOrg.displayName}`
              : role === "client"
                ? d.order.factoryOrg.displayName
                : d.order.clientOrg.displayName;
          href =
            role === "admin"
              ? `/${lang}/admin/disputes/${d.id}`
              : role === "client"
                ? `/${lang}/client/orders/${d.order.id}`
                : `/${lang}/factory/orders/${d.order.id}`;
          break;
        }
        case ThreadContextType.DIRECT: {
          const other = directOtherByThread.get(t.id);
          if (!other) return null;
          title = `${other.firstName} ${other.lastName}`;
          subtitle = other.role;
          href = `/${lang}/messages?dm=${t.id}`;
          break;
        }
        default:
          return null;
      }

      const last = t.messages[0];
      return {
        threadId: t.id,
        contextType: t.contextType,
        unreadCount: p.unreadCount,
        lastMessageAt: t.lastMessageAt,
        title,
        reference,
        subtitle,
        href,
        previewBody: last ? last.body.slice(0, 200) : null,
        previewAuthor: last?.author
          ? `${last.author.firstName} ${last.author.lastName}`
          : null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const totalUnread = rows.reduce((sum, r) => sum + r.unreadCount, 0);

  const t = dict.messaging;

  // Resolve the DM panel, if any.
  let openDmTitle: string | null = null;
  if (dmThreadId) {
    const allowed = await prisma.threadParticipant.findUnique({
      where: { threadId_userId: { threadId: dmThreadId, userId: user.id } },
      select: { threadId: true },
    });
    if (allowed) {
      const other = await prisma.threadParticipant.findFirst({
        where: { threadId: dmThreadId, userId: { not: user.id } },
        select: {
          user: { select: { firstName: true, lastName: true } },
        },
      });
      openDmTitle = other
        ? `${other.user.firstName} ${other.user.lastName}`
        : t.directOpenCta;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex items-end justify-between gap-3 mb-6 flex-wrap">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {t.globalEyebrow}
          </p>
          <h1 className="text-2xl font-bold text-headline tracking-tight">
            {t.globalTitle}
          </h1>
          <p className="text-sm text-muted">{t.globalDescription}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {totalUnread > 0 && (
            <span className="inline-flex items-center h-7 px-3 rounded-full bg-action text-on-action text-xs font-semibold whitespace-nowrap">
              {t.unreadCount.replace("{n}", String(totalUnread))}
            </span>
          )}
          {user.role !== Role.ADMIN && (
            <Link
              href={`/${lang}/support/new`}
              className={cn(buttonClass({ variant: "primary", size: "sm" }))}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                size={14}
                strokeWidth={1.75}
              />
              <span className="ms-1.5">{dict.support.newCta}</span>
            </Link>
          )}
        </div>
      </header>

      {dmThreadId && openDmTitle && (
        <section className="mb-6">
          <ContextThread
            contextType={ThreadContextType.DIRECT}
            contextId={dmThreadId}
            lang={lang}
            title={openDmTitle}
          />
        </section>
      )}

      <div className="flex items-center gap-1 mb-4">
        <FilterTab
          href={`/${lang}/messages`}
          active={filter === "all"}
          label={t.filterAll}
        />
        <FilterTab
          href={`/${lang}/messages?filter=unread`}
          active={filter === "unread"}
          label={t.filterUnread}
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-sm font-semibold text-headline">
            {filter === "unread" ? t.globalEmptyUnread : t.globalEmpty}
          </p>
          <p className="text-xs text-muted mt-1">
            {filter === "unread" ? t.globalEmptyUnreadHint : t.globalEmptyHint}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line-subtle rounded-lg border border-line bg-surface overflow-hidden">
          {rows.map((row) => {
            const Icon = CTX_ICONS[row.contextType] ?? Message01Icon;
            return (
              <li key={row.threadId}>
                {row.href ? (
                  <Link
                    href={row.href}
                    variant="muted"
                    className={cn(
                      "block px-4 py-3.5 hover:bg-subtle transition-colors duration-fast",
                      row.unreadCount > 0 && "bg-info-soft/30",
                    )}
                  >
                    <ThreadRow row={row} Icon={Icon} lang={lang} dict={dict} />
                  </Link>
                ) : (
                  <div className="px-4 py-3.5">
                    <ThreadRow row={row} Icon={Icon} lang={lang} dict={dict} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function contextLabel(
  ctx: ThreadContextType,
  dict: Awaited<ReturnType<typeof getDictionary>>,
): string | null {
  const labels = dict.messaging.contextLabels as Partial<
    Record<ThreadContextType, string>
  >;
  return labels[ctx] ?? null;
}

function FilterTab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      variant="muted"
      className={cn(
        "inline-flex items-center h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap",
        "transition-colors duration-fast",
        active
          ? "bg-action text-on-action"
          : "bg-subtle text-muted hover:text-fg",
      )}
    >
      {label}
    </Link>
  );
}

function ThreadRow({
  row,
  Icon,
  lang,
  dict,
}: {
  row: {
    contextType: ThreadContextType;
    title: string;
    reference: string | null;
    subtitle: string | null;
    unreadCount: number;
    lastMessageAt: Date;
    previewBody: string | null;
    previewAuthor: string | null;
  };
  Icon: typeof Message01Icon;
  lang: "fr" | "en" | "zh" | "ar";
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
          row.unreadCount > 0
            ? "bg-brand-50 text-brand-700"
            : "bg-subtle text-muted",
        )}
      >
        <HugeiconsIcon icon={Icon} size={16} strokeWidth={1.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0 flex items-baseline gap-2">
            <p
              className={cn(
                "text-sm leading-snug truncate",
                row.unreadCount > 0
                  ? "text-headline font-semibold"
                  : "text-fg font-medium",
              )}
            >
              {row.title}
            </p>
            {row.reference && (
              <span className="text-[10px] font-mono uppercase text-faint whitespace-nowrap">
                {row.reference}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {row.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-semibold bg-action text-on-action">
                {row.unreadCount}
              </span>
            )}
            <span className="text-[10px] text-faint whitespace-nowrap">
              {formatDate(row.lastMessageAt, lang, "short")}
            </span>
          </div>
        </div>
        {row.subtitle && (
          <p className="text-[11px] text-faint mt-0.5">
            {row.subtitle}
            {contextLabel(row.contextType, dict) && (
              <> · {contextLabel(row.contextType, dict)}</>
            )}
          </p>
        )}
        {row.previewBody && (
          <p className="text-xs text-muted leading-snug mt-1 line-clamp-2">
            {row.previewAuthor && (
              <span className="font-medium text-fg">
                {row.previewAuthor}:{" "}
              </span>
            )}
            {row.previewBody}
          </p>
        )}
      </div>
    </div>
  );
}
