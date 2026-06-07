import { notFound } from "next/navigation";
import {
  OrderStatus,
  QuoteStatus,
  Role,
  SourcingRequestOrigin,
  SourcingStatus,
} from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  PackageIcon,
  ShoppingBag01Icon,
  Wallet01Icon,
  InvoiceIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { FirstOrderTutorial } from "@/components/client/first-order-tutorial";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { getOrgCreditBalanceCents } from "@/lib/credit/balance";
import {
  ActivityList,
  DashboardHeader,
  DashboardSection,
  KpiCard,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.dashboard.title };
}

const OPEN_REQ_STATUSES = [
  SourcingStatus.DRAFT,
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

export default async function ClientDashboardPage({
  params,
}: PageProps<"/[lang]/client/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);

  const [
    openRequestsCount,
    activeOrdersCount,
    pendingQuotes,
    awaitingPaymentOrders,
    recentOrders,
    recentRequests,
    completedOrdersAgg,
    creditBalanceCents,
  ] = await Promise.all([
    prisma.sourcingRequest.count({
      where: {
        clientOrgId: user.organizationId,
        origin: SourcingRequestOrigin.SOURCING_FLOW,
        status: { in: OPEN_REQ_STATUSES },
      },
    }),
    prisma.order.count({
      where: {
        clientOrgId: user.organizationId,
        deletedAt: null,
        status: { in: ACTIVE_ORDER_STATUSES },
      },
    }),
    prisma.quote.findMany({
      where: {
        status: QuoteStatus.SENT_TO_CLIENT,
        request: { clientOrgId: user.organizationId },
      },
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
        clientOrgId: user.organizationId,
        status: OrderStatus.PAYMENT_PENDING,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        depositCents: true,
        request: { select: { title: true } },
      },
    }),
    prisma.order.findMany({
      where: { clientOrgId: user.organizationId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        status: true,
        totalCents: true,
        estimatedEta: true,
        request: { select: { title: true } },
        factoryOrg: { select: { displayName: true } },
      },
    }),
    prisma.sourcingRequest.findMany({
      // Same filter as /client/requests — only real agent-led requests
      // surface here. Marketplace synthetic requests show in /orders.
      where: {
        clientOrgId: user.organizationId,
        origin: SourcingRequestOrigin.SOURCING_FLOW,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        clientOrgId: user.organizationId,
        status: OrderStatus.COMPLETED,
        deletedAt: null,
      },
      _sum: { totalCents: true },
      _count: true,
    }),
    getOrgCreditBalanceCents(user.organizationId),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Partner #16: first-order tutorial — dismissible coachmark
          series. Renders only until the user clicks dismiss. */}
      {!user.clientTutorialDismissedAt && <FirstOrderTutorial />}
      <DashboardHeader
        eyebrow={dict.client.dashboard.eyebrow}
        title={dict.client.dashboard.title}
        description={dict.client.dashboard.description}
        actions={
          <Link
            href={`/${lang}/client/requests/new`}
            className={`w-full md:w-auto ${cn(buttonClass({ variant: "primary", size: "sm" }))}`}
          >
            <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={1.5} />
            <span className="ms-1.5">{dict.client.requests.newRequest}</span>
          </Link>
        }
      />

      {creditBalanceCents > 0 && (
        <div className="mb-6 rounded-lg border border-success-edge bg-success-soft/40 px-4 py-3 flex items-center gap-3">
          <HugeiconsIcon
            icon={Wallet01Icon}
            size={18}
            strokeWidth={1.5}
            className="text-success shrink-0"
          />
          <p className="text-sm text-success">
            {dict.client.dashboard.creditAvailable.replace(
              "{amount}",
              formatEUR(creditBalanceCents / 100, lang),
            )}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label={dict.client.dashboard.kpiOpenRequests}
          value={formatNumber(openRequestsCount, lang)}
          icon={ShoppingBag01Icon}
          href={`/${lang}/client/requests`}
        />
        <KpiCard
          label={dict.client.dashboard.kpiActiveOrders}
          value={formatNumber(activeOrdersCount, lang)}
          icon={PackageIcon}
          href={`/${lang}/client/orders`}
        />
        <KpiCard
          label={dict.client.dashboard.kpiAwaitingPayment}
          value={formatNumber(awaitingPaymentOrders.length, lang)}
          tone={awaitingPaymentOrders.length > 0 ? "warning" : "neutral"}
          icon={Wallet01Icon}
        />
        <KpiCard
          label={dict.client.dashboard.kpiTotalSpent}
          value={formatEUR(
            (completedOrdersAgg._sum.totalCents ?? 0) / 100,
            lang,
          )}
          hint={dict.client.dashboard.kpiTotalSpentHint.replace(
            "{n}",
            String(completedOrdersAgg._count),
          )}
          icon={InvoiceIcon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashboardSection
          title={dict.client.dashboard.quotesAwaitingTitle}
          description={dict.client.dashboard.quotesAwaitingDesc}
          className="lg:col-span-2"
        >
          <ActivityList
            items={pendingQuotes}
            empty={dict.client.dashboard.quotesEmpty}
            render={(q) => (
              <Link
                href={`/${lang}/client/requests/${q.request.id}`}
                variant="muted"
                className="block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-headline truncate">
                      {q.request.title}
                    </p>
                    <p className="text-xs text-muted">
                      {q.factoryOrg.displayName} ·{" "}
                      <span className="font-mono">{q.request.reference}</span>
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-semibold text-headline">
                      {formatEUR(q.totalCentsClient / 100, lang)}
                    </p>
                    <p className="text-[11px] text-faint">
                      {dict.client.dashboard.quoteValidUntil}{" "}
                      {formatDate(q.validUntil, lang, "short")}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          />
        </DashboardSection>

        <DashboardSection
          title={dict.client.dashboard.awaitingPaymentTitle}
          description={dict.client.dashboard.awaitingPaymentDesc}
        >
          <ActivityList
            items={awaitingPaymentOrders}
            empty={dict.client.dashboard.awaitingPaymentEmpty}
            render={(o) => (
              <Link
                href={`/${lang}/client/orders/${o.id}`}
                variant="muted"
                className="block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">
                      {o.request.title}
                    </p>
                    <p className="text-xs font-mono text-faint">{o.reference}</p>
                  </div>
                  <p className="text-sm font-semibold text-warning whitespace-nowrap">
                    {formatEUR(o.depositCents / 100, lang)}
                  </p>
                </div>
              </Link>
            )}
          />
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardSection
          title={dict.client.dashboard.recentOrdersTitle}
          action={
            <Link
              href={`/${lang}/client/orders`}
              variant="default"
              className="text-xs font-medium"
            >
              {dict.client.dashboard.seeAll} →
            </Link>
          }
        >
          <ActivityList
            items={recentOrders}
            empty={dict.client.dashboard.recentOrdersEmpty}
            render={(o) => (
              <Link
                href={`/${lang}/client/orders/${o.id}`}
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
                      {o.factoryOrg.displayName}
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

        <DashboardSection
          title={dict.client.dashboard.recentRequestsTitle}
          action={
            <Link
              href={`/${lang}/client/requests`}
              variant="default"
              className="text-xs font-medium"
            >
              {dict.client.dashboard.seeAll} →
            </Link>
          }
        >
          <ActivityList
            items={recentRequests}
            empty={dict.client.dashboard.recentRequestsEmpty}
            render={(r) => (
              <Link
                href={`/${lang}/client/requests/${r.id}`}
                variant="muted"
                className="block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">
                      {r.title}
                    </p>
                    <p className="text-[11px] font-mono text-faint">
                      {r.reference}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-xs text-fg">
                      {dict.client.requests.statuses[r.status]}
                    </p>
                    <p className="text-[11px] text-faint">
                      {formatDate(r.createdAt, lang, "short")}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          />
        </DashboardSection>
      </div>
    </div >
  );
}
