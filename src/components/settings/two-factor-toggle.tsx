"use client";

import { useState, useTransition } from "react";
import { Switch } from "@headlessui/react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { toggleTwoFactorAction } from "@/lib/settings/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

type Props = {
  initialEnabled: boolean;
  isAdmin: boolean;
};

/**
 * Two-factor toggle. v1 = bare flag toggle (no OTP-verify-before-change).
 * Phase 1.x will add: require an OTP challenge before *disabling* 2FA, and
 * walk through a TOTP-or-email-OTP enrollment on enable.
 *
 * Admin accounts: spec §12.3 mandates 2FA. We disable the toggle UI for
 * admins so they can't turn it off — guarded server-side too.
 */
export function TwoFactorToggle({ initialEnabled, isAdmin }: Props) {
  const dict = useDictionary();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await toggleTwoFactorAction(enabled);
      if (!result.ok) {
        setError(result.error);
        setEnabled(initialEnabled);
      }
    });
  };

  const dirty = enabled !== initialEnabled;

  return (
    <div className="flex flex-col gap-4">
      {error && <FormError>{error}</FormError>}

      <div className="flex items-start justify-between gap-4 rounded-md border border-line bg-subtle p-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-fg">
            {dict.settings.twoFactor.toggleLabel}
          </p>
          <p className="mt-1 text-sm text-muted leading-snug">
            {isAdmin
              ? dict.settings.twoFactor.adminLocked
              : dict.settings.twoFactor.toggleDescription}
          </p>
        </div>
        <Switch
          checked={enabled}
          onChange={isAdmin ? () => {} : setEnabled}
          disabled={isAdmin || pending}
          className={cn(
            "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-fast",
            "data-focus:outline-2 data-focus:outline-focus data-focus:outline-offset-2",
            enabled ? "bg-action" : "bg-neutral-300",
            (isAdmin || pending) && "opacity-60 cursor-not-allowed",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-page shadow-sm transition-transform duration-fast",
              enabled ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </Switch>
      </div>

      {dirty && !isAdmin && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSubmit}
            loading={pending}
          >
            {dict.common.actions.save}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setEnabled(initialEnabled);
              setError(null);
            }}
            disabled={pending}
          >
            {dict.common.actions.cancel}
          </Button>
        </div>
      )}
    </div>
  );
}
