import { notFound } from "next/navigation";
import {
  InvoiceStatus,
  InvoiceType,
  Role,
} from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { InvoiceIcon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

/**
 * Agent invoices index (partner item #21 — close one of the remaining
 * agent access gaps). Shows every research-fee invoice raised on a
 * request this agent handles, plus its status and the credit-back
 * window deadline so the agent can chase clients before the fee
 * expires.
 *
 * Research-fee invoices are issued via the per-request control on the
 * request detail page; this index is read-only and groups everything in
 * one place for follow-up.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/invoices">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.invoices.title };
}

export default async function AgentInvoicesPage({
  params,
}: PageProps<"/[lang]/agent/invoices">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);
  const t = dict.agent.invoices;

  const invoices = await prisma.invoice.findMany({
    where: {
      type: InvoiceType.RESEARCH_FEE,
      // Scope to invoices anchored on a request this agent is handling.
      order: {
        is: null,
      },
      AND: [
        {
          OR: [
            // Anchored via SourcingRequest.researchFeeInvoiceId
            {
              id: {
                in: (
                  await prisma.sourcingRequest.findMany({
                    where: { agentId: agent.id },
                    select: { researchFeeInvoiceId: true },
                  })
                )
                  .map((r) => r.researchFeeInvoiceId)
                  .filter((id): id is string => id !== null),
              },
            },
          ],
        },
      ],
    },
    orderBy: [{ status: "asc" }, { issuedAt: "desc" }],
    select: {
      id: true,
      reference: true,
      amountCents: true,
      status: true,
      issuedAt: true,
      dueAt: true,
      paidAt: true,
      organization: { select: { displayName: true } },
    },
    take: 100,
  });

  // Resolve the request reference for each invoice so the agent can
  // jump to the assignment. Cheap second query keyed by invoice id.
  const requests = await prisma.sourcingRequest.findMany({
    where: {
      agentId: agent.id,
      researchFeeInvoiceId: { in: invoices.map((i) => i.id) },
    },
    select: { id: true, reference: true, title: true, researchFeeInvoiceId: true },
  });
  const requestByInvoice = new Map(
    requests
      .filter((r) => r.researchFeeInvoiceId)
      .map((r) => [r.researchFeeInvoiceId!, r] as const),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {t.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm text-muted">{t.description}</p>
      </header>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-2">
            {t.emptyTitle}
          </p>
          <p className="text-sm text-muted">{t.emptyBody}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {invoices.map((inv) => {
            const req = requestByInvoice.get(inv.id);
            return (
              <li key={inv.id}>
                <div className="rounded-lg border border-line bg-surface p-4 flex items-start gap-4 flex-wrap">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <HugeiconsIcon
                      icon={InvoiceIcon}
                      size={16}
                      strokeWidth={1.5}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-mono uppercase tracking-wide text-faint">
                      {inv.reference}
                    </p>
                    <p className="text-sm font-semibold text-headline">
                      {req?.title ?? t.unknownRequest}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {inv.organization?.displayName ?? "—"}
                    </p>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-muted">
                      <span>
                        {t.issuedOn} {formatDate(inv.issuedAt, lang, "short")}
                      </span>
                      {inv.dueAt && (
                        <span>
                          {t.dueOn} {formatDate(inv.dueAt, lang, "short")}
                        </span>
                      )}
                      {inv.paidAt && (
                        <span className="text-success">
                          {t.paidOn} {formatDate(inv.paidAt, lang, "short")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-end flex flex-col items-end gap-1">
                    <p className="text-base font-semibold text-headline">
                      {formatEUR(inv.amountCents / 100, lang)}
                    </p>
                    <StatusPill status={inv.status} dict={dict} />
                    {req && (
                      <Link
                        href={`/${lang}/agent/requests/${req.id}`}
                        variant="muted"
                        className="text-xs text-link hover:text-link-hover"
                      >
                        {t.openRequest} →
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusPill({
  status,
  dict,
}: {
  status: InvoiceStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const t = dict.agent.invoices.statuses;
  const map: Record<InvoiceStatus, { label: string; classes: string }> = {
    DRAFT: { label: t.DRAFT, classes: "bg-subtle text-faint border-line" },
    ISSUED: {
      label: t.ISSUED,
      classes: "bg-info-soft text-info border-info-edge",
    },
    PAID: {
      label: t.PAID,
      classes: "bg-success-soft text-success border-success-edge",
    },
    OVERDUE: {
      label: t.OVERDUE,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    VOID: { label: t.VOID, classes: "bg-subtle text-muted border-line" },
  };
  const { label, classes } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
        classes,
      )}
    >
      {label}
    </span>
  );
}
