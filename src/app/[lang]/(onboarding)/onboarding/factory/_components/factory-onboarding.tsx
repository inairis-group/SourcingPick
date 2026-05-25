"use client";

import { useState, useTransition } from "react";
import type { KycStatus } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FileVerifiedIcon,
  Mail01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { completeOnboardingAction } from "@/lib/onboarding/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

type Props = {
  firstName: string;
  orgName: string;
  kycStatus: KycStatus;
};

export function FactoryOnboarding({ firstName, orgName, kycStatus }: Props) {
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
              {dict.onboarding.factory.step1Eyebrow}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-headline tracking-tight">
              {dict.onboarding.factory.step1Title.replace("{firstName}", firstName)}
            </h1>
            <p className="mt-3 text-sm sm:text-md text-muted leading-relaxed">
              {dict.onboarding.factory.step1Body.replace("{orgName}", orgName)}
            </p>
          </header>

          <KycStatusCard status={kycStatus} dict={dict} />

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
              {dict.onboarding.factory.step2Eyebrow}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-headline tracking-tight">
              {dict.onboarding.factory.step2Title}
            </h1>
            <p className="mt-3 text-sm sm:text-md text-muted leading-relaxed">
              {dict.onboarding.factory.step2Body}
            </p>
          </header>

          <ol className="flex flex-col gap-3 mt-4">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full bg-headline text-on-action font-mono font-semibold text-xs">
                  {n}
                </span>
                <p className="text-sm text-fg leading-snug pt-1">
                  {dict.onboarding.factory[`step2Item${n}` as `step2Item${1 | 2 | 3}`]}
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
              {dict.onboarding.factory.finish}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function KycStatusCard({
  status,
  dict,
}: {
  status: KycStatus;
  dict: ReturnType<typeof useDictionary>;
}) {
  const map: Record<
    KycStatus,
    { title: string; body: string; icon: typeof Mail01Icon; tone: "info" | "success" | "warn" | "danger" }
  > = {
    PENDING: {
      title: dict.onboarding.factory.kycPendingTitle,
      body: dict.onboarding.factory.kycPendingBody,
      icon: Mail01Icon,
      tone: "info",
    },
    VERIFIED: {
      title: dict.onboarding.factory.kycVerifiedTitle,
      body: dict.onboarding.factory.kycVerifiedBody,
      icon: Tick02Icon,
      tone: "success",
    },
    FLAGGED: {
      title: dict.onboarding.factory.kycFlaggedTitle,
      body: dict.onboarding.factory.kycFlaggedBody,
      icon: FileVerifiedIcon,
      tone: "warn",
    },
    REJECTED: {
      title: dict.onboarding.factory.kycRejectedTitle,
      body: dict.onboarding.factory.kycRejectedBody,
      icon: FileVerifiedIcon,
      tone: "danger",
    },
  };
  const item = map[status];
  const toneClasses: Record<typeof item.tone, string> = {
    info: "border-info-edge bg-info-soft text-info",
    success: "border-success-edge bg-success-soft text-success",
    warn: "border-warning-edge bg-warning-soft text-warning",
    danger: "border-danger-edge bg-danger-soft text-danger",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border p-4 mt-4",
        toneClasses[item.tone],
      )}
    >
      <span className="flex-shrink-0 mt-0.5">
        <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{item.title}</p>
        <p className="mt-1 text-sm leading-snug">{item.body}</p>
      </div>
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
