"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Category, MarketplaceCondition } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.values(Category);
const CONDITIONS = Object.values(MarketplaceCondition);

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
    return `/${lang}/client/marketplace${qs ? `?${qs}` : ""}`;
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildHref({ q: draftQuery }));
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onSearch}>
        <Input
          value={draftQuery}
          onChange={(e) => setDraftQuery(e.target.value)}
          placeholder={dict.client.marketplace.searchPlaceholder}
        />
      </form>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Chip
          label={dict.client.marketplace.allCategories}
          active={!category}
          href={buildHref({ category: "" })}
        />
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={dict.categories[c]}
            active={category === c}
            href={buildHref({ category: c })}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Chip
          label={dict.client.marketplace.allConditions}
          active={!condition}
          href={buildHref({ condition: "" })}
        />
        {CONDITIONS.map((c) => (
          <Chip
            key={c}
            label={dict.factory.catalogue.conditions[c]}
            active={condition === c}
            href={buildHref({ condition: c })}
          />
        ))}
        <span className="w-px h-5 bg-line mx-1.5" aria-hidden />
        <Chip
          label={dict.client.marketplace.dealsOnly}
          active={Boolean(deals)}
          href={buildHref({ deals: !deals })}
          tone="accent"
        />
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  href,
  tone = "default",
}: {
  label: string;
  active: boolean;
  href: string;
  tone?: "default" | "accent";
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center h-7 px-3 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap transition-colors duration-fast",
        active
          ? tone === "accent"
            ? "bg-danger text-on-action border-danger-edge"
            : "bg-action text-on-action border-action"
          : "bg-surface text-fg border-line hover:bg-subtle",
      )}
    >
      {label}
    </a>
  );
}
