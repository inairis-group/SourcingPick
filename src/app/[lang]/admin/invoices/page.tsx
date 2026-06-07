import { notFound } from "next/navigation";
import {
  AdminScope,
  InvoiceStatus,
  InvoiceType,
  OrgType,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  KpiCard,
} from "@/components/dashboard/primitives";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";
import { CreateInvoiceDialog } from "./_components/create-invoice-dialog";
import { InvoiceRowControls } from "./_components/invoice-row-controls";

/**
 * Admin invoices index — partner round 4.
 *
 * Single ledger of every invoice in the system (system-generated
 * order/research/cert invoices + admin-issued ADMIN_CUSTOM ones).
 * Admin can:
 *   - Filter by recipient type (client / factory / agent / all) and status.
 *   - Create a new ADMIN_CUSTOM invoice to any org via the dialog.
 *   - Mark an invoice paid or void it from the row controls.
 *   - Download the PDF from the existing /api/invoices/[id]/pdf route.
 *
 * Gated on AdminScope.FINANCE.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/invoices">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.invoices.title };
}

const STATUS_TONE: Record<InvoiceStatus, string> = {
  DRAFT: "bg-subtle text-muted border-line",
  ISSUED: "bg-warning-soft text-warning border-warning-edge",
  PAID: "bg-success-soft text-success border-success-edge",
  OVERDUE: "bg-danger-soft text-danger border-danger-edge",
  VOID: "bg-subtle text-faint border-line",
};

export default async function AdminInvoicesPage({
  params,
  searchParams,
}: PageProps<"/[lang]/admin/invoices">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.FINANCE);
  const dict = await getDictionary(lang);
  const t = dict.admin.invoices;

  // "Agent" filter maps to OrgType.PLATFORM (agents are PLATFORM-org
  // users in the data model). Buyer and factory map directly.
  const recipientParam =
    typeof search?.recipient === "string" ? search.recipient : null;
  const recipientFilter: OrgType | null =
    recipientParam === "CLIENT"
      ? OrgType.CLIENT
      : recipientParam === "FACTORY"
        ? OrgType.FACTORY
        : recipientParam === "AGENT"
          ? OrgType.PLATFORM
          : null;
  const statusFilter =
    typeof search?.status === "string" &&
    (Object.values(InvoiceStatus) as string[]).includes(search.status)
      ? (search.status as InvoiceStatus)
      : null;

  const where = {
    ...(recipientFilter ? { organization: { type: recipientFilter } } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [invoices, issuedAgg, paidAgg, overdueCount] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      take: 200,
      select: {
        id: true,
        reference: true,
        type: true,
        amountCents: true,
        status: true,
        issuedAt: true,
        dueAt: true,
        paidAt: true,
        lineDescription: true,
        organization: {
          select: { displayName: true, type: true, country: true },
        },
        order: { select: { reference: true } },
      },
    }),
    prisma.invoice.aggregate({
      where: { status: InvoiceStatus.ISSUED },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { status: InvoiceStatus.PAID },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.invoice.count({
      where: {
        status: InvoiceStatus.ISSUED,
        dueAt: { lt: new Date() },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        actions={<CreateInvoiceDialog />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <KpiCard
          label={t.kpiOutstanding}
          value={formatEUR((issuedAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${issuedAgg._count} ${t.invoices}`}
          tone="warning"
        />
        <KpiCard
          label={t.kpiPaid}
          value={formatEUR((paidAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${paidAgg._count} ${t.invoices}`}
          tone="success"
        />
        <KpiCard
          label={t.kpiOverdue}
          value={overdueCount}
          tone={overdueCount > 0 ? "danger" : "neutral"}
        />
      </div>

      <div className="flex items-center gap-1 mb-4 flex-wrap">
        <FilterTab
          href={`/${lang}/admin/invoices`}
          active={!recipientFilter && !statusFilter}
          label={t.filterAll}
        />
        <FilterTab
          href={`/${lang}/admin/invoices?recipient=CLIENT`}
          active={recipientParam === "CLIENT"}
          label={t.filterClient}
        />
        <FilterTab
          href={`/${lang}/admin/invoices?recipient=FACTORY`}
          active={recipientParam === "FACTORY"}
          label={t.filterFactory}
        />
        <FilterTab
          href={`/${lang}/admin/invoices?recipient=AGENT`}
          active={recipientParam === "AGENT"}
          label={t.filterAgent}
        />
        <span className="mx-2 text-faint">·</span>
        <FilterTab
          href={`/${lang}/admin/invoices?status=ISSUED`}
          active={statusFilter === "ISSUED"}
          label={t.filterIssued}
        />
        <FilterTab
          href={`/${lang}/admin/invoices?status=PAID`}
          active={statusFilter === "PAID"}
          label={t.filterPaid}
        />
        <FilterTab
          href={`/${lang}/admin/invoices?status=VOID`}
          active={statusFilter === "VOID"}
          label={t.filterVoid}
        />
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-1">
            {t.emptyTitle}
          </p>
          <p className="text-sm text-muted">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-4 py-2.5 font-medium">{t.colReference}</th>
                <th className="px-4 py-2.5 font-medium">{t.colRecipient}</th>
                <th className="px-4 py-2.5 font-medium">{t.colType}</th>
                <th className="px-4 py-2.5 font-medium text-end">
                  {t.colAmount}
                </th>
                <th className="px-4 py-2.5 font-medium">{t.colStatus}</th>
                <th className="px-4 py-2.5 font-medium">{t.colIssuedAt}</th>
                <th className="px-4 py-2.5 font-medium">{t.colDueAt}</th>
                <th className="px-4 py-2.5 font-medium text-end">
                  {t.colActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-subtle/40">
                  <td className="px-4 py-2.5 text-xs font-mono">
                    {inv.reference}
                    {inv.order && (
                      <span className="block text-[10px] text-faint">
                        ↳ {inv.order.reference}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <p className="text-fg font-medium">
                      {inv.organization.displayName}
                    </p>
                    <p className="text-[10px] text-faint uppercase">
                      {inv.organization.type} · {inv.organization.country}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    <p>{t.types[inv.type]}</p>
                    {inv.lineDescription && (
                      <p className="text-[10px] text-faint italic truncate max-w-[20ch]">
                        {inv.lineDescription}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-headline text-end">
                    {formatEUR(inv.amountCents / 100, lang)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap",
                        STATUS_TONE[inv.status],
                      )}
                    >
                      {t.statuses[inv.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-muted">
                    {formatDate(inv.issuedAt, lang, "short")}
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-muted">
                    {inv.paidAt
                      ? `✓ ${formatDate(inv.paidAt, lang, "short")}`
                      : formatDate(inv.dueAt, lang, "short")}
                  </td>
                  <td className="px-4 py-2.5 text-end">
                    <InvoiceRowControls
                      invoiceId={inv.id}
                      status={inv.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        "inline-flex items-center h-7 px-2.5 rounded-full text-[11px] font-medium whitespace-nowrap",
        "transition-colors duration-fast",
        active ? "bg-action text-on-action" : "bg-subtle text-muted hover:text-fg",
      )}
    >
      {label}
    </Link>
  );
}

// Type-only — silences unused-warning for `InvoiceType` if compiler can't see
// it referenced in the JSX (used in dict.types lookups).
void InvoiceType;
