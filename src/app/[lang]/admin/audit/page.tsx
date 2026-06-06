import { notFound } from "next/navigation";
import {AdminScope, AuditLevel } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { DashboardHeader } from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/audit">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.audit.title };
}

const LEVEL_TONE: Record<AuditLevel, string> = {
  INFO: "bg-subtle text-muted border-line",
  WARN: "bg-warning-soft text-warning border-warning-edge",
  ALERT: "bg-danger-soft text-danger border-danger-edge",
};

const PAGE_SIZE = 100;

export default async function AdminAuditPage({
  params,
  searchParams,
}: PageProps<"/[lang]/admin/audit">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.AUDIT);
  const dict = await getDictionary(lang);

  const levelFilter =
    typeof search?.level === "string" &&
    (search.level === "INFO" ||
      search.level === "WARN" ||
      search.level === "ALERT")
      ? (search.level as AuditLevel)
      : undefined;
  const actionFilter =
    typeof search?.action === "string" ? search.action.trim() : "";

  const entries = await prisma.auditLog.findMany({
    where: {
      ...(levelFilter ? { level: levelFilter } : {}),
      ...(actionFilter
        ? { action: { contains: actionFilter, mode: "insensitive" } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    select: {
      id: true,
      action: true,
      level: true,
      targetType: true,
      targetId: true,
      payload: true,
      ipAddress: true,
      createdAt: true,
      actor: {
        select: { firstName: true, lastName: true, role: true, email: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.audit.eyebrow}
        title={dict.admin.audit.title}
        description={dict.admin.audit.description}
      />

      <form className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          type="text"
          name="action"
          defaultValue={actionFilter}
          placeholder={dict.admin.audit.actionPlaceholder}
          className={cn(
            "h-9 px-3 text-sm rounded-sm border bg-surface text-fg placeholder:text-faint",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
            "min-w-[240px]",
          )}
        />
        {(["INFO", "WARN", "ALERT"] as AuditLevel[]).map((l) => {
          const active = levelFilter === l;
          const sp = new URLSearchParams();
          if (actionFilter) sp.set("action", actionFilter);
          if (!active) sp.set("level", l);
          const href = `?${sp.toString()}`;
          return (
            <a
              key={l}
              href={href}
              className={cn(
                "inline-flex items-center h-9 px-3 rounded-full border text-[11px] font-medium uppercase tracking-wide",
                active
                  ? LEVEL_TONE[l]
                  : "bg-surface text-fg border-line hover:bg-subtle",
              )}
            >
              {dict.admin.audit.levels[l]}
            </a>
          );
        })}
      </form>

      <div className="rounded-lg border border-line bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-subtle">
            <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
              <th className="px-4 py-2.5 font-medium">
                {dict.admin.audit.colTime}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {dict.admin.audit.colLevel}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {dict.admin.audit.colAction}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {dict.admin.audit.colActor}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {dict.admin.audit.colTarget}
              </th>
              <th className="px-4 py-2.5 font-medium">
                {dict.admin.audit.colIp}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-subtle">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-faint">
                  {dict.admin.audit.empty}
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="hover:bg-subtle/40">
                  <td className="px-4 py-2 text-[11px] font-mono text-faint whitespace-nowrap">
                    {formatDate(e.createdAt, lang, "short")}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={cn(
                        "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                        LEVEL_TONE[e.level],
                      )}
                    >
                      {dict.admin.audit.levels[e.level]}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-fg">
                    {e.action}
                  </td>
                  <td className="px-4 py-2 text-xs text-fg">
                    {e.actor ? (
                      <>
                        {e.actor.firstName} {e.actor.lastName}
                        <span className="text-faint ms-1">
                          · {e.actor.role}
                        </span>
                      </>
                    ) : (
                      <span className="text-faint italic">
                        {dict.admin.dashboard.systemActor}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-[11px] text-muted">
                    {e.targetType ? (
                      <>
                        <span className="text-faint">{e.targetType}</span>
                        {e.targetId && (
                          <span className="font-mono ms-1">
                            {e.targetId.slice(0, 8)}…
                          </span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2 text-[11px] text-faint font-mono">
                    {e.ipAddress ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {entries.length === PAGE_SIZE && (
        <p className="text-xs text-faint text-center mt-3">
          {dict.admin.audit.truncated.replace("{n}", String(PAGE_SIZE))}
        </p>
      )}
    </div>
  );
}
