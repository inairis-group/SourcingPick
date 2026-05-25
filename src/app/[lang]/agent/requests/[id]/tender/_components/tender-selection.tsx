"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Category,
  type SourcingRegion,
} from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  FactoryIcon,
  Search01Icon,
  StarIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { Link } from "@/components/ui/link";
import { sendTenderInvitationsAction } from "@/lib/sourcing/tender-actions";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

type FactoryRow = {
  id: string;
  displayName: string;
  country: string;
  city: string;
  profile: {
    category: Category;
    capabilities: string[];
    languages: string[];
    rating: number;
    totalOrders: number;
    certifications: string[];
  };
  alreadyInvited: boolean;
};

const MAX_INVITATIONS = 5;

export function TenderSelection({
  request,
  factories,
}: {
  request: {
    id: string;
    reference: string;
    title: string;
    category: Category;
    sourcingRegion: SourcingRegion;
  };
  factories: FactoryRow[];
}) {
  const dict = useDictionary();
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [matchOnly, setMatchOnly] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return factories.filter((f) => {
      if (matchOnly && f.profile.category !== request.category) return false;
      if (q) {
        const hay = `${f.displayName} ${f.country} ${f.city} ${f.profile.capabilities.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [factories, query, matchOnly, request.category]);

  const toggle = (id: string) => {
    setError(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_INVITATIONS) {
          setError(
            dict.tender.errorMaxInvitations.replace("{n}", String(MAX_INVITATIONS)),
          );
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const send = () => {
    if (selected.size < 1) {
      setError(dict.tender.errorMinSelection);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await sendTenderInvitationsAction(
        request.id,
        Array.from(selected),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/${locale}/agent/requests/${request.id}`);
    });
  };

  const matchCount = factories.filter(
    (f) => f.profile.category === request.category,
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/${locale}/agent/requests/${request.id}`}
        variant="muted"
        className="text-sm mb-4 inline-flex items-center gap-1"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.5} />
        {dict.tender.backToRequest}
      </Link>

      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-mono uppercase tracking-wide text-faint">
          {request.reference}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.tender.selectFactoriesTitle}
        </h1>
        <p className="text-sm text-muted">
          {dict.tender.selectFactoriesDescription
            .replace("{title}", request.title)
            .replace("{n}", String(MAX_INVITATIONS))}
        </p>
      </header>

      {error && <FormError className="mb-4">{error}</FormError>}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={matchOnly}
            onChange={(e) => setMatchOnly(e.target.checked)}
            className="h-4 w-4 rounded border-line-strong text-action focus:ring-2 focus:ring-focus"
          />
          <span className="text-sm text-fg">
            {dict.tender.matchOnly.replace(
              "{category}",
              dict.categories[request.category],
            )}
            <span className="text-faint"> ({matchCount})</span>
          </span>
        </label>
        <div className="sm:ms-auto w-full sm:w-72">
          <Input
            inputSize="sm"
            placeholder={dict.agent.factories.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftSlot={
              <HugeiconsIcon icon={Search01Icon} size={14} strokeWidth={1.5} />
            }
          />
        </div>
      </div>

      <p className="text-xs text-faint mb-3">
        {dict.tender.selectedCount
          .replace("{n}", String(selected.size))
          .replace("{max}", String(MAX_INVITATIONS))}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center text-sm text-muted">
          {dict.agent.factories.empty}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((f) => {
            const isSelected = selected.has(f.id);
            const isMatch = f.profile.category === request.category;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => !f.alreadyInvited && toggle(f.id)}
                  disabled={f.alreadyInvited}
                  className={cn(
                    "w-full text-start rounded-lg border p-4 flex items-start gap-3",
                    "transition-colors duration-fast",
                    f.alreadyInvited
                      ? "border-line bg-subtle opacity-60 cursor-not-allowed"
                      : isSelected
                        ? "border-action bg-action/5"
                        : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-sm border mt-0.5",
                      isSelected
                        ? "bg-action border-action"
                        : "border-line-strong bg-surface",
                    )}
                  >
                    {isSelected && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={12}
                        strokeWidth={2.5}
                        className="text-on-action"
                      />
                    )}
                  </span>

                  <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <HugeiconsIcon icon={FactoryIcon} size={18} strokeWidth={1.5} />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-headline truncate">
                        {f.displayName}
                      </p>
                      {f.profile.rating > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-fg shrink-0">
                          <HugeiconsIcon
                            icon={StarIcon}
                            size={11}
                            strokeWidth={1.5}
                            className="text-warning"
                          />
                          {f.profile.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-faint">
                      {f.city}, {f.country} · {dict.categories[f.profile.category]}
                      {isMatch && (
                        <span className="ms-1.5 text-success">
                          · {dict.tender.matchedTag}
                        </span>
                      )}
                    </p>
                    {f.profile.capabilities.length > 0 && (
                      <p className="text-xs text-muted mt-1 line-clamp-1">
                        {f.profile.capabilities.join(" · ")}
                      </p>
                    )}
                    {f.alreadyInvited && (
                      <p className="text-xs text-faint italic mt-1">
                        {dict.tender.alreadyInvited}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="sticky bottom-0 inset-x-0 mt-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-page/95 backdrop-blur-md border-t border-line">
        <div className="mx-auto max-w-7xl flex items-center justify-end gap-3">
          <Link
            href={`/${locale}/agent/requests/${request.id}`}
            variant="muted"
            className="text-sm"
          >
            {dict.common.actions.cancel}
          </Link>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={send}
            disabled={selected.size === 0}
            loading={pending}
          >
            {dict.tender.sendInvitations.replace("{n}", String(selected.size))}
          </Button>
        </div>
      </div>
    </div>
  );
}
