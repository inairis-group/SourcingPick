"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SourcingRegion } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, Cancel01Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/ui/form-error";
import { updateSourcingAllowlistAction } from "@/lib/platform/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export function SourcingAllowlistForm({
  allRegions,
  allCountries,
  initialRegions,
  initialCountries,
}: {
  allRegions: Option[];
  allCountries: Option[];
  initialRegions: SourcingRegion[];
  initialCountries: string[];
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [regions, setRegions] = useState<Set<string>>(
    () => new Set(initialRegions),
  );
  const [countries, setCountries] = useState<Set<string>>(
    () => new Set(initialCountries),
  );
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const toggleRegion = (value: string) => {
    setSaved(false);
    setRegions((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };
  const toggleCountry = (value: string) => {
    setSaved(false);
    setCountries((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.value.toLowerCase().startsWith(q),
    );
  }, [allCountries, query]);

  const onSave = () => {
    setError(null);
    setSaved(false);
    setPending(true);
    startTransition(async () => {
      const result = await updateSourcingAllowlistAction(
        Array.from(regions) as SourcingRegion[],
        Array.from(countries),
      );
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  const selectedCountries = useMemo(
    () =>
      Array.from(countries)
        .map((code) => allCountries.find((c) => c.value === code))
        .filter((c): c is Option => Boolean(c))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [countries, allCountries],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="flex flex-col gap-6"
    >
      {error && <FormError>{error}</FormError>}
      {saved && (
        <div className="rounded-md border border-success-edge bg-success-soft/30 px-4 py-2 text-sm text-success">
          {dict.admin.sourcingAllowlist.saved}
        </div>
      )}

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-headline">
          {dict.admin.sourcingAllowlist.regionsTitle}
        </h2>
        <p className="text-xs text-muted mt-0.5 mb-3">
          {dict.admin.sourcingAllowlist.regionsDescription}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {allRegions.map((r) => {
            const active = regions.has(r.value);
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => toggleRegion(r.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] font-medium uppercase tracking-wide transition-colors duration-fast",
                  active
                    ? "bg-action text-on-action border-action"
                    : "bg-surface text-fg border-line hover:bg-subtle",
                )}
              >
                {active && (
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={12}
                    strokeWidth={2}
                  />
                )}
                {r.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-semibold text-headline">
          {dict.admin.sourcingAllowlist.countriesTitle}
        </h2>
        <p className="text-xs text-muted mt-0.5 mb-3">
          {dict.admin.sourcingAllowlist.countriesDescription}
        </p>

        {selectedCountries.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-wide text-faint mb-1.5">
              {dict.admin.sourcingAllowlist.selectedLabel} ·{" "}
              {selectedCountries.length}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedCountries.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleCountry(c.value)}
                  className={cn(
                    "inline-flex items-center gap-1 h-7 px-2.5 rounded-full border text-[11px] font-medium",
                    "bg-action/10 text-action border-action",
                  )}
                  title={dict.admin.sourcingAllowlist.removeHint}
                >
                  <span>{c.label}</span>
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={11}
                    strokeWidth={1.75}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <Field
          label={dict.admin.sourcingAllowlist.searchLabel}
          hint={dict.admin.sourcingAllowlist.searchHint}
        >
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.admin.sourcingAllowlist.searchPlaceholder}
          />
        </Field>

        <div className="mt-3 max-h-72 overflow-y-auto rounded-md border border-line-subtle">
          <ul className="divide-y divide-line-subtle">
            {filteredCountries.slice(0, 60).map((c) => {
              const active = countries.has(c.value);
              return (
                <li key={c.value}>
                  <button
                    type="button"
                    onClick={() => toggleCountry(c.value)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-start hover:bg-subtle transition-colors duration-fast",
                      active && "bg-action/5 text-headline font-medium",
                    )}
                  >
                    <span>{c.label}</span>
                    {active ? (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={14}
                        strokeWidth={2}
                        className="text-action"
                      />
                    ) : (
                      <HugeiconsIcon
                        icon={Add01Icon}
                        size={14}
                        strokeWidth={1.5}
                        className="text-faint"
                      />
                    )}
                  </button>
                </li>
              );
            })}
            {filteredCountries.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-faint">
                {dict.admin.sourcingAllowlist.searchEmpty}
              </li>
            )}
          </ul>
        </div>
      </section>

      <div className="flex items-center justify-end">
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {dict.admin.sourcingAllowlist.saveCta}
        </Button>
      </div>
    </form>
  );
}
