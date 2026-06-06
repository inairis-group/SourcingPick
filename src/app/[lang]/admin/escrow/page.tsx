import { notFound } from "next/navigation";
import {AdminScope, EscrowStatus } from "@prisma/client";
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
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/escrow">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.escrow.title };
}

const ESCROW_TONE: Record<EscrowStatus, string> = {
  INITIATED: "bg-subtle text-muted border-line",
  FUNDED: "bg-info-soft text-info border-info-edge",
  HELD: "bg-warning-soft text-warning border-warning-edge",
  RELEASED: "bg-success-soft text-success border-success-edge",
  REFUNDED: "bg-subtle text-faint border-line",
  DISPUTED: "bg-danger-soft text-danger border-danger-edge",
};

export default async function AdminEscrowPage({
  params,
}: PageProps<"/[lang]/admin/escrow">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.FINANCE);
  const dict = await getDictionary(lang);

  const [heldAgg, releasedAgg, disputedAgg, recent] = await Promise.all([
    prisma.escrowTransaction.aggregate({
      where: { status: EscrowStatus.HELD },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.escrowTransaction.aggregate({
      where: { status: EscrowStatus.RELEASED },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.escrowTransaction.aggregate({
      where: { status: EscrowStatus.DISPUTED },
      _sum: { amountCents: true },
      _count: true,
    }),
    prisma.escrowTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reference: true,
        amountCents: true,
        status: true,
        provider: true,
        providerRef: true,
        fundedAt: true,
        releasedAt: true,
        order: {
          select: {
            reference: true,
            clientOrg: { select: { displayName: true } },
            factoryOrg: { select: { displayName: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.escrow.eyebrow}
        title={dict.admin.escrow.title}
        description={dict.admin.escrow.description}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <KpiCard
          label={dict.admin.escrow.kpiHeld}
          value={formatEUR((heldAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${heldAgg._count}`}
          tone="warning"
        />
        <KpiCard
          label={dict.admin.escrow.kpiReleased}
          value={formatEUR((releasedAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${releasedAgg._count}`}
          tone="success"
        />
        <KpiCard
          label={dict.admin.escrow.kpiDisputed}
          value={formatEUR((disputedAgg._sum.amountCents ?? 0) / 100, lang)}
          hint={`${disputedAgg._count}`}
          tone={disputedAgg._count > 0 ? "danger" : "neutral"}
        />
      </div>

      <DashboardSection title={dict.admin.escrow.ledgerTitle}>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.escrow.colReference}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.escrow.colOrder}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.escrow.colParties}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.escrow.colAmount}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.escrow.colStatus}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.escrow.colProvider}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.escrow.colReleased}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.escrow.colActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-faint">
                    {dict.admin.escrow.empty}
                  </td>
                </tr>
              ) : (
                recent.map((e) => (
                  <tr key={e.id} className="hover:bg-subtle/40">
                    <td className="px-5 py-2 text-xs font-mono">{e.reference}</td>
                    <td className="px-5 py-2 text-xs font-mono text-muted">
                      {e.order.reference}
                    </td>
                    <td className="px-5 py-2 text-xs text-fg">
                      {e.order.clientOrg.displayName}
                      <span className="text-faint"> → </span>
                      {e.order.factoryOrg.displayName}
                    </td>
                    <td className="px-5 py-2 text-sm font-semibold text-headline text-end">
                      {formatEUR(e.amountCents / 100, lang)}
                    </td>
                    <td className="px-5 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                          ESCROW_TONE[e.status],
                        )}
                      >
                        {dict.admin.escrow.statuses[e.status]}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-[11px] text-muted font-mono">
                      {e.provider}
                      {e.providerRef && (
                        <span className="ms-1 text-faint">
                          {e.providerRef.slice(0, 14)}…
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-[11px] text-faint">
                      {e.releasedAt
                        ? formatDate(e.releasedAt, lang, "short")
                        : e.fundedAt
                          ? formatDate(e.fundedAt, lang, "short")
                          : "—"}
                    </td>
                    <td className="px-5 py-2 text-xs">
                      {e.status === EscrowStatus.DISPUTED ? (
                        <Link
                          href={`/${lang}/admin/disputes`}
                          variant="muted"
                          className="text-link hover:text-link-hover"
                        >
                          {dict.admin.escrow.viewDisputeCta} →
                        </Link>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
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
