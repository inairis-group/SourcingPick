"use client";

import { useActionState, useState } from "react";
import {
  acceptShippingQuoteAction,
  declineShippingQuoteAction,
  type QuoteAcceptanceState,
} from "@/lib/shipments/quote-acceptance";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";

/**
 * The freight price, put in front of the buyer before anything is billed.
 *
 * The euro figure shown here is the exact figure the invoice will carry — the
 * server freezes the conversion at acceptance using the same rate that
 * produced this preview. If no rate is configured the amount can't be shown
 * honestly, so the panel says so and the accept button stays disabled rather
 * than quoting a number we'd then have to correct.
 */

type Quote = {
  amountCents: number;
  currency: string;
  validUntil: Date | string;
  conditions: string;
  notes: string | null;
};

export function FreightQuotePanel({
  shipmentId,
  reference,
  quote,
  previewEurCents,
  acceptedAt,
  billedAmountCentsEur,
  declineReason,
  lang,
  copy,
}: {
  shipmentId: string;
  reference: string;
  quote: Quote;
  previewEurCents: number | null;
  acceptedAt: Date | string | null;
  billedAmountCentsEur: number | null;
  declineReason: string | null;
  lang: Locale;
  copy: Record<string, string>;
}) {
  const [accept, acceptAction, accepting] = useActionState(
    acceptShippingQuoteAction,
    null,
  );
  const [decline, declineAction, declining] = useActionState(
    declineShippingQuoteAction,
    null,
  );
  const [showDecline, setShowDecline] = useState(false);

  const err = (s: QuoteAcceptanceState | null) =>
    s && !s.ok ? (copy[`fqErr_${s.error}`] ?? copy.fqErr_generic) : null;
  const error = err(accept) ?? err(decline);

  const expired = new Date(quote.validUntil).getTime() < Date.now();
  const settled = Boolean(acceptedAt) || accept?.ok;

  if (settled) {
    return (
      <section className="border-success-edge bg-success-soft mt-6 rounded-lg border p-5">
        <h2 className="text-success text-sm font-semibold">
          {copy.freightAcceptedTitle}
        </h2>
        <p className="text-fg mt-1 text-sm">
          {copy.freightAcceptedBody}{" "}
          <span className="font-semibold tabular-nums">
            {formatEUR((billedAmountCentsEur ?? previewEurCents ?? 0) / 100, lang)}
          </span>
        </p>
      </section>
    );
  }

  return (
    <section className="border-line bg-surface mt-6 rounded-lg border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-headline text-sm font-semibold">
            {copy.freightTitle}
          </h2>
          <p className="text-faint mt-0.5 font-mono text-xs">{reference}</p>
        </div>
        <div className="text-end">
          {previewEurCents !== null ? (
            <p className="text-headline text-lg font-semibold tabular-nums">
              {formatEUR(previewEurCents / 100, lang)}
            </p>
          ) : (
            <p className="text-warning text-xs">{copy.freightNoRate}</p>
          )}
          {/* Shown so the buyer can reconcile against the forwarder's own
              paperwork, which is denominated in the quoted currency. */}
          {quote.currency.toUpperCase() !== "EUR" && (
            <p className="text-faint text-xs tabular-nums">
              {(quote.amountCents / 100).toFixed(2)} {quote.currency}
            </p>
          )}
        </div>
      </div>

      <dl className="border-line-subtle mt-4 border-t pt-3 text-sm">
        <div className="flex justify-between gap-4 py-1">
          <dt className="text-faint">{copy.freightValidUntil}</dt>
          <dd className={expired ? "text-danger" : "text-fg"}>
            {new Date(quote.validUntil).toLocaleDateString(lang)}
          </dd>
        </div>
        <div className="py-1">
          <dt className="text-faint">{copy.freightConditions}</dt>
          <dd className="text-fg mt-0.5 whitespace-pre-wrap">{quote.conditions}</dd>
        </div>
        {quote.notes && (
          <div className="py-1">
            <dt className="text-faint">{copy.freightNotes}</dt>
            <dd className="text-fg mt-0.5 whitespace-pre-wrap">{quote.notes}</dd>
          </div>
        )}
      </dl>

      {declineReason && (
        <p className="text-muted border-line-subtle mt-3 border-t pt-3 text-xs">
          {copy.freightPreviouslyDeclined} {declineReason}
        </p>
      )}

      {expired ? (
        <p className="border-warning-edge bg-warning-soft text-warning mt-4 rounded-md border px-3 py-2 text-sm">
          {copy.freightExpired}
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <form action={acceptAction}>
            <input type="hidden" name="shipmentId" value={shipmentId} />
            <Button
              type="submit"
              disabled={accepting || previewEurCents === null}
            >
              {copy.freightAccept}
            </Button>
          </form>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowDecline((v) => !v)}
          >
            {copy.freightDecline}
          </Button>
        </div>
      )}

      {showDecline && !expired && (
        <form action={declineAction} className="mt-3 flex flex-col gap-2">
          <input type="hidden" name="shipmentId" value={shipmentId} />
          <textarea
            name="reason"
            rows={2}
            required
            minLength={5}
            placeholder={copy.freightDeclineReason}
            className="border-line bg-page w-full rounded-md border px-3 py-2 text-sm"
          />
          <Button type="submit" variant="secondary" disabled={declining}>
            {copy.freightDeclineSubmit}
          </Button>
        </form>
      )}

      {error && (
        <p className="border-danger-edge bg-danger-soft text-danger mt-3 rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      )}
    </section>
  );
}
