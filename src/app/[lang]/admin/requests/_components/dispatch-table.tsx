"use client";

import { useMemo, useState, useTransition } from "react";
import { SourcingStatus, type Category, type SourcingRegion } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { FormError } from "@/components/ui/form-error";
import { assignAgentAction } from "@/lib/admin/dispatch-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate, formatEUR, formatNumber } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import { PreTenderActions } from "./pre-tender-actions";

export type DispatchRequest = {
  id: string;
  reference: string;
  title: string;
  category: Category;
  quantity: number;
  budgetCents: number | null;
  deadline: Date;
  createdAt: Date;
  assignedAt: Date | null;
  sourcingRegion: SourcingRegion;
  status: SourcingStatus;
  agentId: string | null;
  preTenderApprovedAt: Date | null;
  preTenderRejectedAt: Date | null;
  preTenderRejectionReason: string | null;
  clientOrg: { displayName: string; country: string };
  agent: { id: string; firstName: string; lastName: string } | null;
};

export type AgentOption = {
  id: string;
  name: string;
  email: string;
  subRole: string;
  activeLoad: number;
  maxLoad: number;
};

type Filter = "all" | "unassigned" | "assigned";

const FILTERS: Filter[] = ["unassigned", "assigned", "all"];

export function DispatchTable({
  requests,
  agents,
}: {
  requests: DispatchRequest[];
  agents: AgentOption[];
}) {
  const dict = useDictionary();
  const locale = useLocale();
  const [filter, setFilter] = useState<Filter>("unassigned");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectedAgent, setSelectedAgent] = useState<Record<string, string>>({});

  const counts = useMemo(() => {
    const c = { all: requests.length, unassigned: 0, assigned: 0 };
    for (const r of requests) {
      if (r.status === SourcingStatus.REQUEST_RECEIVED) c.unassigned++;
      if (r.status === SourcingStatus.ASSIGNED) c.assigned++;
    }
    return c;
  }, [requests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (filter === "unassigned" && r.status !== SourcingStatus.REQUEST_RECEIVED)
        return false;
      if (filter === "assigned" && r.status !== SourcingStatus.ASSIGNED)
        return false;
      if (q) {
        const hay = `${r.reference} ${r.title} ${r.clientOrg.displayName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, filter, query]);

  const assign = (requestId: string) => {
    const agentId = selectedAgent[requestId];
    if (!agentId) {
      setError(dict.admin.dispatch.errorPickAgent);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await assignAgentAction(requestId, agentId);
      if (!result.ok) setError(result.error);
    });
  };

  const filterLabels: Record<Filter, string> = {
    all: dict.admin.dispatch.filterAll,
    unassigned: dict.admin.dispatch.filterUnassigned,
    assigned: dict.admin.dispatch.filterAssigned,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.admin.dispatch.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.admin.dispatch.title}
        </h1>
        <p className="text-sm text-muted">{dict.admin.dispatch.description}</p>
      </header>

      {error && <FormError className="mb-4">{error}</FormError>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap",
                "transition-colors duration-fast",
                filter === key
                  ? "bg-action text-on-action"
                  : "bg-subtle text-muted hover:text-fg",
              )}
            >
              <span>{filterLabels[key]}</span>
              <span
                className={cn(
                  "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-mono",
                  filter === key ? "bg-on-action/20" : "bg-line",
                )}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <Input
            inputSize="sm"
            placeholder={dict.admin.dispatch.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftSlot={
              <HugeiconsIcon icon={Search01Icon} size={14} strokeWidth={1.5} />
            }
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center text-sm text-muted">
          {dict.admin.dispatch.empty}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-line bg-surface p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <Link
                    href={`/${locale}/admin/requests/${r.id}`}
                    variant="muted"
                    className="block group"
                  >
                    <p className="text-xs font-mono uppercase tracking-wide text-faint group-hover:text-brand-700 transition-colors duration-fast">
                      {r.reference}
                    </p>
                    <h3 className="text-base font-semibold text-headline group-hover:text-brand-700 transition-colors duration-fast">
                      {r.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted mt-1">
                    {r.clientOrg.displayName} · {r.clientOrg.country}
                  </p>
                </div>
                <RequestMeta r={r} dict={dict} locale={locale} />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 sm:gap-3 pt-3 border-t border-line-subtle">
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-medium uppercase tracking-wide text-faint mb-1 block">
                    {r.agent
                      ? dict.admin.dispatch.currentAgent.replace(
                          "{name}",
                          `${r.agent.firstName} ${r.agent.lastName}`,
                        )
                      : dict.admin.dispatch.pickAgent}
                  </label>
                  <Select
                    size="sm"
                    value={selectedAgent[r.id] ?? r.agent?.id ?? ""}
                    onChange={(v) =>
                      setSelectedAgent((prev) => ({
                        ...prev,
                        [r.id]: v,
                      }))
                    }
                    placeholder={dict.admin.dispatch.agentPlaceholder}
                    options={agents.map((a) => ({
                      value: a.id,
                      label: `${a.name} (${a.activeLoad}/${a.maxLoad} ${dict.admin.dispatch.loadSuffix})`,
                    }))}
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => assign(r.id)}
                  loading={pending}
                  disabled={
                    !selectedAgent[r.id] ||
                    selectedAgent[r.id] === r.agent?.id
                  }
                >
                  {r.agent
                    ? dict.admin.dispatch.reassign
                    : dict.admin.dispatch.assign}
                </Button>
              </div>

              <PreTenderActions
                requestId={r.id}
                approvedAt={r.preTenderApprovedAt}
                rejectedAt={r.preTenderRejectedAt}
                rejectionReason={r.preTenderRejectionReason}
                hasAgent={Boolean(r.agent)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestMeta({
  r,
  dict,
  locale,
}: {
  r: DispatchRequest;
  dict: ReturnType<typeof useDictionary>;
  locale: string;
}) {
  return (
    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      <span>{dict.categories[r.category]}</span>
      <span>{formatNumber(r.quantity, locale as never)} units</span>
      {r.budgetCents && (
        <span>{formatEUR(r.budgetCents / 100, locale as never)}</span>
      )}
      <span>
        {dict.client.requests.deadlineShort} {formatDate(r.deadline, locale as never, "short")}
      </span>
      <span className="font-medium">{dict.client.requests.regions[r.sourcingRegion]}</span>
    </div>
  );
}
