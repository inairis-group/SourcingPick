import { notFound } from "next/navigation";
import {AdminScope, KycStatus, OrgType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { requireAdminScope } from "@/lib/permissions/admin-scopes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { countryNameFor } from "@/lib/countries";
import {
  DashboardHeader,
  DashboardSection,
} from "@/components/dashboard/primitives";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/admin/organizations">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.admin.organizations.title };
}

const KYC_TONE: Record<KycStatus, string> = {
  PENDING: "bg-warning-soft text-warning border-warning-edge",
  VERIFIED: "bg-success-soft text-success border-success-edge",
  FLAGGED: "bg-warning-soft text-warning border-warning-edge",
  REJECTED: "bg-danger-soft text-danger border-danger-edge",
};

export default async function AdminOrganizationsPage({
  params,
  searchParams,
}: PageProps<"/[lang]/admin/organizations">) {
  const { lang } = await params;
  const search = await searchParams;
  if (!isLocale(lang)) notFound();
  await requireAdminScope(AdminScope.USERS);
  const dict = await getDictionary(lang);

  const typeFilter =
    typeof search?.type === "string" &&
    (search.type === "CLIENT" ||
      search.type === "FACTORY" ||
      search.type === "AGENT" ||
      search.type === "PLATFORM")
      ? (search.type as OrgType)
      : undefined;
  const queryFilter =
    typeof search?.q === "string" ? search.q.trim() : "";

  const orgs = await prisma.organization.findMany({
    where: {
      deletedAt: null,
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(queryFilter
        ? {
            OR: [
              { displayName: { contains: queryFilter, mode: "insensitive" } },
              { legalName: { contains: queryFilter, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      type: true,
      displayName: true,
      legalName: true,
      country: true,
      city: true,
      kycStatus: true,
      suspended: true,
      createdAt: true,
      _count: { select: { users: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        eyebrow={dict.admin.organizations.eyebrow}
        title={dict.admin.organizations.title}
        description={dict.admin.organizations.description}
      />

      <form className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          type="text"
          name="q"
          defaultValue={queryFilter}
          placeholder={dict.admin.organizations.searchPlaceholder}
          className={cn(
            "h-9 px-3 text-sm rounded-sm border bg-surface text-fg placeholder:text-faint",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
            "min-w-65",
          )}
        />
        {(["CLIENT", "FACTORY", "AGENT", "PLATFORM"] as OrgType[]).map((t) => {
          const active = typeFilter === t;
          const sp = new URLSearchParams();
          if (queryFilter) sp.set("q", queryFilter);
          if (!active) sp.set("type", t);
          return (
            <a
              key={t}
              href={`?${sp.toString()}`}
              className={cn(
                "inline-flex items-center h-9 px-3 rounded-full border text-[11px] font-medium uppercase tracking-wide",
                active
                  ? "bg-action text-on-action border-action"
                  : "bg-surface text-fg border-line hover:bg-subtle",
              )}
            >
              {dict.admin.organizations.types[t]}
            </a>
          );
        })}
      </form>

      <DashboardSection title={dict.admin.organizations.tableTitle}>
        <div className="overflow-x-auto -mx-5 -my-5">
          <table className="w-full text-sm">
            <thead className="bg-subtle">
              <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.organizations.colName}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.organizations.colType}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.organizations.colLocation}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.organizations.colKyc}
                </th>
                <th className="px-5 py-2.5 font-medium text-end">
                  {dict.admin.organizations.colUsers}
                </th>
                <th className="px-5 py-2.5 font-medium">
                  {dict.admin.organizations.colCreated}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {orgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-faint">
                    {dict.admin.organizations.empty}
                  </td>
                </tr>
              ) : (
                orgs.map((o) => (
                  <tr
                    key={o.id}
                    className={cn(
                      "hover:bg-subtle/40",
                      o.suspended && "opacity-60",
                    )}
                  >
                    <td className="px-5 py-2">
                      <p className="text-sm font-medium text-fg">
                        {o.displayName}
                      </p>
                      <p className="text-[11px] text-faint">{o.legalName}</p>
                    </td>
                    <td className="px-5 py-2 text-xs text-fg">
                      {dict.admin.organizations.types[o.type]}
                    </td>
                    <td className="px-5 py-2 text-xs text-fg">
                      {o.city}, {countryNameFor(o.country, lang)}
                    </td>
                    <td className="px-5 py-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase",
                          KYC_TONE[o.kycStatus],
                        )}
                      >
                        {o.kycStatus}
                      </span>
                      {o.suspended && (
                        <span className="ms-1 inline-flex items-center h-5 px-2 rounded-full border text-[10px] font-medium uppercase bg-danger-soft text-danger border-danger-edge">
                          {dict.admin.organizations.suspended}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-sm text-fg text-end">
                      {o._count.users}
                    </td>
                    <td className="px-5 py-2 text-[11px] text-faint">
                      {formatDate(o.createdAt, lang, "short")}
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
