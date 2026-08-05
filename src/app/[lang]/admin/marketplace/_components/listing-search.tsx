"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Search across the admin listing queues.
 *
 * Submitted rather than live: each change is a navigation and a fresh query
 * over every listing, so typing "notebook" would otherwise fire eight of them.
 * The value round-trips through the URL, which keeps a filtered queue
 * shareable and survives the router.refresh() the row controls trigger.
 */
export function ListingSearch({
  lang,
  query,
  placeholder,
  submitLabel,
  clearLabel,
}: {
  lang: string;
  query: string;
  placeholder: string;
  submitLabel: string;
  clearLabel: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [draft, setDraft] = useState(query);

  const go = (next: string) => {
    const sp = new URLSearchParams(params.toString());
    if (next.trim()) sp.set("q", next.trim());
    else sp.delete("q");
    const qs = sp.toString();
    router.push(`/${lang}/admin/marketplace${qs ? `?${qs}` : ""}`);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(draft);
      }}
      className="mb-6 flex items-center gap-2"
    >
      <div className="relative flex-1">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="ps-9"
        />
        <span className="text-faint pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3">
          <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />
        </span>
      </div>
      <Button type="submit" variant="secondary" size="sm">
        {submitLabel}
      </Button>
      {query && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setDraft("");
            go("");
          }}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.5} />
          <span className="ms-1">{clearLabel}</span>
        </Button>
      )}
    </form>
  );
}
