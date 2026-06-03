"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuctionStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { placeBidAction } from "@/lib/auctions/bid-actions";
import { useDictionary } from "@/lib/i18n/client-provider";

/**
 * Bid + buy-now controls.
 *
 * The placeBidAction also handles buy-now: a bid at or above buyNowCents
 * is accepted and the auction is immediately marked SOLD with the bidder
 * as winner. The buy-now button just pre-fills the amount + submits.
 */
export function BidForm({
  auctionId,
  minBidCents,
  buyNowCents,
}: {
  auctionId: string;
  minBidCents: number;
  buyNowCents: number | null;
}) {
  const dict = useDictionary();
  const router = useRouter();
  const t = dict.client.auctions;
  const [amount, setAmount] = useState<string>(
    (minBidCents / 100).toFixed(2),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [, startTransition] = useTransition();

  const submit = (amountEur: number) => {
    setError(null);
    const amountCents = Math.round(amountEur * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError(t.errorInvalidAmount);
      return;
    }
    setPending(true);
    startTransition(async () => {
      const r = await placeBidAction({ auctionId, amountCents });
      setPending(false);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      if (r.auctionStatus === AuctionStatus.SOLD) {
        // Won via buy-now → reload so the page shows the "you won" state.
        router.refresh();
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {error && <FormError>{error}</FormError>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(Number(amount));
        }}
        className="flex flex-col gap-2"
      >
        <Field
          label={t.bidAmountLabel}
          hint={t.bidMinHint.replace(
            "{min}",
            (minBidCents / 100).toFixed(2),
          )}
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={(minBidCents / 100).toFixed(2)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={pending}
            >
              {t.placeBidCta}
            </Button>
          </div>
        </Field>
      </form>

      {buyNowCents !== null && (
        <div className="rounded-md border border-success-edge bg-success-soft/30 p-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-success leading-snug">
            {t.buyNowBody.replace(
              "{amount}",
              (buyNowCents / 100).toFixed(2),
            )}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => submit(buyNowCents / 100)}
            disabled={pending}
          >
            {t.buyNowCta}
          </Button>
        </div>
      )}
    </div>
  );
}
