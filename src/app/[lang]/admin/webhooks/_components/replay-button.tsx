"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Refresh01Icon } from "@hugeicons/core-free-icons";
import { replayWebhookEventAction } from "@/lib/admin/webhook-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Admin-only replay button — re-runs the stored payload through the
 * reconciler. Inline status shows the outcome without bouncing through a
 * toast system we don't have yet.
 */
export function ReplayButton({ eventId }: { eventId: string }) {
  const dict = useDictionary();
  const router = useRouter();
  const t = dict.admin.webhooks.replay;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_, startTransition] = useTransition();

  const onClick = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await replayWebhookEventAction(eventId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-1 items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full",
          "text-[11px] font-medium uppercase tracking-wide",
          "bg-surface border border-line text-fg hover:bg-subtle",
          "transition-colors duration-fast",
          "disabled:opacity-60 disabled:cursor-not-allowed",
        )}
        title={t.tooltip}
      >
        <HugeiconsIcon
          icon={Refresh01Icon}
          size={11}
          strokeWidth={1.5}
          className={cn(pending && "animate-spin")}
        />
        {pending ? t.pending : t.cta}
      </button>
      {error && (
        <span className="text-[10px] text-danger max-w-50 text-end leading-tight">
          {error}
        </span>
      )}
    </div>
  );
}
