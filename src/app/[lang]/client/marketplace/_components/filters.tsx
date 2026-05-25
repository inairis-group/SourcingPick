"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Category } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const CATEGORIES = Object.values(Category);

export function MarketplaceFilters({
  lang,
  category,
  query,
}: {
  lang: string;
  category?: Category;
  query: string;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const params = useSearchParams();
  const [draftQuery, setDraftQuery] = useState(query);

  const buildHref = (next: { q?: string; category?: string }) => {
    const sp = new URLSearchParams(params.toString());
    if (next.q !== undefined) {
      if (next.q) sp.set("q", next.q);
      else sp.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category) sp.set("category", next.category);
      else sp.delete("category");
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
        <CategoryChip
          label={dict.client.marketplace.allCategories}
          active={!category}
          href={buildHref({ category: "" })}
        />
        {CATEGORIES.map((c) => (
          <CategoryChip
            key={c}
            label={dict.categories[c]}
            active={category === c}
            href={buildHref({ category: c })}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center h-7 px-3 rounded-full border text-[11px] font-medium uppercase tracking-wide whitespace-nowrap transition-colors duration-fast",
        active
          ? "bg-action text-on-action border-action"
          : "bg-surface text-fg border-line hover:bg-subtle",
      )}
    >
      {label}
    </a>
  );
}
