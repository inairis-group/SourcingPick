import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Marketplace de-emphasis (Pricing-v3 Phase 2). Static banner explaining
 * that the catalogue is intentionally narrow while we expand — and that
 * only physically-tested products are shown. Renders above the
 * marketplace grid on both the marketing page and the buyer's authed
 * catalogue. No dismiss control — the message is a permanent context-
 * setter for the v1 launch window.
 */
export function MarketplaceInDevelopmentBanner({
  dict,
}: {
  dict: Dictionary;
}) {
  const t = dict.client.marketplace.inDevelopment;
  return (
    <div className="mb-6 rounded-lg border border-info-edge bg-info-soft/40 px-4 py-3 flex items-start gap-3">
      <HugeiconsIcon
        icon={Settings01Icon}
        size={18}
        strokeWidth={1.5}
        className="text-info shrink-0 mt-0.5"
      />
      <div className="text-sm text-fg">
        <p className="font-semibold text-headline">{t.title}</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.body}</p>
      </div>
    </div>
  );
}
