"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BankIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons";
import { useDictionary } from "@/lib/i18n/client-provider";
import type { Locale } from "@/lib/i18n/config";
import { formatEUR } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

/**
 * Bank-wire pay panel for buyers using the Wise rail. Shows the platform's
 * IBAN / BIC / holder name + the unique reference the buyer must put in
 * their wire memo, with one-tap copy on each field.
 *
 * Why this exists today (Pass 3b.3): the locked buyer UX is "link first,
 * manual fallback". This component implements the *manual fallback* — it
 * works the moment the platform's Wise IBAN env vars are set, with no
 * dependency on the Wise hosted Request Money endpoint (which lands in a
 * follow-up once the exact API path is confirmed against current docs).
 * Until then this is the primary path; once the link lands, this becomes
 * a disclosure under it.
 *
 * The buyer wires from their own bank → the Wise balance-credit webhook
 * fires when funds arrive → 3b.4 matches the memo back to the invoice.
 */
export function WiseWirePanel({
  iban,
  bic,
  holderName,
  reference,
  amountCents,
  currency,
  lang,
}: {
  iban: string;
  bic: string;
  holderName: string;
  reference: string;
  amountCents: number;
  currency: string;
  lang: Locale;
}) {
  const dict = useDictionary();
  const t = dict.client.orders.wisePay;

  const amount =
    currency === "EUR"
      ? formatEUR(amountCents / 100, lang)
      : `${(amountCents / 100).toFixed(2)} ${currency}`;

  return (
    <section className="rounded-lg border border-line bg-surface p-5 mb-4">
      <header className="flex items-start gap-3 mb-4">
        <HugeiconsIcon
          icon={BankIcon}
          size={20}
          strokeWidth={1.5}
          className="text-brand-700 shrink-0 mt-0.5"
        />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-headline">{t.title}</h2>
          <p className="text-xs text-muted mt-0.5 leading-snug">{t.body}</p>
        </div>
      </header>

      <dl className="grid grid-cols-[max-content_1fr_max-content] gap-x-3 gap-y-2 items-center text-sm">
        <CopyRow label={t.amountLabel} value={amount} dict={t} />
        <CopyRow label={t.holderLabel} value={holderName} dict={t} />
        <CopyRow label={t.ibanLabel} value={iban} dict={t} mono />
        <CopyRow label={t.bicLabel} value={bic} dict={t} mono />
        <CopyRow
          label={t.referenceLabel}
          value={reference}
          dict={t}
          mono
          highlight
          hint={t.referenceHint}
        />
      </dl>

      <p className="mt-4 text-xs text-muted leading-snug">{t.footnote}</p>
    </section>
  );
}

function CopyRow({
  label,
  value,
  dict,
  mono,
  highlight,
  hint,
}: {
  label: string;
  value: string;
  dict: { copyCta: string; copiedCta: string };
  mono?: boolean;
  highlight?: boolean;
  hint?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can fail in iframes / sandboxed contexts; silently no-op
      // and leave the value selectable for manual copy.
    }
  };

  return (
    <>
      <dt className="text-xs text-faint uppercase tracking-wide self-start pt-1">
        {label}
      </dt>
      <dd
        className={cn(
          "text-fg break-all min-w-0",
          mono && "font-mono",
          highlight && "font-semibold text-headline",
        )}
      >
        {value}
        {hint && (
          <p className="text-[11px] text-muted font-sans font-normal mt-0.5 leading-snug">
            {hint}
          </p>
        )}
      </dd>
      <button
        type="button"
        onClick={onCopy}
        aria-label={dict.copyCta}
        className={cn(
          "shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md",
          "text-muted hover:text-fg hover:bg-subtle transition-colors duration-fast",
          "focus:outline-2 focus:outline-focus focus:outline-offset-2",
        )}
      >
        <HugeiconsIcon
          icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
          size={14}
          strokeWidth={1.5}
          className={copied ? "text-success" : ""}
        />
      </button>
    </>
  );
}
