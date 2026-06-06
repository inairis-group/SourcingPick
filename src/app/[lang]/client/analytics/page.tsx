import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { DashboardHeader, KpiCard } from "@/components/dashboard/primitives";
import { clientAnalytics } from "@/lib/analytics/queries";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/analytics">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.analytics.title };
}

export default async function ClientAnalyticsPage({
  params,
}: PageProps<"/[lang]/client/analytics">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);
  const t = dict.client.analytics;
  const data = await clientAnalytics(user.organizationId);

  const trendDelta =
    data.ordersLastMonth === 0
      ? null
      : ((data.ordersThisMonth - data.ordersLastMonth) / data.ordersLastMonth) *
        100;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard
          label={t.kpiTotalSpend}
          value={formatEUR(data.totalSpendCents / 100, lang)}
          hint={t.kpiTotalSpendHint}
        />
        <KpiCard
          label={t.kpiOrders}
          value={formatNumber(data.ordersAllTime, lang)}
          hint={`${data.ordersThisMonth} ${t.kpiOrdersThisMonth}`}
        />
        <KpiCard
          label={t.kpiAvgOrder}
          value={formatEUR(data.avgOrderCents / 100, lang)}
        />
        <KpiCard
          label={t.kpiAvgLeadTime}
          value={
            data.avgActualLeadTimeDays !== null
              ? `${data.avgActualLeadTimeDays} ${t.days}`
              : "—"
          }
        />
      </div>

      {trendDelta !== null && (
        <p className="text-xs text-muted mb-6">
          <span
            className={cn(
              "font-medium",
              trendDelta > 0
                ? "text-success"
                : trendDelta < 0
                  ? "text-danger"
                  : "text-fg",
            )}
          >
            {trendDelta > 0 ? "+" : ""}
            {Math.round(trendDelta)}%
          </span>{" "}
          {t.trendLabel}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-headline mb-3">
            {t.topFactoriesTitle}
          </h2>
          {data.topFactories.length === 0 ? (
            <p className="text-sm text-muted">{t.empty}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.topFactories.map((f) => (
                <li
                  key={f.factoryOrgId}
                  className="flex items-center justify-between text-sm border-b border-line-subtle last:border-b-0 py-2"
                >
                  <span className="text-fg">{f.name}</span>
                  <span className="text-right">
                    <span className="font-medium text-fg">
                      {formatEUR(f.spentCents / 100, lang)}
                    </span>
                    <span className="text-faint text-xs ms-2">
                      {f.orders}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-headline mb-3">
            {t.disputesTitle}
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail
              label={t.disputesOpened}
              value={formatNumber(data.disputesOpened, lang)}
            />
            <Detail
              label={t.disputesResolvedInFavor}
              value={formatNumber(data.disputesResolvedInFavor, lang)}
            />
          </dl>
        </section>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-faint">{label}</dt>
      <dd className="text-lg font-semibold text-headline">{value}</dd>
    </div>
  );
}
