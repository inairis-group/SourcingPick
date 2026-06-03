import { notFound } from "next/navigation";
import {
  OrderStatus,
  QuoteStatus,
  Role,
  SourcingStatus,
} from "@prisma/client";
import {
  Clock01Icon,
  PackageIcon,
  ShoppingBag01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import {
  ActivityList,
  DashboardHeader,
  DashboardSection,
  KpiCard,
} from "@/components/dashboard/primitives";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.dashboard.title };
}

const ACTIVE_REQ_STATUSES = [
  SourcingStatus.REQUEST_RECEIVED,
  SourcingStatus.ASSIGNED,
  SourcingStatus.QUOTE_SENT,
];

const SLA_HOURS = 24;

export default async function AgentDashboardPage({
  params,
}: PageProps<"/[lang]/agent/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);

  const [
    assignedRequests,
    quotesToForward,
    activeOrders,
    commissionAgg,
  ] = await Promise.all([
    prisma.sourcingRequest.findMany({
      where: {
        agentId: agent.id,
        status: { in: ACTIVE_REQ_STATUSES },
      },
      orderBy: { assignedAt: "asc" },
      select: {
        id: true,
        reference: true,
        title: true,
        status: true,
        assignedAt: true,
        category: true,
        clientOrg: { select: { displayName: true } },
        _count: { select: { tenderInvitations: true, quotes: true } },
      },
    }),
    prisma.quote.findMany({
      where: { agentId: agent.id, status: QuoteStatus.SENT_TO_AGENT },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        totalCentsClient: true,
        validUntil: true,
        factoryOrg: { select: { displayName: true } },
        request: { select: { id: true, reference: true, title: true } },
      },
    }),
    prisma.order.findMany({
      where: {
        agentId: agent.id,
        deletedAt: null,
        status: {
          in: [
            OrderStatus.PAYMENT_PENDING,
            OrderStatus.PREPARATION,
            OrderStatus.QC,
            OrderStatus.SHIPPED,
            OrderStatus.IN_TRANSIT,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        status: true,
        totalCents: true,
        estimatedEta: true,
        clientOrg: { select: { displayName: true } },
        request: { select: { title: true } },
      },
    }),
    prisma.order.aggregate({
      where: {
        agentId: agent.id,
        status: OrderStatus.COMPLETED,
        deletedAt: null,
      },
      _sum: { commissionCents: true },
      _count: true,
    }),
  ]);

  const now = Date.now();
  let overdue = 0;
  let approaching = 0;
  let onTrack = 0;
  for (const r of assignedRequests) {
    if (!r.assignedAt) continue;
    const hoursElapsed = (now - r.assignedAt.getTime()) / 1000 / 60 / 60;
    if (hoursElapsed > SLA_HOURS) overdue++;
    else if (hoursElapsed > SLA_HOURS * 0.75) approaching++;
    else onTrack++;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.agent.dashboard.eyebrow}
        title={dict.agent.dashboard.title}
        description={dict.agent.dashboard.description}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label={dict.agent.dashboard.kpiAssigned}
          value={formatNumber(assignedRequests.length, lang)}
          hint={dict.agent.dashboard.kpiAssignedHint
            .replace("{overdue}", String(overdue))
            .replace("{approaching}", String(approaching))
            .replace("{ok}", String(onTrack))}
          tone={overdue > 0 ? "danger" : approaching > 0 ? "warning" : "neutral"}
          icon={ShoppingBag01Icon}
          href={`/${lang}/agent/requests`}
        />
        <KpiCard
          label={dict.agent.dashboard.kpiQuotesToForward}
          value={formatNumber(quotesToForward.length, lang)}
          tone={quotesToForward.length > 0 ? "info" : "neutral"}
          icon={Clock01Icon}
        />
        <KpiCard
          label={dict.agent.dashboard.kpiActiveOrders}
          value={formatNumber(activeOrders.length, lang)}
          icon={PackageIcon}
        />
        <KpiCard
          label={dict.agent.dashboard.kpiCommission}
          value={formatEUR(
            (commissionAgg._sum.commissionCents ?? 0) / 100,
            lang,
          )}
          hint={dict.agent.dashboard.kpiCommissionHint.replace(
            "{n}",
            String(commissionAgg._count),
          )}
          icon={Wallet01Icon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <DashboardSection
          title={dict.agent.dashboard.queueTitle}
          description={dict.agent.dashboard.queueDesc}
          action={
            <Link
              href={`/${lang}/agent/requests`}
              variant="default"
              className="text-xs font-medium"
            >
              {dict.client.dashboard.seeAll} →
            </Link>
          }
        >
          <ActivityList
            items={assignedRequests.slice(0, 5)}
            empty={dict.agent.dashboard.queueEmpty}
            render={(r) => {
              const assignedMs = r.assignedAt?.getTime() ?? 0;
              const hoursElapsed = assignedMs
                ? (now - assignedMs) / 1000 / 60 / 60
                : 0;
              const slaState =
                hoursElapsed > SLA_HOURS
                  ? "overdue"
                  : hoursElapsed > SLA_HOURS * 0.75
                    ? "warning"
                    : "ok";
              const toneClass = {
                overdue: "text-danger",
                warning: "text-warning",
                ok: "text-muted",
              }[slaState];
              return (
                <Link
                  href={`/${lang}/agent/requests/${r.id}`}
                  variant="muted"
                  className="block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg truncate">
                        {r.title}
                      </p>
                      <p className="text-[11px] text-muted">
                        <span className="font-mono">{r.reference}</span> ·{" "}
                        {r.clientOrg.displayName}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className={`text-xs font-medium ${toneClass}`}>
                        {Math.round(hoursElapsed)} h
                      </p>
                      <p className="text-[11px] text-faint">
                        {r._count.quotes}{" "}
                        {dict.agent.dashboard.quotesSuffix}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            }}
          />
        </DashboardSection>

        <DashboardSection
          title={dict.agent.dashboard.quotesToForwardTitle}
          description={dict.agent.dashboard.quotesToForwardDesc}
        >
          <ActivityList
            items={quotesToForward}
            empty={dict.agent.dashboard.quotesToForwardEmpty}
            render={(q) => (
              <Link
                href={`/${lang}/agent/requests/${q.request.id}`}
                variant="muted"
                className="block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">
                      {q.request.title}
                    </p>
                    <p className="text-[11px] text-muted">
                      {q.factoryOrg.displayName} ·{" "}
                      <span className="font-mono">{q.request.reference}</span>
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-semibold text-headline">
                      {formatEUR(q.totalCentsClient / 100, lang)}
                    </p>
                    <p className="text-[11px] text-faint">
                      {formatDate(q.validUntil, lang, "short")}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          />
        </DashboardSection>
      </div>

      <DashboardSection title={dict.agent.dashboard.activeOrdersTitle}>
        <ActivityList
          items={activeOrders}
          empty={dict.agent.dashboard.activeOrdersEmpty}
          render={(o) => (
            <Link
              href={`/${lang}/agent/requests`}
              variant="muted"
              className="block"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg truncate">
                    {o.request.title}
                  </p>
                  <p className="text-[11px] text-muted">
                    <span className="font-mono">{o.reference}</span> ·{" "}
                    {o.clientOrg.displayName}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-xs text-fg">
                    {dict.orders.statuses[o.status]}
                  </p>
                  <p className="text-[11px] text-faint">
                    {formatEUR(o.totalCents / 100, lang)}
                  </p>
                </div>
              </div>
            </Link>
          )}
        />
      </DashboardSection>
    </div>
  );
}
