"use client";

import { useActionState, useState } from "react";
import { acceptFreightQuote, declineFreightQuote, type FreightQuoteAnswerState } from "@/lib/freight-quotes/actions";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

type Copy = {
  accept: string;
  accepting: string;
  acceptHint: string;
  decline: string;
  declineReason: string;
  declineSubmit: string;
  back: string;
  accepted: string;
  declined: string;
  seeInvoices: string;
  seeOrder: string;
  errors: Record<string, string>;
};

/**
 * Accept or decline a freight quote. Accepting issues the freight invoice for
 * the amount shown (acceptFreightQuote); declining asks for a reason, which
 * the team needs to price again.
 */
export function FreightQuoteAnswer({
  quoteId,
  amount,
  invoicesHref,
  orderHref,
  copy: c,
}: {
  quoteId: string;
  /** Formatted, in euros. */
  amount: string;
  invoicesHref: string;
  orderHref: string | null;
  copy: Copy;
}) {
  const [accept, acceptAction, accepting] = useActionState<FreightQuoteAnswerState | null, FormData>(acceptFreightQuote, null);
  const [decline, declineAction, declining] = useActionState<FreightQuoteAnswerState | null, FormData>(declineFreightQuote, null);
  const [showDecline, setShowDecline] = useState(false);
  const failed = (s: FreightQuoteAnswerState | null) => (s && !s.ok ? (c.errors[s.error] ?? c.errors.generic) : null);
  const error = failed(accept) ?? failed(decline);

  if (accept?.ok) {
    return (
      <div role="status" className="border-success-edge bg-success-soft rounded-lg border p-4 text-sm">
        <p className="text-success m-0 font-semibold">{c.accepted.replace("{invoice}", accept.invoiceReference ?? "")}</p>
        <p className="m-0 mt-2 flex flex-wrap gap-4">
          <Link href={invoicesHref} variant="inline">
            {c.seeInvoices}
          </Link>
          {orderHref && (
            <Link href={orderHref} variant="inline">
              {c.seeOrder}
            </Link>
          )}
        </p>
      </div>
    );
  }
  if (decline?.ok) {
    return (
      <p role="status" className="border-line bg-subtle text-fg m-0 rounded-lg border p-4 text-sm">
        {c.declined}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted m-0 text-sm">{c.acceptHint.replace("{amount}", amount)}</p>
      <div className="flex flex-wrap items-center gap-2">
        <form action={acceptAction}>
          <input type="hidden" name="quoteId" value={quoteId} />
          <Button type="submit" disabled={accepting || declining}>
            {accepting ? c.accepting : c.accept}
          </Button>
        </form>
        <Button type="button" variant="ghost" onClick={() => setShowDecline((v) => !v)}>
          {c.decline}
        </Button>
      </div>
      {showDecline && (
        <form action={declineAction} className="flex flex-col gap-2">
          <input type="hidden" name="quoteId" value={quoteId} />
          <label className="text-fg flex flex-col gap-1 text-sm">
            {c.declineReason}
            <textarea name="reason" rows={3} required minLength={5} maxLength={1000} className="border-line bg-surface rounded-md border p-2 text-sm" />
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" disabled={declining}>
              {c.declineSubmit}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowDecline(false)}>
              {c.back}
            </Button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="text-danger m-0 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
