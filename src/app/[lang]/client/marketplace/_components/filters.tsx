"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Category, MarketplaceCondition } from "@prisma/client";
import { useDictionary } from "@/lib/i18n/client-provider";
import { MarketplaceFilterBar } from "@/app/[lang]/(marketing)/marketplace/_components/filters";

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
