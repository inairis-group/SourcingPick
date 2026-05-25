import { notFound } from "next/navigation";
import { Role, SourcingStatus } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { prisma } from "@/lib/db/client";
import { requireRole } from "@/lib/permissions/guards";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/agent/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.agent.requests.title };
}

const SLA_HOURS = 24;

export default async function AgentRequestsPage({
  params,
}: PageProps<"/[lang]/agent/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const agent = await requireRole(Role.AGENT);
  const dict = await getDictionary(lang);

  const requests = await prisma.sourcingRequest.findMany({
    where: {
      agentId: agent.id,
      status: {
        notIn: [
          SourcingStatus.COMPLETED,
          SourcingStatus.CANCELLED,
        ],
      },
    },
    orderBy: [{ assignedAt: "desc" }],
    select: {
      id: true,
      reference: true,
      title: true,
      category: true,
      quantity: true,
      budgetCents: true,
      deadline: true,
      assignedAt: true,
      status: true,
      sourcingRegion: true,
      clientOrg: { select: { displayName: true, country: true } },
      _count: { select: { tenderInvitations: true, quotes: true } },
    },
  });

  const now = Date.now();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.agent.requests.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.agent.requests.title}
        </h1>
        <p className="text-sm text-muted">{dict.agent.requests.description}</p>
      </header>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-16 text-center">
          <p className="text-base font-medium text-headline mb-2">
            {dict.agent.requests.emptyTitle}
          </p>
          <p className="text-sm text-muted">{dict.agent.requests.emptyBody}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((r) => {
            const assignedMs = r.assignedAt?.getTime() ?? 0;
            const hoursElapsed = assignedMs ? (now - assignedMs) / 1000 / 60 / 60 : 0;
            const slaState =
              hoursElapsed > SLA_HOURS
                ? "overdue"
                : hoursElapsed > SLA_HOURS * 0.75
                  ? "warning"
                  : "ok";

            return (
              <li key={r.id}>
                <Link
                  href={`/${lang}/agent/requests/${r.id}`}
                  variant="muted"
                  className="block rounded-lg border border-line bg-surface p-4 hover:bg-subtle transition-colors duration-fast"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-xs font-mono uppercase tracking-wide text-faint">
                        {r.reference}
                      </p>
                      <h3 className="text-base font-semibold text-headline">
                        {r.title}
                      </h3>
                      <p className="text-xs text-muted mt-1">
                        {r.clientOrg.displayName} · {r.clientOrg.country}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <SlaPill
                        state={slaState}
                        hours={hoursElapsed}
                        dict={dict}
                      />
                      <StatusPill status={r.status} dict={dict} />
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-line-subtle text-xs text-muted">
                    <span>{dict.categories[r.category]}</span>
                    <span>{formatNumber(r.quantity, lang)} units</span>
                    {r.budgetCents && <span>{formatEUR(r.budgetCents / 100, lang)}</span>}
                    <span>
                      {dict.client.requests.deadlineShort}{" "}
                      {formatDate(r.deadline, lang, "short")}
                    </span>
                    <span className="font-medium">
                      {dict.client.requests.regions[r.sourcingRegion]}
                    </span>
                    <span>
                      {dict.client.requests.tenderInvitationsCount.replace(
                        "{n}",
                        String(r._count.tenderInvitations),
                      )}
                    </span>
                    <span>
                      {dict.client.requests.quotesCount.replace(
                        "{n}",
                        String(r._count.quotes),
                      )}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatusPill({
  status,
  dict,
}: {
  status: SourcingStatus;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const tone =
    status === SourcingStatus.ASSIGNED
      ? "info"
      : status === SourcingStatus.QUOTE_REJECTED
        ? "danger"
        : "warn";
  const toneClasses = {
    info: "bg-info-soft text-info border-info-edge",
    warn: "bg-warning-soft text-warning border-warning-edge",
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

function SlaPill({
  state,
  hours,
  dict,
}: {
  state: "ok" | "warning" | "overdue";
  hours: number;
  dict: Awaited<ReturnType<typeof getDictionary>>;
}) {
  const tone =
    state === "ok" ? "success" : state === "warning" ? "warn" : "danger";
  const toneClasses = {
    success: "bg-success-soft text-success border-success-edge",
    warn: "bg-warning-soft text-warning border-warning-edge",
    danger: "bg-danger-soft text-danger border-danger-edge",
  } as const;
  const label =
    state === "overdue"
      ? dict.agent.requests.slaOverdue.replace("{h}", Math.round(hours).toString())
      : state === "warning"
        ? dict.agent.requests.slaApproaching.replace("{h}", Math.round(hours).toString())
        : dict.agent.requests.slaOk.replace("{h}", Math.round(hours).toString());
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-6 px-2 rounded-full border text-[11px] font-medium whitespace-nowrap",
        toneClasses[tone],
      )}
    >
      <HugeiconsIcon icon={Clock01Icon} size={11} strokeWidth={2} />
      {label}
    </span>
  );
}
