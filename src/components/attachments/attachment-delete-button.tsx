"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { deleteAttachmentAction } from "@/lib/attachments/actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Small delete affordance overlaid on a MediaGrid item. Two-tap: the
 * first click arms it, the second confirms — avoids an accidental
 * destructive action without a modal.
 */
export function AttachmentDeleteButton({ id }: { id: string }) {
  const dict = useDictionary();
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();

  const remove = () => {
    startTransition(async () => {
      const result = await deleteAttachmentAction(id);
      if (result.ok) router.refresh();
      else setArmed(false);
    });
  };

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        aria-label={dict.common.actions.delete}
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-full",
          "bg-page/80 backdrop-blur text-muted hover:text-danger hover:bg-page",
          "border border-line shadow-sm transition-colors duration-fast",
        )}
      >
        <HugeiconsIcon icon={Delete02Icon} size={13} strokeWidth={1.75} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className={cn(
        "inline-flex items-center h-7 px-2 rounded-full text-[10px] font-semibold uppercase tracking-wide",
        "bg-danger text-on-action border border-danger-edge shadow-sm",
        "transition-colors duration-fast",
      )}
    >
      {pending ? "…" : dict.attachments.confirmDelete}
    </button>
  );
}
