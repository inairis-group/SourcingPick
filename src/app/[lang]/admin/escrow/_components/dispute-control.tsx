"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EscrowStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  openDisputeAction,
  resolveDisputeAction,
} from "@/lib/orders/dispute-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Per-escrow dispute control for the admin ledger.
 *   - HELD escrow → "Open dispute" (reason prompt).
 *   - DISPUTED escrow → resolve: standard partial / custom full / reject.
 * Anything else → nothing (released/refunded are terminal here).
 */
export function DisputeControl({
  escrowId,
  status,
}: {
  escrowId: string;
  status: EscrowStatus;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"idle" | "opening">("idle");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const t = dict.admin.escrow.dispute;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) {
        setError(r.error ?? null);
        return;
      }
      setMode("idle");
      setReason("");
      router.refresh();
    });
  };

  if (status === EscrowStatus.HELD) {
    if (mode === "idle") {
      return (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMode("opening")}
        >
          {t.openCta}
        </Button>
      );
    }
    return (
      <div className="flex flex-col gap-1.5 min-w-[220px]">
        {error && <p className="text-[11px] text-danger">{error}</p>}
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t.reasonPlaceholder}
          className="h-8 text-xs"
        />
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMode("idle")}
            disabled={pending}
          >
            {dict.common.actions.cancel}
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={pending}
            onClick={() => run(() => openDisputeAction(escrowId, reason))}
          >
            {t.confirmOpen}
          </Button>
        </div>
      </div>
    );
  }

  if (status === EscrowStatus.DISPUTED) {
    return (
      <div className="flex flex-col gap-1.5 min-w-[220px]">
        {error && <p className="text-[11px] text-danger">{error}</p>}
        <p className="text-[10px] uppercase tracking-wide text-faint">
          {t.resolveLabel}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={pending}
            onClick={() => run(() => resolveDisputeAction(escrowId, "STANDARD"))}
            title={t.standardHint}
          >
            {t.standard}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={pending}
            onClick={() => run(() => resolveDisputeAction(escrowId, "CUSTOM"))}
            title={t.customHint}
          >
            {t.custom}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            loading={pending}
            onClick={() => run(() => resolveDisputeAction(escrowId, "REJECT"))}
            title={t.rejectHint}
          >
            {t.reject}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
