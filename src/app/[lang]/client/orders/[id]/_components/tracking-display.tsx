"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  Link04Icon,
} from "@hugeicons/core-free-icons";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Tracking display for client + admin order detail pages.
 *
 * Per partner feedback #8: the tracking link + number must be easy to
 * click and easy to copy. The previous implementation buried both
 * behind a plain <a> on the number with no copy affordance.
 *
 * - Carrier name renders plain (informational).
 * - Tracking number renders mono, with a one-tap copy button that flips
 *   to a green check for 1.5s on success.
 * - Tracking URL (if present) renders as a primary-styled "Open tracking"
 *   button so the buyer doesn't have to think.
 */
export function TrackingDisplay({
  carrier,
  trackingNumber,
  trackingUrl,
}: {
  carrier: string | null;
  trackingNumber: string;
  trackingUrl: string | null;
}) {
  const dict = useDictionary();
  const t = dict.client.orders.tracking;
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent — value stays selectable for manual copy
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {carrier && (
        <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-xs uppercase tracking-wide text-faint pt-0.5">
            {t.carrierLabel}
          </dt>
          <dd className="text-fg">{carrier}</dd>
        </div>
      )}

      <div className="grid grid-cols-[max-content_1fr_max-content] gap-x-3 items-center text-sm">
        <dt className="text-xs uppercase tracking-wide text-faint">
          {t.numberLabel}
        </dt>
        <dd className="font-mono text-fg break-all min-w-0 select-all">
          {trackingNumber}
        </dd>
        <button
          type="button"
          onClick={onCopy}
          aria-label={t.copyCta}
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
      </div>

      {trackingUrl && (
        <div>
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 h-9 px-3.5 rounded-md text-sm font-medium",
              "bg-action text-on-action hover:bg-action-hover transition-colors duration-fast",
              "focus:outline-2 focus:outline-focus focus:outline-offset-2",
            )}
          >
            <HugeiconsIcon
              icon={Link04Icon}
              size={14}
              strokeWidth={1.5}
            />
            {t.openTrackingCta}
          </a>
        </div>
      )}
    </div>
  );
}
