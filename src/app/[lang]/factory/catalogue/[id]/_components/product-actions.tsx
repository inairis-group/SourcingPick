"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceProductStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  archiveProductAction,
  submitProductForReviewAction,
} from "@/lib/marketplace/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

export function ProductActions({
  productId,
  status,
}: {
  productId: string;
  status: MarketplaceProductStatus;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"submit" | "archive" | null>(null);
  const [_, startTransition] = useTransition();

  const onSubmit = () => {
    setError(null);
    setPending("submit");
    startTransition(async () => {
      const result = await submitProductForReviewAction(productId);
      setPending(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const onArchive = () => {
    setError(null);
    setPending("archive");
    startTransition(async () => {
      const result = await archiveProductAction(productId);
      setPending(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (status === MarketplaceProductStatus.ARCHIVED) return null;

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}
      {/* Partner item #33/#34: the Submit button was previously gated
          client-side on `hasImages`, which fed off a STALE prop —
          uploading new images in the form doesn't update the prop
          until the factory clicks Save first. That left the button
          permanently disabled in the partner's eyes. We now always
          allow the click and let the server return a meaningful error
          ("Add at least one image…") if the draft really has no
          images. The hint below the buttons explains the two-step
          flow so factories don't have to discover it by trial. */}
      {status === MarketplaceProductStatus.DRAFT && (
        <p className="text-xs text-muted leading-snug">
          {dict.factory.catalogue.submitHint}
        </p>
      )}
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onArchive}
          loading={pending === "archive"}
        >
          {dict.factory.catalogue.archiveCta}
        </Button>
        {status === MarketplaceProductStatus.DRAFT && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onSubmit}
            loading={pending === "submit"}
          >
            {dict.factory.catalogue.submitForReviewCta}
          </Button>
        )}
        {status === MarketplaceProductStatus.PENDING_REVIEW && (
          <span className="text-xs text-warning">
            {dict.factory.catalogue.pendingReviewBanner}
          </span>
        )}
        {status === MarketplaceProductStatus.REJECTED && (
          <span className="text-xs text-danger">
            {dict.factory.catalogue.rejectedBanner}
          </span>
        )}
      </div>
    </div>
  );
}
