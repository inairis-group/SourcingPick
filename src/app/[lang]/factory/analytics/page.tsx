import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { DashboardHeader, KpiCard } from "@/components/dashboard/primitives";
import { factoryAnalytics } from "@/lib/analytics/queries";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/factory/analytics">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.factory.analytics.title };
}

export default async function FactoryAnalyticsPage({
  params,
}: PageProps<"/[lang]/factory/analytics">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.FACTORY);
  const dict = await getDictionary(lang);
  const t = dict.factory.analytics;
  const data = await factoryAnalytics(user.organizationId);

  const trendDelta =
    data.gmvLastMonthCents === 0
      ? null
      : ((data.gmvThisMonthCents - data.gmvLastMonthCents) /
          data.gmvLastMonthCents) *
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
          label={t.kpiGmv}
          value={formatEUR(data.gmvAllTimeCents / 100, lang)}
          hint={`${formatEUR(data.gmvThisMonthCents / 100, lang)} ${t.thisMonth}`}
        />
        <KpiCard
          label={t.kpiWinRate}
          value={`${(data.quoteWinRateBps / 100).toFixed(0)}%`}
          hint={`${data.quotesAccepted} / ${data.quotesSubmitted} ${t.quotes}`}
        />
        <KpiCard
          label={t.kpiOnTime}
          value={`${(data.onTimeRateBps / 100).toFixed(0)}%`}
          hint={t.kpiOnTimeHint}
        />
        <KpiCard
          label={t.kpiTendersReceived}
          value={formatNumber(data.tendersReceived, lang)}
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
            {t.topProductsTitle}
          </h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-muted">{t.empty}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.topProducts.map((p) => (
                <li
                  key={p.productId}
                  className="flex items-center justify-between text-sm border-b border-line-subtle last:border-b-0 py-2"
                >
                  <span className="text-fg">{p.name}</span>
                  <span className="font-medium text-fg">
                    {formatNumber(p.soldUnits, lang)} {t.units}
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
              label={t.disputesReceived}
              value={formatNumber(data.disputesReceived, lang)}
            />
            <Detail
              label={t.disputesResolvedAgainst}
              value={formatNumber(data.disputesResolvedAgainst, lang)}
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
