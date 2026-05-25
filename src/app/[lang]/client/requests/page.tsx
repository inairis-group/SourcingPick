import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/client/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.client.requests.title };
}

export default async function ClientRequestsPage({
  params,
}: PageProps<"/[lang]/client/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const user = await requireRole(Role.CLIENT);
  const dict = await getDictionary(lang);

  const requests = await prisma.sourcingRequest.findMany({
    where: { clientOrgId: user.organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      reference: true,
      title: true,
      category: true,
      quantity: true,
      budgetCents: true,
      status: true,
      deadline: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col items-start md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {dict.client.requests.eyebrow}
          </p>
          <h1 className="text-2xl font-bold text-headline tracking-tight">
            {dict.client.requests.title}
          </h1>
          <p className="text-sm text-muted">{dict.client.requests.description}</p>
        </div>
        <Link
          href={`/${lang}/client/requests/new`}
          className={`w-full md:w-auto ${cn(buttonClass({ variant: "primary", size: "md" }))}`}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={1.75} />
          <span className="ms-1.5">{dict.client.requests.newRequest}</span>
        </Link>
      </header>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-2">
            {dict.client.requests.emptyTitle}
          </p>
          <p className="text-sm text-muted mb-6 max-w-md mx-auto">
            {dict.client.requests.emptyBody}
          </p>
          <Link
            href={`/${lang}/client/requests/new`}
            className={cn(buttonClass({ variant: "primary", size: "md" }))}
          >
            {dict.client.requests.newRequest}
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: card list. Tables don't survive narrow widths cleanly. */}
          <ul className="md:hidden flex flex-col gap-3">
            {requests.map((req) => (
              <li key={req.id}>
                <Link
                  href={`/${lang}/client/requests/${req.id}`}
                  variant="muted"
                  className="block rounded-lg border border-line bg-surface p-4 hover:bg-subtle transition-colors duration-fast"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono uppercase tracking-wide text-faint">
                        {req.reference}
                      </p>
                      <p className="text-sm font-semibold text-headline">
                        {req.title}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {dict.categories[req.category]} ·{" "}
                        {formatNumber(req.quantity, lang)}
                      </p>
                    </div>
                    <RequestStatusBadge status={req.status} dict={dict} />
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-line-subtle text-[11px] text-faint">
                    <span>{formatDate(req.createdAt, lang, "short")}</span>
                    <span>
                      {dict.client.requests.deadlineShort}{" "}
                      {formatDate(req.deadline, lang, "short")}
                    </span>
                    {req.budgetCents && (
                      <span className="text-fg font-medium">
                        {formatEUR(req.budgetCents / 100, lang)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: actual <table> so columns measure naturally and stay
              aligned across rows. */}
          <div className="hidden md:block rounded-lg border border-line bg-surface overflow-hidden">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col style={{ width: "26%" }} />
                <col />
                <col style={{ width: "13%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "16%" }} />
              </colgroup>
              <thead className="bg-subtle">
                <tr className="text-start text-[11px] uppercase tracking-wide text-faint">
                  <th className="px-4 py-2.5 font-medium">
                    {dict.client.requests.colReference}
                  </th>
                  <th className="px-4 py-2.5 font-medium">
                    {dict.client.requests.colTitle}
                  </th>
                  <th className="px-4 py-2.5 font-medium">
                    {dict.client.requests.colCategory}
                  </th>
                  <th className="px-4 py-2.5 font-medium text-end">
                    {dict.client.requests.colQuantity}
                  </th>
                  <th className="px-4 py-2.5 font-medium text-end">
                    {dict.client.requests.colBudget}
                  </th>
                  <th className="px-4 py-2.5 font-medium text-end">
                    {dict.client.requests.colStatus}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-subtle/40 transition-colors duration-fast cursor-pointer"
                  >
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={`/${lang}/client/requests/${req.id}`}
                        variant="muted"
                        className="flex flex-col"
                      >
                        <span className="text-sm font-mono text-headline">
                          {req.reference}
                        </span>
                        <span className="text-[11px] text-faint">
                          {formatDate(req.createdAt, lang, "short")} ·{" "}
                          {dict.client.requests.deadlineShort}{" "}
                          {formatDate(req.deadline, lang, "short")}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <Link
                        href={`/${lang}/client/requests/${req.id}`}
                        variant="muted"
                        className="block truncate text-sm text-fg"
                      >
                        {req.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-muted">
                      {dict.categories[req.category]}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm font-mono text-fg text-end whitespace-nowrap">
                      {formatNumber(req.quantity, lang)}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-muted text-end whitespace-nowrap">
                      {req.budgetCents
                        ? formatEUR(req.budgetCents / 100, lang)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 align-middle text-end">
                      <RequestStatusBadge status={req.status} dict={dict} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function RequestStatusBadge({
  status,
  dict,
}: {
  status: import("@prisma/client").SourcingStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const tone =
    status === "COMPLETED"
      ? "success"
      : status === "CANCELLED" || status === "QUOTE_REJECTED"
        ? "danger"
        : status === "REQUEST_RECEIVED"
          ? "info"
          : "warn";
  const toneClasses = {
    success: "bg-success-soft text-success border-success-edge",
    warn: "bg-warning-soft text-warning border-warning-edge",
    info: "bg-info-soft text-info border-info-edge",
    danger: "bg-danger-soft text-danger border-danger-edge",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap",
        toneClasses[tone],
      )}
    >
      {dict.client.requests.statuses[status]}
    </span>
  );
}
