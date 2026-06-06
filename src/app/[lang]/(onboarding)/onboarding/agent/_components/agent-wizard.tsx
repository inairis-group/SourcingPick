"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import {
  completeAgentOnboardingAction,
  updateAgentProfileAction,
} from "@/lib/agent/profile-actions";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type WizardT = {
  welcome: string;
  intro: string;
  step1Title: string;
  step1Body: string;
  step2Title: string;
  step2Body: string;
  step3Title: string;
  step3Body: string;
  bioLabel: string;
  bioHint: string;
  timezoneLabel: string;
  timezoneHint: string;
  dayRateLabel: string;
  weekRateLabel: string;
  /** Template with `{floor}` placeholder. */
  rateHint: string;
  categoriesLabel: string;
  categoriesHint: string;
  nextCta: string;
  backCta: string;
  finishCta: string;
  errorRateLow: string;
  errorCategoriesEmpty: string;
};

/**
 * Three-step onboarding wizard for new agents. Captures the minimum
 * profile fields the rest of the platform expects: bio + timezone,
 * category expertise (used by dispatch tie-breakers), and rate
 * overrides if they're billing above the platform floor.
 */
export function AgentOnboardingWizard({
  firstName,
  lang,
  t,
  categoryLabels,
  floors,
}: {
  firstName: string;
  lang: Locale;
  t: WizardT;
  categoryLabels: Record<Category, string>;
  floors: { dayCents: number; weekCents: number };
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bio, setBio] = useState("");
  const [tz, setTz] = useState("Asia/Shanghai");
  const [categories, setCategories] = useState<Set<Category>>(new Set());
  const [dayCents, setDayCents] = useState(floors.dayCents);
  const [weekCents, setWeekCents] = useState(floors.weekCents);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  const toggleCat = (c: Category) => {
    setError(null);
    setCategories((current) => {
      const next = new Set(current);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const goNext = () => {
    setError(null);
    if (step === 2 && categories.size === 0) {
      setError(t.errorCategoriesEmpty);
      return;
    }
    if (step === 3) {
      finish();
      return;
    }
    setStep((s) => (s === 1 ? 2 : 3));
  };

  const finish = () => {
    if (dayCents < floors.dayCents || weekCents < floors.weekCents) {
      setError(t.errorRateLow);
      return;
    }
    setPending(true);
    startTransition(async () => {
      const profile = await updateAgentProfileAction({
        agentBio: bio,
        agentTimezone: tz,
        agentCategories: Array.from(categories),
        agentResearchFeeDayCents: dayCents === floors.dayCents ? null : dayCents,
        agentResearchFeeWeekCents:
          weekCents === floors.weekCents ? null : weekCents,
      });
      if (!profile.ok) {
        setPending(false);
        setError(profile.error);
        return;
      }
      const done = await completeAgentOnboardingAction();
      setPending(false);
      if (!done.ok) {
        setError(done.error);
        return;
      }
      router.push(`/${lang}/agent/dashboard`);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-2">
          {t.welcome.replace("{name}", firstName)}
        </p>
        <p className="text-sm text-muted max-w-prose">{t.intro}</p>
      </header>

      <ol className="flex items-center gap-2 mb-8 text-xs">
        {[1, 2, 3].map((n) => (
          <li
            key={n}
            className={cn(
              "flex-1 h-1.5 rounded-full",
              n <= step ? "bg-brand-700" : "bg-line",
            )}
          />
        ))}
      </ol>

      {error && <FormError className="mb-4">{error}</FormError>}

      {step === 1 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl font-bold text-headline tracking-tight">
            {t.step1Title}
          </h1>
          <p className="text-sm text-muted">{t.step1Body}</p>
          <Field label={t.bioLabel} hint={t.bioHint}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
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
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl font-bold text-headline tracking-tight">
            {t.step2Title}
          </h1>
          <p className="text-sm text-muted">{t.step2Body}</p>
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
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-4">
          <h1 className="text-xl font-bold text-headline tracking-tight">
            {t.step3Title}
          </h1>
          <p className="text-sm text-muted">{t.step3Body}</p>
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
        </section>
      )}

      <div className="flex items-center justify-between gap-3 mt-8">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            disabled={pending}
          >
            {t.backCta}
          </Button>
        ) : (
          <span />
        )}
        <Button
          type="button"
          variant="primary"
          onClick={goNext}
          loading={pending}
        >
          {step === 3 ? t.finishCta : t.nextCta}
        </Button>
      </div>
    </div>
  );
}
