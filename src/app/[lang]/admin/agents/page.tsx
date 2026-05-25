import { notFound } from "next/navigation";
import { OrderStatus, Role, SourcingStatus } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  DashboardSection,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/agents">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.agents.title };
}

const ACTIVE_REQ_STATUSES = [
  SourcingStatus.REQUEST_RECEIVED,
  SourcingStatus.ASSIGNED,
  SourcingStatus.QUOTE_SENT,
];

export default async function AdminAgentsPage({
  params,
}: PageProps<"/[lang]/admin/agents">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireRole(Role.ADMIN);
  const dict = await getDictionary(lang);

  const agents = await prisma.user.findMany({
    where: { role: Role.AGENT, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });

  const [activeReqByAgent, completedOrdersByAgent] = await Promise.all([
    prisma.sourcingRequest.groupBy({
      by: ["agentId"],
      where: {
        agentId: { in: agents.map((a) => a.id) },
        status: { in: ACTIVE_REQ_STATUSES },
      },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ["agentId"],
      where: {
        agentId: { in: agents.map((a) => a.id) },
        deletedAt: null,
        status: OrderStatus.COMPLETED,
      },
      _count: true,
      _sum: { commissionCents: true },
    }),
  ]);

  const rows = agents.map((a) => {
    const active =
      activeReqByAgent.find((g) => g.agentId === a.id)?._count ?? 0;
    const completed =
      completedOrdersByAgent.find((g) => g.agentId === a.id)?._count ?? 0;
    const commissionCents =
      completedOrdersByAgent.find((g) => g.agentId === a.id)?._sum
        .commissionCents ?? 0;
    return { ...a, active, completed, commissionCents };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.agents.eyebrow}
        title={dict.admin.agents.title}
        description={dict.admin.agents.description}
      />

      <DashboardSection title={dict.admin.agents.tableTitle}>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.agents.colName}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.agents.colEmail}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.agents.colActive}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.agents.colCompleted}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.agents.colCommission}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.agents.colLastLogin}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-faint">
                    {dict.admin.agents.empty}
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id} className="hover:bg-subtle/40">
                    <td className="px-5 py-2 text-sm font-medium text-fg">
                      {a.firstName} {a.lastName}
                    </td>
                    <td className="px-5 py-2 text-xs font-mono text-muted">
                      {a.email}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-2 text-sm font-semibold text-end",
                        a.active > 10
                          ? "text-warning"
                          : a.active > 0
                            ? "text-headline"
                            : "text-muted",
                      )}
                    >
                      {a.active}
                    </td>
                    <td className="px-5 py-2 text-sm text-fg text-end">
                      {a.completed}
                    </td>
                    <td className="px-5 py-2 text-sm font-medium text-headline text-end">
                      {formatEUR(a.commissionCents / 100, lang)}
                    </td>
                    <td className="px-5 py-2 text-[11px] text-faint">
                      {a.lastSeenAt
                        ? formatDate(a.lastSeenAt, lang, "short")
                        : "—"}
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
