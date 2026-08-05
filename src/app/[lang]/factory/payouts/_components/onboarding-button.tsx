"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PayoutProvider } from "@prisma/client";
import { startPayoutOnboardingAction } from "@/lib/payouts/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

type Variant = "primary" | "ghost";

export function ConnectOnboardingButton({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: Variant;
}) {
  const dict = useDictionary();
  const [_, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const result = await startPayoutOnboardingAction(PayoutProvider.PINGPONG);
      setPending(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.url;
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={variant}
        size="sm"
        onClick={onClick}
        loading={pending}
      >
        {label}
      </Button>
      {error && (
        <p className="text-[11px] text-danger max-w-[220px] text-end">
          {error || dict.factory.payouts.onboardingError}
        </p>
      )}
    </div>
  );
}
