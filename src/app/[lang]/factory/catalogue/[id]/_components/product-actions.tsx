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
  hasImages,
}: {
  productId: string;
  status: MarketplaceProductStatus;
  hasImages: boolean;
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

  const canSubmit =
    status === MarketplaceProductStatus.DRAFT && hasImages;

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}
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
            disabled={!canSubmit}
            title={
              !hasImages
                ? dict.factory.catalogue.submitNeedsImage
                : undefined
            }
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
