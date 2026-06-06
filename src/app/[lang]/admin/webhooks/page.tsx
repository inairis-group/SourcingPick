import { notFound } from "next/navigation";
import {AdminScope, WebhookSource, WebhookStatus} from "@prisma/client";
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
import { ReplayButton } from "./_components/replay-button";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/webhooks">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.webhooks.title };
}

const STATUS_TONE: Record<WebhookStatus, string> = {
  RECEIVED: "bg-subtle text-muted border-line",
  PROCESSED: "bg-success-soft text-success border-success-edge",
  FAILED: "bg-danger-soft text-danger border-danger-edge",
  RETRYING: "bg-warning-soft text-warning border-warning-edge",
};

const SOURCE_TONE: Record<WebhookSource, string> = {
  STRIPE: "bg-info-soft text-info border-info-edge",
  WISE: "bg-brand-50 text-brand-700 border-brand-200",
  CARRIER: "bg-warning-soft text-warning border-warning-edge",
  OTHER: "bg-subtle text-muted border-line",
};

export default async function AdminWebhooksPage({
  params,
  searchParams,
}: PageProps<"/[lang]/admin/webhooks">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.WEBHOOKS);
  const dict = await getDictionary(lang);

  const statusFilter =
    typeof search?.status === "string" &&
    (Object.values(WebhookStatus) as string[]).includes(search.status)
      ? (search.status as WebhookStatus)
      : undefined;

  const [counts, recent, wiseFailedCount] = await Promise.all([
    prisma.webhookEvent.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.webhookEvent.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { receivedAt: "desc" },
      take: 100,
      select: {
        id: true,
        source: true,
        eventType: true,
        status: true,
        attempts: true,
        lastError: true,
        receivedAt: true,
        processedAt: true,
      },
    }),
    prisma.webhookEvent.count({
      where: {
        source: WebhookSource.WISE,
        status: { in: [WebhookStatus.FAILED, WebhookStatus.RETRYING] },
      },
    }),
  ]);

  const received =
    counts.find((c) => c.status === WebhookStatus.RECEIVED)?._count ?? 0;
  const processed =
    counts.find((c) => c.status === WebhookStatus.PROCESSED)?._count ?? 0;
  const failed =
    counts.find((c) => c.status === WebhookStatus.FAILED)?._count ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.webhooks.eyebrow}
        title={dict.admin.webhooks.title}
        description={dict.admin.webhooks.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label={dict.admin.webhooks.kpiReceived}
          value={String(received)}
        />
        <KpiCard
          label={dict.admin.webhooks.kpiProcessed}
          value={String(processed)}
          tone="success"
        />
        <KpiCard
          label={dict.admin.webhooks.kpiFailed}
          value={String(failed)}
          tone={failed > 0 ? "danger" : "neutral"}
        />
        <KpiCard
          label={dict.admin.webhooks.kpiWiseStuck}
          value={String(wiseFailedCount)}
          tone={wiseFailedCount > 0 ? "danger" : "neutral"}
          hint={dict.admin.webhooks.kpiWiseStuckHint}
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        {(Object.values(WebhookStatus) as WebhookStatus[]).map((s) => {
          const active = statusFilter === s;
          const sp = new URLSearchParams();
          if (!active) sp.set("status", s);
          return (
            <a
              key={s}
              href={`?${sp.toString()}`}
              className={cn(
                "inline-flex items-center h-9 px-3 rounded-full border text-[11px] font-medium uppercase tracking-wide",
                active ? STATUS_TONE[s] : "bg-surface text-fg border-line hover:bg-subtle",
              )}
            >
              {s}
            </a>
          );
        })}
      </div>

      <DashboardSection title={dict.admin.webhooks.tableTitle}>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.webhooks.colReceived}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.webhooks.colSource}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.webhooks.colType}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.webhooks.colStatus}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.webhooks.colAttempts}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.webhooks.colError}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.webhooks.colAction}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-faint">
                    {dict.admin.webhooks.empty}
                  </td>
                </tr>
              ) : (
                recent.map((e) => {
                  const canReplay =
                    e.source === WebhookSource.WISE &&
                    e.eventType === "balances#credit" &&
                    e.status !== WebhookStatus.PROCESSED;
                  return (
                    <tr key={e.id} className="hover:bg-subtle/40">
                      <td className="px-5 py-2 text-[11px] font-mono text-faint whitespace-nowrap">
                        {formatDate(e.receivedAt, lang, "short")}
                      </td>
                      <td className="px-5 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                            SOURCE_TONE[e.source],
                          )}
                        >
                          {e.source}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-xs font-mono text-fg">
                        {e.eventType}
                      </td>
                      <td className="px-5 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                            STATUS_TONE[e.status],
                          )}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="px-5 py-2 text-xs text-fg text-end">
                        {e.attempts}
                      </td>
                      <td className="px-5 py-2 text-[11px] text-warning max-w-65 truncate">
                        {e.lastError ?? "—"}
                      </td>
                      <td className="px-5 py-2 text-end">
                        {canReplay && <ReplayButton eventId={e.id} />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </div>
  );
}
