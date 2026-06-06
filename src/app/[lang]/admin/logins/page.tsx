import { notFound } from "next/navigation";
import {AdminScope } from "@prisma/client";
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

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/logins">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.logins.title };
}

export default async function AdminLoginsPage({
  params,
}: PageProps<"/[lang]/admin/logins">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.WEBHOOKS);
  const dict = await getDictionary(lang);

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const today = new Date(now.getTime() - day);
  const week = new Date(now.getTime() - 7 * day);

  const [
    todaySuccess,
    todayFailed,
    weekSuccess,
    weekFailed,
    recentEvents,
  ] = await Promise.all([
    prisma.auditLog.count({
      where: { action: "auth.login", createdAt: { gte: today } },
    }),
    prisma.auditLog.count({
      where: { action: "auth.login_failed", createdAt: { gte: today } },
    }),
    prisma.auditLog.count({
      where: { action: "auth.login", createdAt: { gte: week } },
    }),
    prisma.auditLog.count({
      where: { action: "auth.login_failed", createdAt: { gte: week } },
    }),
    prisma.auditLog.findMany({
      where: {
        action: { in: ["auth.login", "auth.login_failed", "auth.2fa_verified"] },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        actor: { select: { firstName: true, lastName: true, email: true, role: true } },
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.logins.eyebrow}
        title={dict.admin.logins.title}
        description={dict.admin.logins.description}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label={dict.admin.logins.kpiTodaySuccess}
          value={String(todaySuccess)}
          tone="success"
        />
        <KpiCard
          label={dict.admin.logins.kpiTodayFailed}
          value={String(todayFailed)}
          tone={todayFailed > 0 ? "warning" : "neutral"}
        />
        <KpiCard
          label={dict.admin.logins.kpiWeekSuccess}
          value={String(weekSuccess)}
        />
        <KpiCard
          label={dict.admin.logins.kpiWeekFailed}
          value={String(weekFailed)}
          tone={weekFailed > 5 ? "danger" : "neutral"}
        />
      </div>

      <DashboardSection title={dict.admin.logins.tableTitle}>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.logins.colTime}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.logins.colEvent}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.logins.colUser}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.logins.colIp}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.logins.colUa}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-faint">
                    {dict.admin.logins.empty}
                  </td>
                </tr>
              ) : (
                recentEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-subtle/40">
                    <td className="px-5 py-2 text-[11px] font-mono text-faint whitespace-nowrap">
                      {formatDate(e.createdAt, lang, "short")}
                    </td>
                    <td className="px-5 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                          e.action === "auth.login_failed"
                            ? "bg-danger-soft text-danger border-danger-edge"
                            : "bg-success-soft text-success border-success-edge",
                        )}
                      >
                        {e.action.replace("auth.", "")}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-xs text-fg">
                      {e.actor ? (
                        <>
                          {e.actor.firstName} {e.actor.lastName}
                          <span className="text-faint ms-1">
                            · {e.actor.email}
                          </span>
                        </>
                      ) : (
                        <span className="text-faint italic">
                          {dict.admin.logins.unknownUser}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-[11px] font-mono text-faint">
                      {e.ipAddress ?? "—"}
                    </td>
                    <td className="px-5 py-2 text-[11px] text-faint max-w-[300px] truncate">
                      {e.userAgent ?? "—"}
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
