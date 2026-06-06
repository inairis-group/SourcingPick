import { notFound } from "next/navigation";
import {AdminScope, InvoiceStatus, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
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
}: PageProps<"/[lang]/admin/finance">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.finance.title };
}

const INVOICE_TONE: Record<InvoiceStatus, string> = {
  DRAFT: "bg-subtle text-muted border-line",
  ISSUED: "bg-info-soft text-info border-info-edge",
  PAID: "bg-success-soft text-success border-success-edge",
  OVERDUE: "bg-warning-soft text-warning border-warning-edge",
  VOID: "bg-subtle text-faint border-line",
};

export default async function AdminFinancePage({
  params,
}: PageProps<"/[lang]/admin/finance">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.FINANCE);
  const dict = await getDictionary(lang);

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const ytdStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

  const [mtdAgg, ytdAgg, invoiceMix, recentInvoices] = await Promise.all([
    prisma.order.aggregate({
      where: {
        deletedAt: null,
        createdAt: { gte: monthStart },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalCents: true, commissionCents: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        deletedAt: null,
        createdAt: { gte: ytdStart },
        status: { not: OrderStatus.CANCELLED },
      },
      _sum: { totalCents: true, commissionCents: true },
      _count: true,
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
      take: 30,
      select: {
        id: true,
        reference: true,
        type: true,
        amountCents: true,
        status: true,
        issuedAt: true,
        paidAt: true,
        organization: { select: { displayName: true } },
        order: { select: { reference: true } },
      },
    }),
  ]);

  const issuedAgg = invoiceMix.find((m) => m.status === InvoiceStatus.ISSUED);
  const overdueAgg = invoiceMix.find((m) => m.status === InvoiceStatus.OVERDUE);
  const paidAgg = invoiceMix.find((m) => m.status === InvoiceStatus.PAID);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.finance.eyebrow}
        title={dict.admin.finance.title}
        description={dict.admin.finance.description}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label={dict.admin.finance.kpiGmvMtd}
          value={formatEUR((mtdAgg._sum.totalCents ?? 0) / 100, lang)}
          hint={dict.admin.finance.kpiOrdersCount.replace(
            "{n}",
            String(mtdAgg._count),
          )}
        />
        <KpiCard
          label={dict.admin.finance.kpiGmvYtd}
          value={formatEUR((ytdAgg._sum.totalCents ?? 0) / 100, lang)}
          hint={dict.admin.finance.kpiOrdersCount.replace(
            "{n}",
            String(ytdAgg._count),
          )}
        />
        <KpiCard
          label={dict.admin.finance.kpiCommissionMtd}
          value={formatEUR((mtdAgg._sum.commissionCents ?? 0) / 100, lang)}
        />
        <KpiCard
          label={dict.admin.finance.kpiCommissionYtd}
          value={formatEUR((ytdAgg._sum.commissionCents ?? 0) / 100, lang)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <KpiCard
          label={dict.admin.finance.kpiInvoicesIssued}
          value={formatEUR((issuedAgg?._sum.amountCents ?? 0) / 100, lang)}
          hint={`${issuedAgg?._count ?? 0}`}
          tone="info"
        />
        <KpiCard
          label={dict.admin.finance.kpiInvoicesOverdue}
          value={formatEUR((overdueAgg?._sum.amountCents ?? 0) / 100, lang)}
          hint={`${overdueAgg?._count ?? 0}`}
          tone={overdueAgg && overdueAgg._count > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          label={dict.admin.finance.kpiInvoicesPaid}
          value={formatEUR((paidAgg?._sum.amountCents ?? 0) / 100, lang)}
          hint={`${paidAgg?._count ?? 0}`}
          tone="success"
        />
      </div>

      <DashboardSection title={dict.admin.finance.invoicesTitle}>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.finance.colReference}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.finance.colType}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.finance.colOrg}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.finance.colAmount}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.finance.colStatus}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.finance.colIssued}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-faint">
                    {dict.admin.finance.empty}
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-subtle/40">
                    <td className="px-5 py-2 text-xs font-mono">
                      {inv.reference}
                      {inv.order && (
                        <span className="text-faint ms-1">
                          · {inv.order.reference}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-xs text-fg">{inv.type}</td>
                    <td className="px-5 py-2 text-xs text-fg">
                      {inv.organization.displayName}
                    </td>
                    <td className="px-5 py-2 text-sm font-semibold text-headline text-end">
                      {formatEUR(inv.amountCents / 100, lang)}
                    </td>
                    <td className="px-5 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                          INVOICE_TONE[inv.status],
                        )}
                      >
                        {dict.client.orders.invoiceStatuses[inv.status]}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-[11px] text-faint">
                      {formatDate(inv.issuedAt, lang, "short")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardSection>
    </div>
  );
}
