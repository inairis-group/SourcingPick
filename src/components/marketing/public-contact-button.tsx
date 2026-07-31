"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CustomerService01Icon,
  Mail01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Public-site "Contact us" floating button — partner #17 (deferred
 * version).
 *
 * The partner asked for a live-chat widget on the public website so
 * visitors can ask questions before signing up. A full live-chat
 * integration (Intercom / Crisp / in-house WebSocket) needs:
 *
 *   - A paid third-party account OR a server-side socket relay.
 *   - A dedicated operator rota — partner doesn't have one staffed yet.
 *   - GDPR / DPA paperwork for whichever vendor.
 *
 * Rather than ship something half-finished, this lightweight dock
 * gives visitors two paths to the existing support flow:
 *   1. Sign up (already free + frictionless) and open a support ticket.
 *   2. Email the support address directly.
 *
 * When the partner is ready to commit to a live widget, this
 * component is the swap point — replace the panel body with the
 * widget's embed code.
 */
export function PublicContactButton() {
  const dict = useDictionary();
  const locale = useLocale();
  const t = dict.marketing.contact;
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 end-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label={t.title}
          className={cn(
            "w-80 max-w-[calc(100vw-2rem)] rounded-lg",
            "border border-line bg-surface shadow-xl overflow-hidden",
          )}
        >
          <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line-subtle">
            <p className="text-sm font-semibold text-headline">{t.title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.closeAria}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-fg"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.75} />
            </button>
          </header>
          <div className="p-4 flex flex-col gap-3">
            <p className="text-xs text-muted leading-snug">{t.body}</p>
            <a
              href={`/${locale}/signup`}
              className={cn(
                "flex items-center gap-2 rounded-md border border-line p-3",
                "hover:bg-subtle transition-colors duration-fast",
              )}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-info-soft text-info">
                <HugeiconsIcon
                  icon={UserAdd01Icon}
                  size={14}
                  strokeWidth={1.75}
                />
              </span>
              <span className="min-w-0">
                <p className="text-sm font-semibold text-headline">
                  {t.signupCtaTitle}
                </p>
                <p className="text-[11px] text-muted leading-snug">
                  {t.signupCtaBody}
                </p>
              </span>
            </a>
            <a
              href="mailto:support@sourcingpick.com"
              className={cn(
                "flex items-center gap-2 rounded-md border border-line p-3",
                "hover:bg-subtle transition-colors duration-fast",
              )}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-info-soft text-info">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={14}
                  strokeWidth={1.75}
                />
              </span>
              <span className="min-w-0">
                <p className="text-sm font-semibold text-headline">
                  {t.emailCtaTitle}
                </p>
                <p className="text-[11px] text-muted leading-snug font-mono break-all">
                  support@sourcingpick.com
                </p>
              </span>
            </a>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.openAria}
        aria-expanded={open}
        className={cn(
          "relative inline-flex h-14 w-14 items-center justify-center rounded-full",
          "bg-action text-on-action shadow-lg hover:bg-action-hover",
          "transition-transform duration-fast active:scale-95",
          "focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2",
        )}
      >
        <HugeiconsIcon
          icon={open ? Cancel01Icon : CustomerService01Icon}
          size={22}
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}
