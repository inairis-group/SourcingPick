"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuctionStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  cancelAuctionDraftAction,
  submitAuctionForReviewAction,
} from "@/lib/auctions/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Factory-side state-machine controls on the auction detail page.
 *  - DRAFT or REJECTED → "Submit for review" (gated on having at least 1 image)
 *  - DRAFT or PENDING_REVIEW → "Cancel" (soft-deletes)
 *  - ACTIVE / ENDED / SOLD / CANCELLED → nothing
 */
export function AuctionActions({
  auctionId,
  status,
  hasImages,
}: {
  auctionId: string;
  status: AuctionStatus;
  hasImages: boolean;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [_, startTransition] = useTransition();

  if (
    status === AuctionStatus.ACTIVE ||
    status === AuctionStatus.ENDED ||
    status === AuctionStatus.SOLD ||
    status === AuctionStatus.CANCELLED
  ) {
    return null;
  }

  const t = dict.factory.auctions;
  const canSubmit =
    (status === AuctionStatus.DRAFT ||
      status === AuctionStatus.REJECTED) &&
    hasImages;
  const canCancel =
    status === AuctionStatus.DRAFT ||
    status === AuctionStatus.PENDING_REVIEW ||
    status === AuctionStatus.REJECTED;

  const onSubmit = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await submitAuctionForReviewAction(auctionId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  const onCancel = () => {
    if (!window.confirm(t.confirmCancel)) return;
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await cancelAuctionDraftAction(auctionId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.push("/factory/auctions");
    });
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      {error && <FormError>{error}</FormError>}
      <div className="flex items-center justify-end gap-2">
        {canCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            {t.cancelCta}
          </Button>
        )}
        {canSubmit && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSubmit}
            loading={pending}
          >
            {t.submitForReviewCta}
          </Button>
        )}
        {status === AuctionStatus.DRAFT && !hasImages && (
          <p className="text-xs text-warning">{t.needsImageHint}</p>
        )}
      </div>
    </div>
  );
}
