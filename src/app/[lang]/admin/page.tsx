import { notFound } from "next/navigation";
import {
  EscrowStatus,
  KycStatus,
  MarketplaceProductStatus,
  OrderStatus,
  PayoutStatus,
  Role,
  SourcingStatus,
  WebhookStatus,
} from "@prisma/client";
import {
  AlertCircleIcon,
  ChartLineData01Icon,
  ShoppingBag01Icon,
  Wallet01Icon,
  UserGroup02Icon,
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
}: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.dashboard.title };
}

const ACTIVE_REQ_STATUSES = [
  SourcingStatus.REQUEST_RECEIVED,
  SourcingStatus.ASSIGNED,
  SourcingStatus.QUOTE_SENT,
];

const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PREPARATION,
  OrderStatus.QC,
  OrderStatus.SHIPPED,
  OrderStatus.IN_TRANSIT,
];

export default async function AdminDashboardPage({
  params,
}: PageProps<"/[lang]/admin">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  const monthStart = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
  );

  const [
    activeRequests,
    activeOrders,
    pendingKyc,
    pendingListings,
    pendingPayoutsAgg,
    escrowHeldAgg,
    gmvAgg,
    unassignedRequests,
    recentAudit,
    webhookFailures,
    activeAgents,
    activeFactories,
  ] = await Promise.all([
    prisma.sourcingRequest.count({
      where: { status: { in: ACTIVE_REQ_STATUSES } },
    }),
    prisma.order.count({
      where: {
        deletedAt: null,
        status: { in: ACTIVE_ORDER_STATUSES },
      },
    }),
    prisma.organization.count({
      where: {
        kycStatus: KycStatus.PENDING,
        deletedAt: null,
      },
    }),
    prisma.marketplaceProduct.count({
      where: {
        status: MarketplaceProductStatus.PENDING_REVIEW,
        deletedAt: null,
      },
    }),
    prisma.payout.aggregate({
      where: { status: PayoutStatus.PENDING },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.escrowTransaction.aggregate({
      where: { status: EscrowStatus.HELD },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        deletedAt: null,
        createdAt: { gte: monthStart },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalCents: true, commissionCents: true },
      _count: true,
    }),
    prisma.sourcingRequest.findMany({
      where: {
        agentId: null,
        status: SourcingStatus.REQUEST_RECEIVED,
      },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        title: true,
        createdAt: true,
        clientOrg: { select: { displayName: true } },
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        level: true,
        createdAt: true,
        actor: { select: { firstName: true, lastName: true, role: true } },
      },
    }),
    prisma.webhookEvent.count({
      where: { status: WebhookStatus.FAILED },
    }),
    prisma.user.count({
      where: { role: Role.AGENT, deletedAt: null },
    }),
    prisma.organization.count({
      where: {
        kycStatus: KycStatus.VERIFIED,
        deletedAt: null,
        type: "FACTORY",
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.dashboard.eyebrow}
        title={dict.admin.dashboard.title}
        description={dict.admin.dashboard.description}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label={dict.admin.dashboard.kpiGmv}
          value={formatEUR((gmvAgg._sum.totalCents ?? 0) / 100, lang)}
          hint={dict.admin.dashboard.kpiGmvHint.replace(
            "{n}",
            String(gmvAgg._count),
          )}
          icon={ChartLineData01Icon}
          href={`/${lang}/admin/finance`}
        />
        <KpiCard
          label={dict.admin.dashboard.kpiCommission}
          value={formatEUR(
            (gmvAgg._sum.commissionCents ?? 0) / 100,
            lang,
          )}
          icon={Wallet01Icon}
        />
        <KpiCard
          label={dict.admin.dashboard.kpiActiveOrders}
          value={formatNumber(activeOrders, lang)}
          hint={dict.admin.dashboard.kpiActiveRequests.replace(
            "{n}",
            String(activeRequests),
          )}
          icon={ShoppingBag01Icon}
        />
        <KpiCard
          label={dict.admin.dashboard.kpiAgents}
          value={formatNumber(activeAgents, lang)}
          hint={dict.admin.dashboard.kpiAgentsHint.replace(
            "{n}",
            String(activeFactories),
          )}
          icon={UserGroup02Icon}
          href={`/${lang}/admin/agents`}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label={dict.admin.dashboard.kpiKycQueue}
          value={formatNumber(pendingKyc, lang)}
          tone={pendingKyc > 0 ? "warning" : "neutral"}
          icon={AlertCircleIcon}
          href={`/${lang}/admin/kyc`}
        />
        <KpiCard
          label={dict.admin.dashboard.kpiPendingListings}
          value={formatNumber(pendingListings, lang)}
          tone={pendingListings > 0 ? "warning" : "neutral"}
          href={`/${lang}/admin/marketplace`}
        />
        <KpiCard
          label={dict.admin.dashboard.kpiEscrowHeld}
          value={formatEUR((escrowHeldAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={dict.admin.dashboard.kpiEscrowHeldHint.replace(
            "{n}",
            String(escrowHeldAgg._count),
          )}
          href={`/${lang}/admin/escrow`}
        />
        <KpiCard
          label={dict.admin.dashboard.kpiWebhookFailures}
          value={formatNumber(webhookFailures, lang)}
          tone={webhookFailures > 0 ? "danger" : "neutral"}
          icon={AlertCircleIcon}
          href={`/${lang}/admin/webhooks`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <DashboardSection
          title={dict.admin.dashboard.unassignedTitle}
          description={dict.admin.dashboard.unassignedDesc}
          action={
            <Link
              href={`/${lang}/admin/requests`}
              variant="default"
              className="text-xs font-medium"
            >
              {dict.client.dashboard.seeAll} →
            </Link>
          }
        >
          <ActivityList
            items={unassignedRequests}
            empty={dict.admin.dashboard.unassignedEmpty}
            render={(r) => (
              <Link
                href={`/${lang}/admin/requests`}
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
                  <p className="text-[11px] text-faint shrink-0">
                    {formatDate(r.createdAt, lang, "short")}
                  </p>
                </div>
              </Link>
            )}
          />
        </DashboardSection>

        <DashboardSection
          title={dict.admin.dashboard.payoutsTitle}
          description={dict.admin.dashboard.payoutsDesc}
          action={
            <Link
              href={`/${lang}/admin/payouts`}
              variant="default"
              className="text-xs font-medium"
            >
              {dict.client.dashboard.seeAll} →
            </Link>
          }
        >
          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-line bg-subtle px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-muted">
                {dict.admin.dashboard.payoutsPending}
              </span>
              <span className="text-base font-semibold text-warning">
                {formatEUR(
                  (pendingPayoutsAgg._sum.amountCents ?? 0) / 100,
                  lang,
                )}
              </span>
            </div>
            <p className="text-[11px] text-faint">
              {dict.admin.dashboard.payoutsPendingHint.replace(
                "{n}",
                String(pendingPayoutsAgg._count),
              )}
            </p>
          </div>
        </DashboardSection>
      </div>

      <DashboardSection
        title={dict.admin.dashboard.auditTitle}
        action={
          <Link
            href={`/${lang}/admin/audit`}
            variant="default"
            className="text-xs font-medium"
          >
            {dict.client.dashboard.seeAll} →
          </Link>
        }
      >
        <ActivityList
          items={recentAudit}
          empty={dict.admin.dashboard.auditEmpty}
          render={(a) => {
            const toneClass =
              a.level === "ALERT"
                ? "text-danger"
                : a.level === "WARN"
                  ? "text-warning"
                  : "text-fg";
            return (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={`text-xs font-mono uppercase tracking-tight truncate ${toneClass}`}
                  >
                    {a.action}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {a.actor
                      ? `${a.actor.firstName} ${a.actor.lastName} · ${a.actor.role}`
                      : dict.admin.dashboard.systemActor}
                  </p>
                </div>
                <p className="text-[11px] text-faint shrink-0">
                  {formatDate(a.createdAt, lang, "short")}
                </p>
              </div>
            );
          }}
        />
      </DashboardSection>
    </div>
  );
}
