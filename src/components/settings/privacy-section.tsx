"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { useDictionary } from "@/lib/i18n/client-provider";
import {
  requestAccountDeletionAction,
  cancelAccountDeletionAction,
} from "@/lib/account/deletion-actions";

/**
 * GDPR self-service: data export (Art. 20) + account-deletion request
 * (Art. 17). Deletion is request-based — it files a PENDING row for admin
 * review rather than erasing immediately, because the platform holds
 * financial records subject to retention. The fulfils the privacy policy's
 * "exercise your rights from your settings" promise.
 */
export function PrivacySection({
  pendingSince,
}: {
  /** ISO timestamp of the user's open deletion request, or null. */
  pendingSince: string | null;
}) {
  const dict = useDictionary();
  const t = dict.settings.privacy;
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const download = () => {
    window.location.href = "/api/account/export";
  };

  const submitRequest = () => {
    setError(null);
    startTransition(async () => {
      const r = await requestAccountDeletionAction(reason.trim() || undefined);
      if (!r.ok) {
        setError(r.error || t.error);
        return;
      }
      setConfirming(false);
      setReason("");
      router.refresh();
    });
  };

  const cancelRequest = () => {
    setError(null);
    startTransition(async () => {
      const r = await cancelAccountDeletionAction();
      if (!r.ok) {
        setError(r.error || t.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Data export (Art. 20) */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-headline">
          {t.exportHeading}
        </h3>
        <p className="text-sm text-muted">{t.exportDescription}</p>
        <div className="mt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={download}
          >
            {t.exportCta}
          </Button>
        </div>
      </div>

      {/* Account deletion (Art. 17) — danger zone */}
      <div className="flex flex-col gap-2 rounded-lg border border-danger-edge bg-danger-soft/30 p-4">
        <h3 className="text-sm font-semibold text-danger">
          {t.deletionHeading}
        </h3>

        {pendingSince ? (
          <>
            <p className="text-sm font-medium text-fg">{t.pendingTitle}</p>
            <p className="text-xs text-muted leading-snug">{t.pendingNote}</p>
            <p className="text-xs text-faint">
              {t.pendingSubmitted}{" "}
              {new Date(pendingSince).toLocaleDateString()}
            </p>
            {error && <FormError>{error}</FormError>}
            <div className="mt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={pending}
                onClick={cancelRequest}
              >
                {t.cancelCta}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted leading-snug">
              {t.deletionDescription}
            </p>
            {error && <FormError>{error}</FormError>}
            {confirming ? (
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-medium text-muted"
                  htmlFor="account-deletion-reason"
                >
                  {t.deletionReasonLabel}
                </label>
                <textarea
                  id="account-deletion-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t.deletionReasonPlaceholder}
                  rows={3}
                  maxLength={1000}
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-brand-edge"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    loading={pending}
                    onClick={submitRequest}
                  >
                    {t.deletionConfirmCta}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      setConfirming(false);
                      setError(null);
                    }}
                  >
                    {t.deletionAbort}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirming(true)}
                >
                  {t.deletionCta}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
