import { notFound } from "next/navigation";
import {AdminScope, SupportTicketStatus,
  ThreadContextType,} from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  TimeQuarterPassIcon,
  CustomerService01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { FilterTab } from "@/components/ui/filter-tab";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  DashboardSection,
  KpiCard,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/support">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.support.title };
}

const STATUS_TONE: Record<SupportTicketStatus, string> = {
  PENDING: "bg-warning-soft text-warning border-warning-edge",
  OPEN: "bg-info-soft text-info border-info-edge",
  RESOLVED: "bg-success-soft text-success border-success-edge",
};

export default async function AdminSupportPage({
  params,
  searchParams,
}: PageProps<"/[lang]/admin/support">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.SUPPORT);
  const dict = await getDictionary(lang);
  const t = dict.admin.support;

  const statusFilter =
    typeof search?.status === "string" &&
    (Object.values(SupportTicketStatus) as string[]).includes(search.status)
      ? (search.status as SupportTicketStatus)
      : undefined;

  const [counts, tickets, latestMessages] = await Promise.all([
    prisma.supportTicket.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: true,
    }),
    prisma.supportTicket.findMany({
      where: {
        deletedAt: null,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: [
        { status: "asc" }, // PENDING (alphabetical) → OPEN → RESOLVED
        { updatedAt: "desc" },
      ],
      take: 100,
      select: {
        id: true,
        reference: true,
        subject: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        topicKind: true,
        requester: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
            email: true,
          },
        },
        requesterOrg: { select: { displayName: true, type: true } },
      },
    }),
    // Pull the last message timestamp per ticket via the thread so we can
    // sort by "most-recent activity". One groupBy is cheaper than per-row.
    prisma.thread.findMany({
      where: { contextType: ThreadContextType.SUPPORT },
      select: {
        contextId: true,
        lastMessageAt: true,
        _count: { select: { messages: true } },
      },
    }),
  ]);

  const lastByTicket = new Map(
    latestMessages.map((m) => [
      m.contextId,
      { lastMessageAt: m.lastMessageAt, messageCount: m._count.messages },
    ]),
  );

  const total = counts.reduce((sum, c) => sum + c._count, 0);
  const pending =
    counts.find((c) => c.status === SupportTicketStatus.PENDING)?._count ?? 0;
  const open =
    counts.find((c) => c.status === SupportTicketStatus.OPEN)?._count ?? 0;
  const resolved =
    counts.find((c) => c.status === SupportTicketStatus.RESOLVED)?._count ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label={t.kpiTotal} value={String(total)} />
        <KpiCard
          label={t.kpiPending}
          value={String(pending)}
          tone={pending > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          label={t.kpiOpen}
          value={String(open)}
          tone={open > 0 ? "info" : "neutral"}
        />
        <KpiCard label={t.kpiResolved} value={String(resolved)} tone="success" />
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto -mx-1 px-1">
        <FilterTab
          href={`/${lang}/admin/support`}
          active={!statusFilter}
          label={t.filterAll}
          count={total}
        />
        {(Object.values(SupportTicketStatus) as SupportTicketStatus[]).map((s) => (
          <FilterTab
            key={s}
            href={`/${lang}/admin/support?status=${s}`}
            active={statusFilter === s}
            label={t[`status${s[0]}${s.slice(1).toLowerCase()}` as never]}
            count={
              s === SupportTicketStatus.PENDING
                ? pending
                : s === SupportTicketStatus.OPEN
                  ? open
                  : resolved
            }
          />
        ))}
      </div>

      <DashboardSection title={t.tableTitle}>
        {tickets.length === 0 ? (
          <p className="text-sm text-faint text-center py-12">
            {t.empty}
          </p>
        ) : (
          <ul className="divide-y divide-line-subtle -my-2.5">
            {tickets.map((tk) => {
              const last = lastByTicket.get(tk.id);
              return (
                <li key={tk.id} className="py-2.5">
                  <Link
                    href={`/${lang}/support/${tk.id}`}
                    variant="muted"
                    className="block hover:bg-subtle/40 -mx-3 px-3 py-1 rounded-md transition-colors duration-fast"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                        <HugeiconsIcon
                          icon={CustomerService01Icon}
                          size={16}
                          strokeWidth={1.5}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <p className="text-[11px] font-mono uppercase tracking-wide text-faint">
                              {tk.reference}
                            </p>
                            <p className="text-sm font-semibold text-headline truncate">
                              {tk.subject}
                            </p>
                            <p className="text-[11px] text-muted mt-0.5">
                              {tk.requester.firstName}{" "}
                              {tk.requester.lastName}
                              <span className="text-faint">
                                {" · "}
                                {dict.common.roles[
                                  tk.requester.role.toLowerCase() as
                                    | "client"
                                    | "factory"
                                    | "agent"
                                    | "admin"
                                ]}
                              </span>
                              {tk.requesterOrg && (
                                <>
                                  {" · "}
                                  {tk.requesterOrg.displayName}
                                </>
                              )}
                            </p>
                          </div>
                          <StatusPill status={tk.status} dict={dict} />
                        </div>
                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-faint">
                          {tk.topicKind && (
                            <span className="inline-flex items-center gap-1 text-muted">
                              <span className="font-medium">
                                {dict.support.topicKinds[tk.topicKind]}
                              </span>
                            </span>
                          )}
                          {last && (
                            <span>
                              {last.messageCount}{" "}
                              {t.messagesSuffix}
                              {" · "}
                              {formatDate(last.lastMessageAt, lang, "short")}
                            </span>
                          )}
                          {!last && (
                            <span>
                              {formatDate(tk.createdAt, lang, "short")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}

function StatusPill({
  status,
  dict,
}: {
  status: SupportTicketStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const labels: Record<SupportTicketStatus, string> = {
    PENDING: dict.support.statusPending,
    OPEN: dict.support.statusOpen,
    RESOLVED: dict.support.statusResolved,
  };
  const icon =
    status === SupportTicketStatus.RESOLVED
      ? CheckmarkCircle02Icon
      : TimeQuarterPassIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-6 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap shrink-0",
        STATUS_TONE[status],
      )}
    >
      <HugeiconsIcon icon={icon} size={11} strokeWidth={2} />
      {labels[status]}
    </span>
  );
}
