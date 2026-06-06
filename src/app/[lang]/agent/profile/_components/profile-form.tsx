"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { updateAgentProfileAction } from "@/lib/agent/profile-actions";
import { cn } from "@/lib/utils";

type Floors = { dayCents: number; weekCents: number };

type Initial = {
  agentBio: string;
  agentTimezone: string;
  agentResearchFeeDayCents: number | null;
  agentResearchFeeWeekCents: number | null;
  agentCategories: Category[];
};

export function AgentProfileForm({
  initial,
  floors,
  t,
  categoryLabels,
}: {
  initial: Initial;
  floors: Floors;
  t: {
    bioLabel: string;
    bioHint: string;
    timezoneLabel: string;
    timezoneHint: string;
    dayRateLabel: string;
    weekRateLabel: string;
    /** Template with `{floor}` placeholder for the platform floor in €. */
    rateHint: string;
    categoriesLabel: string;
    categoriesHint: string;
    saveCta: string;
    savedMessage: string;
    errorRateLow: string;
  };
  categoryLabels: Record<Category, string>;
}) {
  const router = useRouter();
  const [bio, setBio] = useState(initial.agentBio);
  const [tz, setTz] = useState(initial.agentTimezone);
  const [dayCents, setDayCents] = useState<number>(
    initial.agentResearchFeeDayCents ?? floors.dayCents,
  );
  const [weekCents, setWeekCents] = useState<number>(
    initial.agentResearchFeeWeekCents ?? floors.weekCents,
  );
  const [categories, setCategories] = useState<Set<Category>>(
    new Set(initial.agentCategories),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [_, startTransition] = useTransition();

  const toggleCat = (c: Category) => {
    setCategories((current) => {
      const next = new Set(current);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dayCents < floors.dayCents || weekCents < floors.weekCents) {
      setError(t.errorRateLow);
      return;
    }
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await updateAgentProfileAction({
        agentBio: bio,
        agentTimezone: tz,
        agentResearchFeeDayCents: dayCents === floors.dayCents ? null : dayCents,
        agentResearchFeeWeekCents:
          weekCents === floors.weekCents ? null : weekCents,
        agentCategories: Array.from(categories),
      });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {error && <FormError>{error}</FormError>}

      <Field label={t.bioLabel} hint={t.bioHint}>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          maxLength={2000}
          className={cn(
            "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm",
            "focus:outline-2 focus:outline-focus focus:outline-offset-1",
          )}
        />
      </Field>

      <Field label={t.timezoneLabel} hint={t.timezoneHint}>
        <Input
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          placeholder="Asia/Shanghai"
          maxLength={50}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label={t.dayRateLabel}
          hint={t.rateHint.replace("{floor}", String(floors.dayCents / 100))}
        >
          <Input
            type="number"
            inputMode="numeric"
            min={floors.dayCents / 100}
            max={2000}
            step={5}
            value={dayCents / 100}
            onChange={(e) =>
              setDayCents(Math.round(Number(e.target.value) * 100))
            }
          />
        </Field>
        <Field
          label={t.weekRateLabel}
          hint={t.rateHint.replace("{floor}", String(floors.weekCents / 100))}
        >
          <Input
            type="number"
            inputMode="numeric"
            min={floors.weekCents / 100}
            max={8000}
            step={25}
            value={weekCents / 100}
            onChange={(e) =>
              setWeekCents(Math.round(Number(e.target.value) * 100))
            }
          />
        </Field>
      </div>

      <Field label={t.categoriesLabel} hint={t.categoriesHint}>
        <div className="flex flex-wrap gap-2">
          {(Object.values(Category) as Category[]).map((c) => {
            const checked = categories.has(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCat(c)}
                className={cn(
                  "inline-flex items-center h-8 px-3 rounded-full border text-xs font-medium transition-colors duration-fast",
                  checked
                    ? "border-brand-edge bg-brand-50/50 text-brand-700"
                    : "border-line bg-surface text-muted hover:bg-subtle/30",
                )}
              >
                {categoryLabels[c]}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="flex items-center justify-end gap-3 pt-2">
        {savedAt && (
          <span className="text-xs text-success">{t.savedMessage}</span>
        )}
        <Button type="submit" variant="primary" size="md" loading={pending}>
          {t.saveCta}
        </Button>
      </div>
    </form>
  );
}
