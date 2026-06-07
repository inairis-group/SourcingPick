"use client";

import { useMemo, useState } from "react";
import { KycStatus, type Category, type KycDocumentKind } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";
import { KycDrawer } from "./kyc-drawer";

export type QueueOrg = {
  id: string;
  displayName: string;
  legalName: string;
  country: string;
  city: string;
  kycStatus: KycStatus;
  kycVerifiedAt: Date | null;
  createdAt: Date;
  vatNumber: string | null;
  address: string;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  factoryProfile: {
    category: Category;
    capabilities: string[];
    languages: string[];
  } | null;
  kycDocuments: Array<{
    id: string;
    kind: KycDocumentKind;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: Date;
  }>;
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
};

const FILTERS: Array<{ key: "all" | "PENDING" | "FLAGGED" | "VERIFIED" | "REJECTED" }> = [
  { key: "all" },
  { key: "PENDING" },
  { key: "FLAGGED" },
  { key: "VERIFIED" },
  { key: "REJECTED" },
];

export function KycQueue({ orgs }: { orgs: QueueOrg[] }) {
  const dict = useDictionary();
  const locale = useLocale();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<KycStatus | "all", number> = {
      all: orgs.length,
      PENDING: 0,
      FLAGGED: 0,
      VERIFIED: 0,
      REJECTED: 0,
    };
    for (const o of orgs) c[o.kycStatus]++;
    return c;
  }, [orgs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orgs.filter((o) => {
      if (filter !== "all" && o.kycStatus !== filter) return false;
      if (q) {
        const hay = `${o.displayName} ${o.legalName} ${o.country} ${o.city} ${o.users[0]?.email ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orgs, filter, query]);

  const selected = orgs.find((o) => o.id === selectedId) ?? null;

  const filterLabels: Record<(typeof FILTERS)[number]["key"], string> = {
    all: dict.admin.kyc.filterAll,
    PENDING: dict.common.status.pending,
    FLAGGED: dict.common.status.flagged,
    VERIFIED: dict.common.status.verified,
    REJECTED: dict.common.status.rejected,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.admin.kyc.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.admin.kyc.title}
        </h1>
        <p className="text-sm text-muted">{dict.admin.kyc.description}</p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
          {FILTERS.map(({ key }) => (
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
                {counts[key === "all" ? "all" : (key as KycStatus)]}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <Input
            inputSize="sm"
            placeholder={dict.admin.kyc.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftSlot={
              <HugeiconsIcon icon={Search01Icon} size={14} strokeWidth={1.5} />
            }
          />
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface overflow-hidden">
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-line bg-subtle text-xs font-medium uppercase tracking-wide text-faint">
          <span>{dict.admin.kyc.colFactory}</span>
          <span>{dict.admin.kyc.colCategory}</span>
          <span>{dict.admin.kyc.colCountry}</span>
          <span>{dict.admin.kyc.colSubmitted}</span>
          <span className="text-end">{dict.admin.kyc.colStatus}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-muted">
            {dict.admin.kyc.empty}
          </div>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {filtered.map((org) => (
              <li key={org.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(org.id)}
                  className="w-full grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 md:gap-4 px-4 py-3 text-start hover:bg-subtle transition-colors duration-fast"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-fg">
                      {org.displayName}
                    </span>
                    <span className="text-xs text-faint truncate">
                      {org.users[0]?.email ?? "—"}
                    </span>
                  </div>
                  <span className="text-sm text-muted self-center">
                    {org.factoryProfile
                      ? dict.categories[org.factoryProfile.category]
                      : "—"}
                  </span>
                  <span className="text-sm text-muted self-center">
                    {org.city}, {org.country}
                  </span>
                  <span className="text-sm text-muted self-center">
                    {formatDate(org.createdAt, locale, "short")}
                  </span>
                  <span className="self-center md:justify-self-end">
                    <StatusBadge status={org.kycStatus} dict={dict} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <KycDrawer
        org={selected}
        open={selected !== null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

function StatusBadge({
  status,
  dict,
}: {
  status: KycStatus;
  dict: ReturnType<typeof useDictionary>;
}) {
  const map: Record<
    KycStatus,
    { label: string; classes: string }
  > = {
    PENDING: {
      label: dict.common.status.pending,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    FLAGGED: {
      label: dict.common.status.flagged,
      classes: "bg-warning-soft text-warning border-warning-edge",
    },
    VERIFIED: {
      label: dict.common.status.verified,
      classes: "bg-success-soft text-success border-success-edge",
    },
    REJECTED: {
      label: dict.common.status.rejected,
      classes: "bg-danger-soft text-danger border-danger-edge",
    },
  };
  const { label, classes } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-medium uppercase tracking-wide",
        classes,
      )}
    >
      {label}
    </span>
  );
}
