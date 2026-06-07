import { notFound } from "next/navigation";
import { QuoteStatus, Role } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { InvoiceIcon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  KpiCard,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

/**
 * Aggregated agent-side Quotes surface — partner round 4. Mirrors
 * the buyer page but scoped to quotes routed through this agent.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/quotes">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.quotesAggregated.title };
}

const QUOTE_TONE: Record<QuoteStatus, string> = {
  DRAFT: "bg-subtle text-muted border-line",
  SENT_TO_AGENT: "bg-warning-soft text-warning border-warning-edge",
  SENT_TO_CLIENT: "bg-info-soft text-info border-info-edge",
  ACCEPTED: "bg-success-soft text-success border-success-edge",
  REJECTED: "bg-subtle text-faint border-line",
  EXPIRED: "bg-subtle text-faint border-line",
};

export default async function AgentQuotesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/agent/quotes">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);
  const t = dict.agent.quotesAggregated;

  const filter =
    typeof search?.filter === "string" &&
    (search.filter === "to_forward" || search.filter === "with_client" || search.filter === "decided")
      ? search.filter
      : "all";

  const where = {
    agentId: agent.id,
    ...(filter === "to_forward"
      ? { status: QuoteStatus.SENT_TO_AGENT }
      : filter === "with_client"
        ? { status: QuoteStatus.SENT_TO_CLIENT }
        : filter === "decided"
          ? {
              status: {
                in: [QuoteStatus.ACCEPTED, QuoteStatus.REJECTED, QuoteStatus.EXPIRED],
              },
            }
          : {}),
  };

  const [quotes, toForwardCount, withClientCount, acceptedCount] =
    await Promise.all([
      prisma.quote.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          status: true,
          unitPriceCentsClient: true,
          totalCentsClient: true,
          quantity: true,
          leadTimeDays: true,
          incoterm: true,
          validUntil: true,
          createdAt: true,
          marginCents: true,
          request: {
            select: {
              id: true,
              reference: true,
              title: true,
              clientOrg: { select: { displayName: true } },
            },
          },
          factoryOrg: { select: { displayName: true, country: true } },
        },
      }),
      prisma.quote.count({
        where: { agentId: agent.id, status: QuoteStatus.SENT_TO_AGENT },
      }),
      prisma.quote.count({
        where: { agentId: agent.id, status: QuoteStatus.SENT_TO_CLIENT },
      }),
      prisma.quote.count({
        where: { agentId: agent.id, status: QuoteStatus.ACCEPTED },
      }),
    ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <KpiCard label={t.kpiToForward} value={toForwardCount} tone="warning" />
        <KpiCard label={t.kpiWithClient} value={withClientCount} tone="info" />
        <KpiCard label={t.kpiAccepted} value={acceptedCount} tone="success" />
      </div>

      <div className="flex items-center gap-1 mb-4 flex-wrap">
        <FilterTab href={`/${lang}/agent/quotes`} active={filter === "all"} label={t.filterAll} />
        <FilterTab
          href={`/${lang}/agent/quotes?filter=to_forward`}
          active={filter === "to_forward"}
          label={t.filterToForward}
        />
        <FilterTab
          href={`/${lang}/agent/quotes?filter=with_client`}
          active={filter === "with_client"}
          label={t.filterWithClient}
        />
        <FilterTab
          href={`/${lang}/agent/quotes?filter=decided`}
          active={filter === "decided"}
          label={t.filterDecided}
        />
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-1">
            {t.emptyTitle}
          </p>
          <p className="text-sm text-muted">{t.emptyBody}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {quotes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/${lang}/agent/requests/${q.request.id}`}
                variant="muted"
                className="block rounded-lg border border-line bg-surface p-4 hover:bg-subtle/30 transition-colors duration-fast"
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <HugeiconsIcon
                      icon={InvoiceIcon}
                      size={16}
                      strokeWidth={1.5}
                    />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono uppercase tracking-wide text-faint">
                      {q.request.reference}
                    </p>
                    <p className="text-sm font-semibold text-headline">
                      {q.request.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {q.request.clientOrg.displayName} ↔{" "}
                      {q.factoryOrg.displayName} ({q.factoryOrg.country})
                    </p>
                    <p className="text-[11px] text-faint mt-0.5">
                      {q.quantity} × {formatEUR(q.unitPriceCentsClient / 100, lang)} ·{" "}
                      {q.incoterm} · {q.leadTimeDays}d · {t.marginLabel}{" "}
                      {formatEUR(q.marginCents / 100, lang)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
                        QUOTE_TONE[q.status],
                      )}
                    >
                      {t.statuses[q.status]}
                    </span>
                    <span className="text-sm font-semibold text-headline">
                      {formatEUR(q.totalCentsClient / 100, lang)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
        active ? "bg-action text-on-action" : "bg-subtle text-muted hover:text-fg",
      )}
    >
      {label}
    </Link>
  );
}
