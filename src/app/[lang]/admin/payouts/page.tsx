import { notFound } from "next/navigation";
import {AdminScope, PayoutStatus } from "@prisma/client";
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
}: PageProps<"/[lang]/admin/payouts">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.payouts.title };
}

const STATUS_TONE: Record<PayoutStatus, string> = {
  PENDING: "bg-warning-soft text-warning border-warning-edge",
  SCHEDULED: "bg-info-soft text-info border-info-edge",
  SENT: "bg-success-soft text-success border-success-edge",
  RECEIVED: "bg-success-soft text-success border-success-edge",
  FAILED: "bg-danger-soft text-danger border-danger-edge",
};

export default async function AdminPayoutsPage({
  params,
}: PageProps<"/[lang]/admin/payouts">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.FINANCE);
  const dict = await getDictionary(lang);

  const [pendingAgg, sentAgg, failedCount, recent] = await Promise.all([
    prisma.payout.aggregate({
      where: { status: PayoutStatus.PENDING },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.payout.aggregate({
      where: { status: { in: [PayoutStatus.SENT, PayoutStatus.RECEIVED] } },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.payout.count({ where: { status: PayoutStatus.FAILED } }),
    prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reference: true,
        amountCents: true,
        // Renamed from `commissionCents` (CTO audit F3) — Payout
        // carries the supplier-side 6% fee, distinct from
        // Order.commissionCents (full buyer-side platform margin).
        supplierFeeCents: true,
        status: true,
        method: true,
        sentAt: true,
        createdAt: true,
        failureReason: true,
        providerRef: true,
        factoryOrg: { select: { displayName: true } },
        escrow: {
          select: {
            order: { select: { reference: true } },
          },
        },
        shipment: { select: { reference: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.payouts.eyebrow}
        title={dict.admin.payouts.title}
        description={dict.admin.payouts.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <KpiCard
          label={dict.admin.payouts.kpiPending}
          value={formatEUR((pendingAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${pendingAgg._count}`}
          tone={pendingAgg._count > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          label={dict.admin.payouts.kpiSent}
          value={formatEUR((sentAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${sentAgg._count}`}
          tone="success"
        />
        <KpiCard
          label={dict.admin.payouts.kpiFailed}
          value={String(failedCount)}
          tone={failedCount > 0 ? "danger" : "neutral"}
        />
      </div>

      <DashboardSection title={dict.admin.payouts.ledgerTitle}>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.payouts.colReference}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.payouts.colFactory}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.payouts.colOrder}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.payouts.colAmount}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.payouts.colCommission}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.payouts.colStatus}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.payouts.colSent}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-faint">
                    {dict.admin.payouts.empty}
                  </td>
                </tr>
              ) : (
                recent.map((p) => (
                  <tr key={p.id} className="hover:bg-subtle/40">
                    <td className="px-5 py-2 text-xs font-mono">{p.reference}</td>
                    <td className="px-5 py-2 text-xs text-fg">
                      {p.factoryOrg.displayName}
                    </td>
                    <td className="px-5 py-2 text-xs font-mono text-muted">
                      {/* Freight payouts have no escrow — they settle a
                          shipment, not a released order leg. */}
                      {p.escrow?.order?.reference ?? p.shipment?.reference ?? "—"}
                    </td>
                    <td className="px-5 py-2 text-sm font-semibold text-headline text-end">
                      {formatEUR(p.amountCents / 100, lang)}
                    </td>
                    <td className="px-5 py-2 text-xs text-muted text-end">
                      {formatEUR(p.supplierFeeCents / 100, lang)}
                    </td>
                    <td className="px-5 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                          STATUS_TONE[p.status],
                        )}
                      >
                        {dict.factory.payouts[
                          `status${p.status[0]}${p.status.slice(1).toLowerCase()}` as never
                        ] ?? p.status}
                      </span>
                      {p.failureReason && (
                        <p className="text-[10px] text-warning mt-0.5 max-w-50 truncate">
                          {p.failureReason}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-2 text-[11px] text-faint">
                      {p.sentAt
                        ? formatDate(p.sentAt, lang, "short")
                        : formatDate(p.createdAt, lang, "short")}
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
