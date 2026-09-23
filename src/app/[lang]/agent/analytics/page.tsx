import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { DashboardHeader, KpiCard } from "@/components/dashboard/primitives";
import { agentAnalytics } from "@/lib/analytics/queries";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/analytics">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.analytics.title };
}

export default async function AgentAnalyticsPage({
  params,
}: PageProps<"/[lang]/agent/analytics">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);
  const t = dict.agent.analytics;
  const data = await agentAnalytics(agent.id);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard
          label={t.kpiRequests}
          value={formatNumber(data.requestsAssigned, lang)}
          hint={`${data.requestsActive} ${t.activeNow} · ${data.requestsCompleted} ${t.completed}`}
        />
        <KpiCard
          label={t.kpiWinRate}
          value={`${(data.forwardAcceptRateBps / 100).toFixed(0)}%`}
          hint={`${data.quotesAccepted} / ${data.quotesForwarded} ${t.quotes}`}
        />
        <KpiCard
          label={t.kpiCommission}
          value={formatEUR(data.commissionEarnedCents / 100, lang)}
        />
        <KpiCard
          label={t.kpiAvgLag}
          value={
            data.avgAssignToFirstTenderHours !== null
              ? `${data.avgAssignToFirstTenderHours} h`
              : "—"
          }
          hint={t.kpiAvgLagHint}
        />
      </div>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-headline mb-3">
          {t.funnelTitle}
        </h2>
        <p className="text-xs text-muted mb-4">{t.funnelBody}</p>
        <FunnelRow
          label={t.funnelAssigned}
          value={data.requestsAssigned}
          lang={lang}
        />
        <FunnelRow
          label={t.funnelTendered}
          value={data.tendersDispatched}
          lang={lang}
        />
        <FunnelRow
          label={t.funnelForwarded}
          value={data.quotesForwarded}
          lang={lang}
        />
        <FunnelRow
          label={t.funnelAccepted}
          value={data.quotesAccepted}
          lang={lang}
          last
        />
      </section>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  lang,
  last,
}: {
  label: string;
  value: number;
  lang: Locale;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm py-3 ${last ? "" : "border-b border-line-subtle"}`}
    >
      <span className="text-fg">{label}</span>
      <span className="font-semibold text-headline">
        {formatNumber(value, lang)}
      </span>
    </div>
  );
}
