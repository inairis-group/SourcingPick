"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Globe02Icon,
  UserCircleIcon,
  WalletDoneIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { completeOnboardingAction } from "@/lib/onboarding/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

type Props = {
  firstName: string;
  orgName: string;
};

export function ClientOnboarding({ firstName, orgName }: Props) {
  const dict = useDictionary();
  const [step, setStep] = useState<1 | 2>(1);
  const [pending, startTransition] = useTransition();

  const onFinish = () => {
    startTransition(() => {
      void completeOnboardingAction();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <StepDots current={step} total={2} />

      {step === 1 && (
        <Card variant="raised" padding="lg" className="animate-fade-up">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-2">
              {dict.onboarding.client.step1Eyebrow}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-headline tracking-tight">
              {dict.onboarding.client.step1Title.replace("{firstName}", firstName)}
            </h1>
            <p className="mt-3 text-sm sm:text-md text-muted leading-relaxed">
              {dict.onboarding.client.step1Body.replace("{orgName}", orgName)}
            </p>
          </header>

          <ul className="flex flex-col gap-4 mt-6">
            <Pillar
              icon={<HugeiconsIcon icon={UserCircleIcon} size={20} strokeWidth={1.5} />}
              title={dict.onboarding.client.pillarAgentTitle}
              body={dict.onboarding.client.pillarAgentBody}
            />
            <Pillar
              icon={<HugeiconsIcon icon={WalletDoneIcon} size={20} strokeWidth={1.5} />}
              title={dict.onboarding.client.pillarEscrowTitle}
              body={dict.onboarding.client.pillarEscrowBody}
            />
            <Pillar
              icon={<HugeiconsIcon icon={Globe02Icon} size={20} strokeWidth={1.5} />}
              title={dict.onboarding.client.pillarReachTitle}
              body={dict.onboarding.client.pillarReachBody}
            />
          </ul>

          <div className="flex justify-end mt-8">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setStep(2)}
              rightIcon={<HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />}
            >
              {dict.common.actions.next}
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card variant="raised" padding="lg" className="animate-fade-up">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 mb-2">
              {dict.onboarding.client.step2Eyebrow}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-headline tracking-tight">
              {dict.onboarding.client.step2Title}
            </h1>
            <p className="mt-3 text-sm sm:text-md text-muted leading-relaxed">
              {dict.onboarding.client.step2Body}
            </p>
          </header>

          <ol className="flex flex-col gap-3 mt-4">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-headline text-on-action font-mono font-semibold text-xs">
                  {n}
                </span>
                <p className="text-sm text-fg leading-snug pt-1">
                  {dict.onboarding.client[`step2Item${n}` as `step2Item${1 | 2 | 3 | 4}`]}
                </p>
              </li>
            ))}
          </ol>

          <div className="flex items-center justify-between mt-8 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setStep(1)}
              disabled={pending}
              leftIcon={<HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />}
            >
              {dict.common.actions.back}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onFinish}
              loading={pending}
            >
              {dict.onboarding.client.finish}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <ol className="flex items-center justify-center gap-2" aria-label="Progress">
      {Array.from({ length: total }).map((_, i) => (
        <li
          key={i}
          className={cn(
            "h-1.5 w-8 rounded-full transition-colors duration-fast",
            i + 1 <= current ? "bg-action" : "bg-line",
          )}
          aria-current={i + 1 === current ? "step" : undefined}
        />
      ))}
    </ol>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-md border border-line bg-subtle p-4">
      <span className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-fg">{title}</p>
        <p className="mt-1 text-sm text-muted leading-snug">{body}</p>
      </div>
    </li>
  );
}
