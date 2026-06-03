import { notFound } from "next/navigation";
import {
  KycStatus,
  MarketplaceProductStatus,
  OrderStatus,
  PayoutStatus,
  Role,
  TenderInvitationStatus,
} from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  PackageIcon,
  Wallet01Icon,
  ShoppingBag03Icon,
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
import { computeFactoryPayout } from "@/lib/orders/pricing";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.dashboard.title };
}

const ACTIVE_ORDER_STATUSES = [
  OrderStatus.PAYMENT_PENDING,
  OrderStatus.PREPARATION,
  OrderStatus.QC,
  OrderStatus.SHIPPED,
  OrderStatus.IN_TRANSIT,
];

export default async function FactoryDashboardPage({
  params,
}: PageProps<"/[lang]/factory/dashboard">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);

  const [
    org,
    openTenders,
    activeOrdersCount,
    pendingPayoutsAgg,
    sentPayoutsAgg,
    recentInvitations,
    activeOrders,
    catalogueBreakdown,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { kycStatus: true, stripeConnectAccountId: true },
    }),
    prisma.tenderInvitation.findMany({
      where: {
        factoryOrgId: user.organizationId,
        status: {
          in: [TenderInvitationStatus.INVITED, TenderInvitationStatus.VIEWED],
        },
        expiresAt: { gt: new Date() },
      },
      orderBy: { invitedAt: "desc" },
      take: 5,
      select: {
        id: true,
        invitedAt: true,
        expiresAt: true,
        matchingScore: true,
        request: {
          select: {
            id: true,
            reference: true,
            title: true,
            quantity: true,
            category: true,
          },
        },
      },
    }),
    prisma.order.count({
      where: {
        factoryOrgId: user.organizationId,
        deletedAt: null,
        status: { in: ACTIVE_ORDER_STATUSES },
      },
    }),
    prisma.payout.aggregate({
      where: {
        factoryOrgId: user.organizationId,
        status: PayoutStatus.PENDING,
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.payout.aggregate({
      where: {
        factoryOrgId: user.organizationId,
        status: { in: [PayoutStatus.SENT, PayoutStatus.RECEIVED] },
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.tenderInvitation.count({
      where: { factoryOrgId: user.organizationId },
    }),
    prisma.order.findMany({
      where: {
        factoryOrgId: user.organizationId,
        deletedAt: null,
        status: { in: ACTIVE_ORDER_STATUSES },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        id: true,
        reference: true,
        status: true,
        estimatedEta: true,
        request: { select: { title: true } },
        quote: {
          select: { unitPriceCentsFactory: true, quantity: true },
        },
      },
    }),
    prisma.marketplaceProduct.groupBy({
      by: ["status"],
      where: { factoryOrgId: user.organizationId, deletedAt: null },
      _count: true,
    }),
  ]);

  const published =
    catalogueBreakdown.find(
      (b) => b.status === MarketplaceProductStatus.PUBLISHED,
    )?._count ?? 0;
  const pendingReview =
    catalogueBreakdown.find(
      (b) => b.status === MarketplaceProductStatus.PENDING_REVIEW,
    )?._count ?? 0;
  const draft =
    catalogueBreakdown.find(
      (b) => b.status === MarketplaceProductStatus.DRAFT,
    )?._count ?? 0;

  const kycReady = org?.kycStatus === KycStatus.VERIFIED;
  const connectReady = Boolean(org?.stripeConnectAccountId);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.factory.dashboard.eyebrow}
        title={dict.factory.dashboard.title}
        description={dict.factory.dashboard.description}
      />

      {!kycReady && (
        <div className="rounded-md border border-warning-edge bg-warning-soft/40 px-4 py-3 mb-4 text-sm text-fg">
          <p className="font-semibold text-headline">
            {dict.factory.dashboard.kycPendingTitle}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {dict.factory.dashboard.kycPendingBody}
          </p>
        </div>
      )}
      {kycReady && !connectReady && (
        <div className="rounded-md border border-info-edge bg-info-soft/40 px-4 py-3 mb-4 text-sm text-fg flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-semibold text-headline">
              {dict.factory.dashboard.connectPendingTitle}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {dict.factory.dashboard.connectPendingBody}
            </p>
          </div>
          <Link
            href={`/${lang}/factory/payouts`}
            variant="default"
            className="text-xs font-medium"
          >
            {dict.factory.payouts.startOnboardingCta} →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label={dict.factory.dashboard.kpiOpenTenders}
          value={formatNumber(openTenders.length, lang)}
          hint={dict.factory.dashboard.kpiOpenTendersHint.replace(
            "{n}",
            String(recentInvitations),
          )}
          tone={openTenders.length > 0 ? "warning" : "neutral"}
          icon={Mail01Icon}
          href={`/${lang}/factory/tenders`}
        />
        <KpiCard
          label={dict.factory.dashboard.kpiActiveOrders}
          value={formatNumber(activeOrdersCount, lang)}
          icon={PackageIcon}
          href={`/${lang}/factory/orders`}
        />
        <KpiCard
          label={dict.factory.dashboard.kpiPendingPayouts}
          value={formatEUR(
            (pendingPayoutsAgg._sum.amountCents ?? 0) / 100,
            lang,
          )}
          hint={dict.factory.dashboard.kpiPendingPayoutsHint.replace(
            "{n}",
            String(pendingPayoutsAgg._count),
          )}
          tone={pendingPayoutsAgg._count > 0 ? "warning" : "neutral"}
          icon={Wallet01Icon}
          href={`/${lang}/factory/payouts`}
        />
        <KpiCard
          label={dict.factory.dashboard.kpiTotalEarned}
          value={formatEUR((sentPayoutsAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={dict.factory.dashboard.kpiTotalEarnedHint.replace(
            "{n}",
            String(sentPayoutsAgg._count),
          )}
          icon={ShoppingBag03Icon}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashboardSection
          title={dict.factory.dashboard.openTendersTitle}
          description={dict.factory.dashboard.openTendersDesc}
          className="lg:col-span-2"
          action={
            <Link
              href={`/${lang}/factory/tenders`}
              variant="default"
              className="text-xs font-medium"
            >
              {dict.client.dashboard.seeAll} →
            </Link>
          }
        >
          <ActivityList
            items={openTenders}
            empty={dict.factory.dashboard.openTendersEmpty}
            render={(t) => (
              <Link
                href={`/${lang}/factory/tenders/${t.id}`}
                variant="muted"
                className="block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-headline truncate">
                      {t.request.title}
                    </p>
                    <p className="text-xs text-muted">
                      <span className="font-mono">{t.request.reference}</span> ·{" "}
                      {dict.categories[t.request.category]} ·{" "}
                      {formatNumber(t.request.quantity, lang)}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-xs font-medium text-info">
                      {dict.factory.tenders.matchScore} · {t.matchingScore}
                    </p>
                    <p className="text-[11px] text-faint">
                      {dict.factory.tenders.respondBy}{" "}
                      {formatDate(t.expiresAt, lang, "short")}
                    </p>
                  </div>
                </div>
              </Link>
            )}
          />
        </DashboardSection>

        <DashboardSection
          title={dict.factory.dashboard.catalogueTitle}
          action={
            <Link
              href={`/${lang}/factory/catalogue`}
              variant="default"
              className="text-xs font-medium"
            >
              {dict.client.dashboard.seeAll} →
            </Link>
          }
        >
          <div className="flex flex-col gap-3">
            <CatalogueStat
              label={dict.factory.catalogue.statuses.PUBLISHED}
              value={published}
              tone="success"
            />
            <CatalogueStat
              label={dict.factory.catalogue.statuses.PENDING_REVIEW}
              value={pendingReview}
              tone="warning"
            />
            <CatalogueStat
              label={dict.factory.catalogue.statuses.DRAFT}
              value={draft}
              tone="muted"
            />
          </div>
        </DashboardSection>
      </div>

      <DashboardSection
        title={dict.factory.dashboard.activeOrdersTitle}
        action={
          <Link
            href={`/${lang}/factory/orders`}
            variant="default"
            className="text-xs font-medium"
          >
            {dict.client.dashboard.seeAll} →
          </Link>
        }
      >
        <ActivityList
          items={activeOrders}
          empty={dict.factory.dashboard.activeOrdersEmpty}
          render={(o) => {
            const { netCents } = computeFactoryPayout(
              o.quote.unitPriceCentsFactory,
              o.quote.quantity,
            );
            return (
              <Link
                href={`/${lang}/factory/orders/${o.id}`}
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
                      {dict.orders.statuses[o.status]}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-semibold text-headline">
                      {formatEUR(netCents / 100, lang)}
                    </p>
                    {o.estimatedEta && (
                      <p className="text-[11px] text-faint">
                        {dict.client.orders.eta}{" "}
                        {formatDate(o.estimatedEta, lang, "short")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          }}
        />
      </DashboardSection>
    </div>
  );
}

function CatalogueStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "muted";
}) {
  const toneClass = {
    success: "text-success",
    warning: "text-warning",
    muted: "text-muted",
  }[tone];
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-lg font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}
