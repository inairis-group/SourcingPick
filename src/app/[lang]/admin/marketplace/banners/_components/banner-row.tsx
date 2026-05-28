"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  deleteBannerAction,
  toggleBannerAction,
} from "@/lib/marketplace/banner-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Per-banner admin controls: active toggle + delete. Kept as its own
 * client island so the list page stays a server component.
 */
export function BannerRow({ id, active }: { id: string; active: boolean }) {
  const dict = useDictionary();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const t = dict.admin.banners;

  const toggle = () => {
    startTransition(async () => {
      await toggleBannerAction(id, !active);
      router.refresh();
    });
  };

  const remove = () => {
    startTransition(async () => {
      await deleteBannerAction(id);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "inline-flex items-center h-6 px-2 rounded-full border text-[10px] font-semibold uppercase tracking-wide transition-colors duration-fast",
          active
            ? "bg-success-soft text-success border-success-edge"
            : "bg-subtle text-muted border-line",
        )}
      >
        {active ? t.statusActive : t.statusHidden}
      </button>
      {confirming ? (
        <span className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
            disabled={pending}
          >
            {dict.common.actions.cancel}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={remove}
            loading={pending}
          >
            {t.confirmDelete}
          </Button>
        </span>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(true)}
          disabled={pending}
        >
          {t.delete}
        </Button>
      )}
    </div>
  );
}
