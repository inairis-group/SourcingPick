"use client";

import { useState, useTransition } from "react";
import type { PayoutProvider } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { startPayoutOnboardingAction } from "@/lib/payouts/actions";

/**
 * Starts payout onboarding for whichever role is looking at it.
 *
 * Shared rather than duplicated per role: the factory's version predates this
 * and is identical apart from where it sits, and a second copy would drift the
 * moment the provider changes.
 */
export function PayoutOnboardingButton({
  provider,
  label,
}: {
  provider: PayoutProvider;
  label: string;
}) {
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() => {
          setError(null);
          setPending(true);
          startTransition(async () => {
            const result = await startPayoutOnboardingAction(provider);
            setPending(false);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            window.location.href = result.url;
          });
        }}
      >
        {label}
      </Button>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}
