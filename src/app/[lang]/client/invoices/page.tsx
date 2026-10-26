import { notFound } from "next/navigation";
import { InvoiceStatus, InvoiceType, Role } from "@prisma/client";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  DashboardSection,
  KpiCard,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/invoices">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.invoices.title };
}

const STATUS_TONE: Record<InvoiceStatus, string> = {
  DRAFT: "bg-subtle text-muted border-line",
  ISSUED: "bg-info-soft text-info border-info-edge",
  PAID: "bg-success-soft text-success border-success-edge",
  OVERDUE: "bg-warning-soft text-warning border-warning-edge",
  VOID: "bg-subtle text-faint border-line",
};

export default async function ClientInvoicesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/client/invoices">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);

  const statusFilter =
    typeof search?.status === "string" &&
    (Object.values(InvoiceStatus) as string[]).includes(search.status)
      ? (search.status as InvoiceStatus)
      : undefined;

  const [invoices, paidAgg, openAgg, overdueAgg] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        organizationId: user.organizationId,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      orderBy: { issuedAt: "desc" },
      take: 100,
      select: {
        id: true,
        reference: true,
        type: true,
        amountCents: true,
        status: true,
        issuedAt: true,
        dueAt: true,
        paidAt: true,
        pdfUrl: true,
        order: { select: { id: true, reference: true, request: { select: { title: true } } } },
      },
    }),
    prisma.invoice.aggregate({
      where: {
        organizationId: user.organizationId,
        status: InvoiceStatus.PAID,
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: {
        organizationId: user.organizationId,
        status: InvoiceStatus.ISSUED,
      },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: {
        organizationId: user.organizationId,
        status: InvoiceStatus.OVERDUE,
      },
      _sum: { amountCents: true },
      _count: true,
    }),
  ]);

  const labelForType = (t: InvoiceType): string => {
    if (t === InvoiceType.DEPOSIT) return dict.client.orders.invoiceTypeDeposit;
    if (t === InvoiceType.BALANCE) return dict.client.orders.invoiceTypeBalance;
    if (t === InvoiceType.SHIPPING) return dict.client.orders.invoiceTypeShipping;
    return t;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.client.invoices.eyebrow}
        title={dict.client.invoices.title}
        description={dict.client.invoices.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <KpiCard
          label={dict.client.invoices.kpiOpen}
          value={formatEUR((openAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${openAgg._count}`}
          tone={openAgg._count > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          label={dict.client.invoices.kpiOverdue}
          value={formatEUR((overdueAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${overdueAgg._count}`}
          tone={overdueAgg._count > 0 ? "danger" : "neutral"}
        />
        <KpiCard
          label={dict.client.invoices.kpiPaid}
          value={formatEUR((paidAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${paidAgg._count}`}
          tone="success"
        />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(Object.values(InvoiceStatus) as InvoiceStatus[]).map((s) => {
          const active = statusFilter === s;
          const sp = new URLSearchParams();
          if (!active) sp.set("status", s);
          return (
            <a
              key={s}
              href={`?${sp.toString()}`}
              className={cn(
                "inline-flex items-center h-9 px-3 rounded-full border text-[11px] font-medium uppercase tracking-wide",
                active
                  ? STATUS_TONE[s]
                  : "bg-surface text-fg border-line hover:bg-subtle",
              )}
            >
              {dict.client.orders.invoiceStatuses[s]}
            </a>
          );
        })}
      </div>

      <DashboardSection title={dict.client.invoices.tableTitle}>
        {invoices.length === 0 ? (
          <p className="text-sm text-faint text-center py-8">
            {dict.client.invoices.empty}
          </p>
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="md:hidden flex flex-col gap-3 -my-2.5">
              {invoices.map((inv) => (
                <li
                  key={inv.id}
                  className="border-t border-line-subtle pt-3 first:border-0 first:pt-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono uppercase tracking-wide text-faint">
                        {inv.reference}
                      </p>
                      <p className="text-sm font-medium text-fg truncate">
                        {inv.order?.request.title ?? labelForType(inv.type)}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {labelForType(inv.type)}
                        {inv.order && (
                          <span className="text-faint">
                            {" · "}
                            {inv.order.reference}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-end shrink-0">
                      <p className="text-sm font-semibold text-headline">
                        {formatEUR(inv.amountCents / 100, lang)}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 mt-1 rounded-full border text-[10px] font-medium uppercase tracking-wide",
                          STATUS_TONE[inv.status],
                        )}
                      >
                        {dict.client.orders.invoiceStatuses[inv.status]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-[11px] text-faint">
                      {inv.paidAt
                        ? `${dict.client.orders.invoicePaidOn} ${formatDate(inv.paidAt, lang, "short")}`
                        : `${dict.client.invoices.dueOn} ${formatDate(inv.dueAt, lang, "short")}`}
                    </span>
                    {/* Partner #11: every invoice now has a generated
                        PDF route. Legacy externally-hosted `pdfUrl`
                        still takes precedence if set. */}
                    <a
                      href={inv.pdfUrl ?? `/api/invoices/${inv.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-link hover:text-link-hover underline underline-offset-2"
                    >
                      {dict.client.invoices.downloadPdf}
                    </a>
                    {inv.order && (
                      <Link
                        href={`/${lang}/client/orders/${inv.order.id}`}
                        variant="default"
                        className="text-[11px] font-medium"
                      >
                        {dict.client.invoices.viewOrder} →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden md:block -mx-5 -my-5 overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col style={{ width: "18%" }} />
                  <col />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "9%" }} />
                </colgroup>
                <thead className="bg-subtle">
                  <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                    <th className="px-5 py-2.5 font-medium">
                      {dict.client.invoices.colReference}
                    </th>
                    <th className="px-5 py-2.5 font-medium">
                      {dict.client.invoices.colSubject}
                    </th>
                    <th className="px-5 py-2.5 font-medium">
                      {dict.client.invoices.colType}
                    </th>
                    <th className="px-5 py-2.5 font-medium text-end">
                      {dict.client.invoices.colAmount}
                    </th>
                    <th className="px-5 py-2.5 font-medium">
                      {dict.client.invoices.colStatus}
                    </th>
                    <th className="px-5 py-2.5 font-medium">
                      {dict.client.invoices.colDue}
                    </th>
                    <th className="px-5 py-2.5 font-medium text-end" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-subtle">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-subtle/40">
                      <td className="px-5 py-3 text-xs font-mono">
                        {inv.reference}
                      </td>
                      <td className="px-5 py-3 truncate">
                        <p className="text-sm text-fg truncate">
                          {inv.order?.request.title ?? labelForType(inv.type)}
                        </p>
                        {inv.order && (
                          <p className="text-[11px] text-faint font-mono">
                            {inv.order.reference}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted">
                        {labelForType(inv.type)}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-headline text-end whitespace-nowrap">
                        {formatEUR(inv.amountCents / 100, lang)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                            STATUS_TONE[inv.status],
                          )}
                        >
                          {dict.client.orders.invoiceStatuses[inv.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-faint whitespace-nowrap">
                        {inv.paidAt
                          ? `${dict.client.orders.invoicePaidOn} ${formatDate(inv.paidAt, lang, "short")}`
                          : formatDate(inv.dueAt, lang, "short")}
                      </td>
                      <td className="px-5 py-3 text-end">
                        <a
                          href={inv.pdfUrl ?? `/api/invoices/${inv.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-link hover:text-link-hover underline underline-offset-2"
                        >
                          {dict.client.invoices.downloadPdf}
                        </a>
                        {inv.order && (
                          <Link
                            href={`/${lang}/client/orders/${inv.order.id}`}
                            variant="default"
                            className="text-[11px] font-medium ms-2"
                          >
                            →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DashboardSection>
    </div>
  );
}
