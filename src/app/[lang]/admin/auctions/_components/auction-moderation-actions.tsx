"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import {
  approveAuctionAction,
  rejectAuctionAction,
} from "@/lib/auctions/actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Admin moderation controls — approve flips PENDING_REVIEW → ACTIVE +
 * stamps publishedAt. Reject takes a free-text reason (≥5 chars) shown
 * back to the factory so they can revise.
 */
export function AuctionModerationActions({ auctionId }: { auctionId: string }) {
  const dict = useDictionary();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [_, startTransition] = useTransition();

  const t = dict.admin.auctions;

  const onApprove = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await approveAuctionAction(auctionId);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  };

  const onReject = () => {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const r = await rejectAuctionAction(auctionId, reason);
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setRejecting(false);
      setReason("");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-3 pt-3 border-t border-line-subtle">
      {error && <FormError>{error}</FormError>}
      {rejecting ? (
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t.rejectReasonPlaceholder}
            maxLength={500}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setRejecting(false);
                setReason("");
                setError(null);
              }}
              disabled={pending}
            >
              {t.back}
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onReject}
              loading={pending}
              disabled={reason.trim().length < 5}
            >
              {t.confirmRejectCta}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setRejecting(true)}
            disabled={pending}
          >
            {t.rejectCta}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onApprove}
            loading={pending}
          >
            {t.approveCta}
          </Button>
        </div>
      )}
    </div>
  );
}
