"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  uploadOrgLogoAction,
  type UploadLogoState,
} from "@/lib/settings/logo-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

const INITIAL: UploadLogoState = {};

/**
 * Org logo / profile photo section.
 *
 * Two states:
 *  - logoUrl present → 96px round image from /api/org/{id}/logo, with a
 *    "Change" button to swap; cache-busted via `?v={ts}` so a fresh
 *    upload renders immediately without a hard reload.
 *  - logoUrl null    → initials avatar (same pattern as the founder
 *    cards on /about — clean fallback, no stock silhouette).
 */
export function LogoSection({
  orgId,
  orgName,
  hasLogo,
  /** Updated-at timestamp in ms; used to bust the browser cache after upload. */
  cacheBust: serverCacheBust,
}: {
  orgId: string;
  orgName: string;
  hasLogo: boolean;
  cacheBust: number;
}) {
  const dict = useDictionary();
  const t = dict.settings.logo;
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    uploadOrgLogoAction,
    INITIAL,
  );

  // After an upload we want the <img> to refetch immediately. We bump a
  // local nonce on success — the server bust value covers the initial
  // render (it changes via revalidate on the next navigation).
  const [localBust, setLocalBust] = useState(0);
  useEffect(() => {
    if (state.ok) {
      setLocalBust((n) => n + 1);
      formRef.current?.reset();
    }
  }, [state.ok]);

  const bust = serverCacheBust + localBust;
  const initials = orgName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const showImage = hasLogo || localBust > 0;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex items-start gap-4"
      encType="multipart/form-data"
    >
      <div
        className={cn(
          "shrink-0 h-24 w-24 rounded-full overflow-hidden bg-brand-50 text-brand-700",
          "flex items-center justify-center font-semibold text-xl border border-line",
        )}
      >
        {showImage ? (
          <Image
            key={bust}
            src={`/api/org/${orgId}/logo?v=${bust}`}
            alt={orgName}
            width={96}
            height={96}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {state.error && <FormError>{state.error}</FormError>}
        {state.ok && (
          <div className="rounded-md border border-success-edge bg-success-soft/30 px-3 py-2 text-xs text-success">
            {t.saved}
          </div>
        )}

        <label className="text-sm font-medium text-fg">
          {t.fileLabel}
          <span className="text-faint text-xs ms-2">{t.fileHint}</span>
        </label>
        <input
          name="logo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className={cn(
            "block w-full text-sm text-muted file:me-3 file:rounded-md file:border-0",
            "file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:font-medium",
            "file:text-fg hover:file:bg-line/40",
          )}
        />

        <div>
          <Button type="submit" variant="primary" size="sm" loading={pending}>
            {t.submitCta}
          </Button>
        </div>
      </div>
    </form>
  );
}
