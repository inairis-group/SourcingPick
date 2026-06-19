import { HugeiconsIcon } from "@hugeicons/react";
import { SecurityCheckIcon } from "@hugeicons/core-free-icons";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Pricing-v3 Phase 4 — small "Insured" pill rendered on the buyer
 * order page (and the quote PDF). Category-specific insurance is
 * included in every order at no extra cost; the badge surfaces that
 * for buyers who'd otherwise miss it in the fine print.
 *
 * Renders nothing if `covered` is false — admins can flip it off
 * per-order for restricted-goods categories.
 */
export function InsuredBadge({
  covered,
  dict,
  size = "sm",
}: {
  covered: boolean;
  dict: Dictionary;
  size?: "sm" | "md";
}) {
  if (!covered) return null;
  const t = dict.orders.insurance;
  const sizing =
    size === "md"
      ? "h-7 px-3 text-xs"
      : "h-5 px-2 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-success-edge bg-success-soft text-success font-medium uppercase tracking-wide whitespace-nowrap ${sizing}`}
      title={t.tooltip}
    >
      <HugeiconsIcon
        icon={SecurityCheckIcon}
        size={size === "md" ? 14 : 12}
        strokeWidth={1.75}
      />
      {t.label}
    </span>
  );
}
