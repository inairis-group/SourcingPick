"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EmailDigestMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { updateEmailDigestModeAction } from "@/lib/notifications/preference-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Cadence picker for notification emails.
 *   IMMEDIATE — one email per event (default).
 *   DAILY     — one summary email per morning.
 *   OFF       — in-app only.
 *
 * Security-critical events (password reset, OTP) ignore this and always
 * email. Surfacing the modes as cards (not a select) so the trade-offs
 * are visible at a glance.
 */
export function NotificationPreferences({
  initial,
}: {
  initial: EmailDigestMode;
}) {
  const dict = useDictionary();
  const t = dict.settings.notifications;
  const router = useRouter();
  const [mode, setMode] = useState<EmailDigestMode>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [_, startTransition] = useTransition();

  const save = () => {
    if (mode === initial) return;
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await updateEmailDigestModeAction({ mode });
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
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}

      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {(Object.values(EmailDigestMode) as EmailDigestMode[]).map((m) => {
          const checked = mode === m;
          return (
            <li key={m}>
              <button
                type="button"
                onClick={() => setMode(m)}
                disabled={pending}
                className={cn(
                  "w-full text-start rounded-lg border p-4 transition-colors duration-fast",
                  checked
                    ? "border-brand-edge bg-brand-50/40 ring-1 ring-brand-edge"
                    : "border-line bg-surface hover:bg-subtle/30",
                )}
              >
                <p className="text-sm font-semibold text-headline mb-1">
                  {t.modes[m].label}
                </p>
                <p className="text-[11px] text-muted leading-snug">
                  {t.modes[m].description}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-faint leading-snug">{t.securityNote}</p>

      <div className="flex items-center justify-end gap-3 mt-2">
        {savedAt && (
          <span className="text-xs text-success">{t.savedMessage}</span>
        )}
        <Button
          type="button"
          variant="primary"
          size="sm"
          loading={pending}
          disabled={mode === initial || pending}
          onClick={save}
        >
          {t.saveCta}
        </Button>
      </div>
    </div>
  );
}
