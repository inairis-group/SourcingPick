"use client";

import { useMemo, useState } from "react";
import { Category, SourcingRegion } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { FactoryIcon, Search01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

export type FactoryRow = {
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
};

const CATEGORIES: Category[] = [
  Category.TEXTILE,
  Category.HOME,
  Category.STATIONERY,
  Category.COSMETICS,
  Category.FOOD,
  Category.ELECTRONICS,
  Category.METAL,
  Category.WOOD,
  Category.PLASTIC,
  Category.OTHER,
];

export function FactoryPool({
  factories,
  initialCategory,
  initialRegion,
}: {
  factories: FactoryRow[];
  initialCategory: Category | null;
  initialRegion: SourcingRegion | null;
}) {
  const dict = useDictionary();
  const [category, setCategory] = useState<Category | "all">(
    initialCategory ?? "all",
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return factories.filter((f) => {
      if (category !== "all" && f.profile.category !== category) return false;
      if (q) {
        const hay = `${f.displayName} ${f.country} ${f.city} ${f.profile.capabilities.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [factories, category, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {dict.agent.factories.eyebrow}
        </p>
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {dict.agent.factories.title}
        </h1>
        <p className="text-sm text-muted">
          {dict.agent.factories.description}
          {initialRegion && (
            <>
              {" "}
              {dict.agent.factories.contextHint.replace(
                "{region}",
                dict.client.requests.regions[initialRegion],
              )}
            </>
          )}
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
            label={dict.agent.factories.filterAll}
            count={factories.length}
          />
          {CATEGORIES.map((c) => {
            const count = factories.filter((f) => f.profile.category === c).length;
            if (count === 0) return null;
            return (
              <FilterChip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
                label={dict.categories[c]}
                count={count}
              />
            );
          })}
        </div>
        <div className="w-full sm:w-72">
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

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-12 text-center text-sm text-muted">
          {dict.agent.factories.empty}
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <li
              key={f.id}
              className="rounded-lg border border-line bg-surface p-4 flex flex-col gap-3"
            >
              <header className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <HugeiconsIcon icon={FactoryIcon} size={18} strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-headline truncate">
                      {f.displayName}
                    </p>
                    <p className="text-xs text-faint truncate">
                      {f.city}, {f.country}
                    </p>
                  </div>
                </div>
                {f.profile.rating > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-medium text-fg flex-shrink-0">
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={12}
                      strokeWidth={1.5}
                      className="text-warning"
                    />
                    {f.profile.rating.toFixed(1)}
                  </span>
                )}
              </header>

              <p className="text-xs uppercase tracking-wide text-faint font-medium">
                {dict.categories[f.profile.category]}
              </p>

              {f.profile.capabilities.length > 0 && (
                <p className="text-sm text-muted leading-snug line-clamp-2">
                  {f.profile.capabilities.join(" · ")}
                </p>
              )}

              <div className="mt-auto pt-2 border-t border-line-subtle flex items-center justify-between gap-2 text-xs text-faint">
                <span>
                  {f.profile.totalOrders} {dict.agent.factories.ordersSuffix}
                </span>
                {f.profile.languages.length > 0 && (
                  <span className="font-mono uppercase">
                    {f.profile.languages.slice(0, 3).join(" · ")}
                  </span>
                )}
              </div>

              {f.profile.certifications.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {f.profile.certifications.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center h-5 px-1.5 rounded-sm bg-success-soft text-success text-[10px] font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap",
        "transition-colors duration-fast",
        active
          ? "bg-action text-on-action"
          : "bg-subtle text-muted hover:text-fg",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-mono",
          active ? "bg-on-action/20" : "bg-line",
        )}
      >
        {count}
      </span>
    </button>
  );
}
