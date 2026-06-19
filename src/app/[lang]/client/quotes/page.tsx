import { notFound } from "next/navigation";
import {
  QuoteStatus,
  Role,
  SourcingRequestOrigin,
} from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { InvoiceIcon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { FilterTab } from "@/components/ui/filter-tab";
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
 * Aggregated buyer-side Quotes surface — partner round 4.
 *
 * Today quotes only show inside `/client/requests/[id]` — buyers
 * working on multiple briefs at once had no single place to scan
 * what's pending decision. This page lists every quote across all the
 * buyer's requests, grouped by request, with the status pill and a
 * deep-link to the request detail where the accept/reject controls
 * live.
 *
 * Filters: all (default), pending decision, accepted, rejected.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/quotes">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.quotesAggregated.title };
}

const QUOTE_TONE: Record<QuoteStatus, string> = {
  DRAFT: "bg-subtle text-muted border-line",
  SENT_TO_AGENT: "bg-info-soft text-info border-info-edge",
  SENT_TO_CLIENT: "bg-warning-soft text-warning border-warning-edge",
  ACCEPTED: "bg-success-soft text-success border-success-edge",
  REJECTED: "bg-subtle text-faint border-line",
  EXPIRED: "bg-subtle text-faint border-line",
};

export default async function ClientQuotesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/client/quotes">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);
  const t = dict.client.quotesAggregated;

  const filter =
    typeof search?.filter === "string" &&
    (search.filter === "pending" ||
      search.filter === "accepted" ||
      search.filter === "rejected")
      ? search.filter
      : "all";

  const where = {
    request: {
      clientOrgId: user.organizationId,
      origin: SourcingRequestOrigin.SOURCING_FLOW,
    },
    ...(filter === "pending"
      ? { status: QuoteStatus.SENT_TO_CLIENT }
      : filter === "accepted"
        ? { status: QuoteStatus.ACCEPTED }
        : filter === "rejected"
          ? { status: QuoteStatus.REJECTED }
          : {
              status: {
                in: [
                  QuoteStatus.SENT_TO_CLIENT,
                  QuoteStatus.ACCEPTED,
                  QuoteStatus.REJECTED,
                  QuoteStatus.EXPIRED,
                ],
              },
            }),
  };

  const [quotes, pendingCount, acceptedCount, rejectedCount] = await Promise.all([
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
        depositPercentageBps: true,
        request: {
          select: {
            id: true,
            reference: true,
            title: true,
          },
        },
        factoryOrg: {
          select: { displayName: true, country: true },
        },
      },
    }),
    prisma.quote.count({
      where: {
        request: {
          clientOrgId: user.organizationId,
          origin: SourcingRequestOrigin.SOURCING_FLOW,
        },
        status: QuoteStatus.SENT_TO_CLIENT,
      },
    }),
    prisma.quote.count({
      where: {
        request: {
          clientOrgId: user.organizationId,
          origin: SourcingRequestOrigin.SOURCING_FLOW,
        },
        status: QuoteStatus.ACCEPTED,
      },
    }),
    prisma.quote.count({
      where: {
        request: {
          clientOrgId: user.organizationId,
          origin: SourcingRequestOrigin.SOURCING_FLOW,
        },
        status: QuoteStatus.REJECTED,
      },
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
        <KpiCard label={t.kpiPending} value={pendingCount} tone="warning" />
        <KpiCard label={t.kpiAccepted} value={acceptedCount} tone="success" />
        <KpiCard label={t.kpiRejected} value={rejectedCount} tone="neutral" />
      </div>

      <div className="flex items-center gap-1 mb-4 flex-wrap">
        <FilterTab href={`/${lang}/client/quotes`} active={filter === "all"} label={t.filterAll} />
        <FilterTab
          href={`/${lang}/client/quotes?filter=pending`}
          active={filter === "pending"}
          label={t.filterPending}
        />
        <FilterTab
          href={`/${lang}/client/quotes?filter=accepted`}
          active={filter === "accepted"}
          label={t.filterAccepted}
        />
        <FilterTab
          href={`/${lang}/client/quotes?filter=rejected`}
          active={filter === "rejected"}
          label={t.filterRejected}
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
                href={`/${lang}/client/requests/${q.request.id}`}
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
                      {q.factoryOrg.displayName} ({q.factoryOrg.country}) ·{" "}
                      {q.quantity} × {formatEUR(q.unitPriceCentsClient / 100, lang)} · {q.incoterm} · {q.leadTimeDays}d
                    </p>
                    <p className="text-[11px] text-faint mt-0.5">
                      {t.receivedOn} {formatDate(q.createdAt, lang, "short")} ·{" "}
                      {t.validUntil} {formatDate(q.validUntil, lang, "short")}
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
                    <a
                      href={`/api/quotes/${q.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-link hover:text-link-hover underline underline-offset-2"
                    >
                      {dict.client.quotes.downloadPdf}
                    </a>
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

