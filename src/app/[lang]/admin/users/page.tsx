import { notFound } from "next/navigation";
import { AdminScope, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import {
  DashboardHeader,
  DashboardSection,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/users">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.users.title };
}

const ROLE_TONE: Record<Role, string> = {
  CLIENT: "bg-info-soft text-info border-info-edge",
  FACTORY: "bg-success-soft text-success border-success-edge",
  AGENT: "bg-warning-soft text-warning border-warning-edge",
  ADMIN: "bg-danger-soft text-danger border-danger-edge",
};

export default async function AdminUsersPage({
  params,
  searchParams,
}: PageProps<"/[lang]/admin/users">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.USERS);
  const dict = await getDictionary(lang);

  const roleFilter =
    typeof search?.role === "string" &&
    (Object.values(Role) as string[]).includes(search.role)
      ? (search.role as Role)
      : undefined;
  const queryFilter =
    typeof search?.q === "string" ? search.q.trim() : "";

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(queryFilter
        ? {
            OR: [
              { firstName: { contains: queryFilter, mode: "insensitive" } },
              { lastName: { contains: queryFilter, mode: "insensitive" } },
              { email: { contains: queryFilter, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      subRole: true,
      twoFactorEnabled: true,
      lastSeenAt: true,
      createdAt: true,
      organization: { select: { displayName: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.users.eyebrow}
        title={dict.admin.users.title}
        description={dict.admin.users.description}
      />

      <form className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          type="text"
          name="q"
          defaultValue={queryFilter}
          placeholder={dict.admin.users.searchPlaceholder}
          className={cn(
            "h-9 px-3 text-sm rounded-sm border bg-surface text-fg placeholder:text-faint",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
            "min-w-65", 
          )}
        />
        {(Object.values(Role) as Role[]).map((r) => {
          const active = roleFilter === r;
          const sp = new URLSearchParams();
          if (queryFilter) sp.set("q", queryFilter);
          if (!active) sp.set("role", r);
          return (
            <a
              key={r}
              href={`?${sp.toString()}`}
              className={cn(
                "inline-flex items-center h-9 px-3 rounded-full border text-[11px] font-medium uppercase tracking-wide",
                active
                  ? "bg-action text-on-action border-action"
                  : "bg-surface text-fg border-line hover:bg-subtle",
              )}
            >
              {dict.common.roles[
                r.toLowerCase() as "client" | "factory" | "agent" | "admin"
              ]}
            </a>
          );
        })}
      </form>

      <DashboardSection title={dict.admin.users.tableTitle}>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.users.colName}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.users.colEmail}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.users.colRole}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.users.colOrg}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.users.col2fa}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.users.colLastLogin}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-faint">
                    {dict.admin.users.empty}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-subtle/40">
                    <td className="px-5 py-2">
                      <a
                        href={`/${lang}/admin/users/${u.id}`}
                        className="text-sm font-medium text-fg hover:text-link"
                      >
                        {u.firstName} {u.lastName}
                      </a>
                      <p className="text-[11px] text-faint">{u.subRole}</p>
                    </td>
                    <td className="px-5 py-2 text-xs font-mono text-muted">
                      <p>{u.email}</p>
                      {u.phone && (
                        <p className="text-faint">{u.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                          ROLE_TONE[u.role],
                        )}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-2 text-xs text-fg">
                      {u.organization.displayName}
                    </td>
                    <td className="px-5 py-2 text-[11px]">
                      {u.twoFactorEnabled ? (
                        <span className="text-success font-medium">✓</span>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-[11px] text-faint">
                      {u.lastSeenAt
                        ? formatDate(u.lastSeenAt, lang, "short")
                        : dict.admin.users.neverLoggedIn}
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
