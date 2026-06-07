"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import {
  deleteUploadedImageAction,
  type ImageEntity,
} from "@/lib/attachments/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Delete overlay for an existing image slot on a parent row that
 * carries its own `images: String[]` column (MarketplaceProduct,
 * SourcingProduct, Auction). Mirrors the two-tap UX of
 * `AttachmentDeleteButton` for muscle-memory consistency, and styled
 * to sit on top of a thumbnail (absolute top-end corner).
 *
 * On success it `router.refresh()`s so the new `existingImages` list
 * comes back from the server — the form's `defaults` prop is
 * server-derived so we can't just splice client-side.
 */
export function ExistingImageDelete({
  entity,
  entityId,
  index,
}: {
  entity: ImageEntity;
  entityId: string;
  index: number;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = () => {
    setError(null);
    startTransition(async () => {
      const r = await deleteUploadedImageAction({ entity, entityId, index });
      if (r.ok) {
        router.refresh();
        return;
      }
      setError(r.error);
      setArmed(false);
    });
  };

  return (
    <>
      {!armed ? (
        <button
          type="button"
          onClick={() => setArmed(true)}
          aria-label={dict.common.actions.delete}
          className={cn(
            "absolute top-1 inset-e-1 z-10",
            "inline-flex items-center justify-center h-6 w-6 rounded-full",
            "bg-page/90 backdrop-blur text-muted hover:text-danger hover:bg-page",
            "border border-line shadow-sm transition-colors duration-fast",
          )}
        >
          <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={1.75} />
        </button>
      ) : (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className={cn(
            "absolute top-1 inset-e-1 z-10",
            "inline-flex items-center h-6 px-2 rounded-full text-[9px] font-semibold uppercase tracking-wide",
            "bg-danger text-on-action border border-danger-edge shadow-sm",
            "transition-colors duration-fast",
          )}
        >
          {pending ? "…" : dict.attachments.confirmDelete}
        </button>
      )}
      {error && (
        <span className="absolute bottom-1 inset-x-1 z-10 text-[9px] text-danger bg-page/90 backdrop-blur rounded-sm px-1 py-0.5 text-center">
          {error}
        </span>
      )}
    </>
  );
}
