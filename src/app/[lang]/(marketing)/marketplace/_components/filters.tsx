"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Category, MarketplaceCondition } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useDictionary } from "@/lib/i18n/client-provider";

const CATEGORIES = Object.values(Category);
const CONDITIONS = Object.values(MarketplaceCondition);

/**
 * Public marketplace filters. Identical UX to the client-side filters but
 * targets the public `/marketplace` route (no `/client/` prefix), so
 * anonymous browsing stays inside the marketing layout.
 */
export function MarketplaceFilters({
  lang,
  category,
  condition,
  deals,
  query,
}: {
  lang: string;
  category?: Category;
  condition?: MarketplaceCondition;
  deals?: boolean;
  query: string;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const params = useSearchParams();
  const [draftQuery, setDraftQuery] = useState(query);

  const buildHref = (next: {
    q?: string;
    category?: string;
    condition?: string;
    deals?: boolean;
  }) => {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category) sp.set("category", next.category);
      else sp.delete("category");
    }
    if (next.condition !== undefined) {
      if (next.condition) sp.set("condition", next.condition);
      else sp.delete("condition");
    }
    if (next.deals !== undefined) {
      if (next.deals) sp.set("deals", "1");
      else sp.delete("deals");
    }
    const qs = sp.toString();
    return `/${lang}/marketplace${qs ? `?${qs}` : ""}`;
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildHref({ q: draftQuery }));
  };

  return (
    <MarketplaceFilterBar
      dict={dict}
      categories={CATEGORIES}
      conditions={CONDITIONS}
      category={category}
      condition={condition}
      deals={deals}
      draftQuery={draftQuery}
      onDraftQueryChange={setDraftQuery}
      onSearch={onSearch}
      onCategoryChange={(v) => router.push(buildHref({ category: v }))}
      onConditionChange={(v) => router.push(buildHref({ condition: v }))}
      onDealsChange={(v) => router.push(buildHref({ deals: v }))}
    />
  );
}

/**
 * Shared dropdown filter bar — search input + Category / Condition / Deals
 * selects. The public and client filter wrappers differ only in their URL
 * prefix, so the visual + interaction layer lives here.
 */
export function MarketplaceFilterBar({
  dict,
  categories,
  conditions,
  category,
  condition,
  deals,
  draftQuery,
  onDraftQueryChange,
  onSearch,
  onCategoryChange,
  onConditionChange,
  onDealsChange,
}: {
  dict: ReturnType<typeof useDictionary>;
  categories: Category[];
  conditions: MarketplaceCondition[];
  category?: Category;
  condition?: MarketplaceCondition;
  deals?: boolean;
  draftQuery: string;
  onDraftQueryChange: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onCategoryChange: (v: string) => void;
  onConditionChange: (v: string) => void;
  onDealsChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <form onSubmit={onSearch} className="flex-1 min-w-0">
        <Input
          value={draftQuery}
          onChange={(e) => onDraftQueryChange(e.target.value)}
          placeholder={dict.client.marketplace.searchPlaceholder}
        />
      </form>

      <div className="flex items-center gap-2">
        <Select
          size="sm"
          className="min-w-36"
          value={category ?? ""}
          onChange={onCategoryChange}
          options={[
            { value: "", label: dict.client.marketplace.allCategories },
            ...categories.map((c) => ({ value: c, label: dict.categories[c] })),
          ]}
        />
        <Select
          size="sm"
          className="min-w-36"
          value={condition ?? ""}
          onChange={onConditionChange}
          options={[
            { value: "", label: dict.client.marketplace.allConditions },
            ...conditions.map((c) => ({
              value: c,
              label: dict.factory.catalogue.conditions[c],
            })),
          ]}
        />
        <Select
          size="sm"
          className="min-w-36"
          value={deals ? "1" : ""}
          onChange={(v) => onDealsChange(v === "1")}
          options={[
            { value: "", label: dict.client.marketplace.allDeals },
            { value: "1", label: dict.client.marketplace.dealsOnly },
          ]}
        />
      </div>
    </div>
  );
}
