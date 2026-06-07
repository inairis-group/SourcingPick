"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  ShoppingBag01Icon,
  Store01Icon,
  PackageIcon,
  InvoiceIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { dismissClientTutorialAction } from "@/lib/client/tutorial-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * First-order onboarding tutorial — partner #16. A four-step
 * dismissible card explaining the two main buying paths (Marketplace
 * vs Sourcing request) plus what happens once an order is placed.
 *
 * Renders only when `User.clientTutorialDismissedAt` is null. The
 * dismiss button + the "Got it" CTA on the last step both call the
 * server action, which is idempotent.
 */
export function FirstOrderTutorial() {
  const dict = useDictionary();
  const t = dict.client.tutorial;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [_, startTransition] = useTransition();

  const steps = [
    {
      icon: ShoppingBag01Icon,
      title: t.step1Title,
      body: t.step1Body,
    },
    {
      icon: Store01Icon,
      title: t.step2Title,
      body: t.step2Body,
    },
    {
      icon: PackageIcon,
      title: t.step3Title,
      body: t.step3Body,
    },
    {
      icon: InvoiceIcon,
      title: t.step4Title,
      body: t.step4Body,
    },
  ];

  if (hidden) return null;

  const dismiss = () => {
    setPending(true);
    startTransition(async () => {
      await dismissClientTutorialAction();
      setPending(false);
      setHidden(true);
      router.refresh();
    });
  };

  const current = steps[step]!;

  return (
    <section
      role="region"
      aria-label={t.eyebrow}
      className="mb-6 rounded-lg border border-brand-edge bg-brand-50/40 p-5"
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-700">
            <HugeiconsIcon icon={current.icon} size={16} strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
              {t.eyebrow} · {step + 1} / {steps.length}
            </p>
            <h2 className="text-base font-semibold text-headline">
              {current.title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          disabled={pending}
          aria-label={t.dismissAria}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-fg"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.75} />
        </button>
      </header>

      <p className="text-sm text-fg leading-snug max-w-prose mb-4">
        {current.body}
      </p>

      {/* Step indicator dots. */}
      <ol className="flex items-center gap-1.5 mb-4">
        {steps.map((_, i) => (
          <li
            key={i}
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "h-1.5 rounded-full transition-all duration-base",
              i === step ? "w-8 bg-brand-700" : "w-1.5 bg-brand-200",
            )}
          />
        ))}
      </ol>

      <div className="flex items-center justify-end gap-2">
        {step > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStep(step - 1)}
            disabled={pending}
          >
            {t.backCta}
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setStep(step + 1)}
            disabled={pending}
          >
            {t.nextCta}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={dismiss}
            loading={pending}
          >
            {t.finishCta}
          </Button>
        )}
      </div>
    </section>
  );
}
