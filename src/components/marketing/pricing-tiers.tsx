import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  CancelCircleIcon,
  UserCircleIcon,
  Factory01Icon,
  StoreManagement01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Pricing v3 cards — per-flow split. See docs/pricing-v2.md.
 *
 * Top of each card: the headline total platform take (5% sourcing,
 * 3% marketplace), shown as a confident hero number rather than
 * buried inside side-by-side rate rows.
 *
 * Below it: a proportional split bar visualising how the total
 * divides between the buyer side and the supplier side, with small
 * chips labelling each. The split bar is read at a glance — partners
 * can verify the math without doing arithmetic.
 *
 * Sourcing card additionally shows the research fee as a secondary
 * info block below the split.
 *
 * All copy in dict.pricing.*; no hardcoded numbers.
 */
export function PricingTiers({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const flows = [
    {
      key: "sourcing" as const,
      featured: true,
      ctaHref: `/${locale}/signup`,
      buyerIcon: ShoppingBag01Icon,
      supplierIcon: Factory01Icon,
    },
    {
      key: "marketplace" as const,
      featured: false,
      ctaHref: `/${locale}/marketplace`,
      buyerIcon: UserCircleIcon,
      supplierIcon: StoreManagement01Icon,
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 lg:pb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {flows.map(({ key, featured, ctaHref, buyerIcon, supplierIcon }, i) => (
          <FlowCard
            key={key}
            flow={dict.pricing.flows[key]}
            featured={featured}
            popularLabel={dict.pricing.popular}
            totalTakeLabel={dict.pricing.totalTakeLabel}
            ctaHref={ctaHref}
            buyerIcon={buyerIcon}
            supplierIcon={supplierIcon}
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      <IncludedExcluded dict={dict} />
    </section>
  );
}

type FlowCopy =
  | Dictionary["pricing"]["flows"]["sourcing"]
  | Dictionary["pricing"]["flows"]["marketplace"];

function FlowCard({
  flow,
  featured,
  popularLabel,
  totalTakeLabel,
  ctaHref,
  buyerIcon,
  supplierIcon,
  style,
}: {
  flow: FlowCopy;
  featured: boolean;
  popularLabel: string;
  totalTakeLabel: string;
  ctaHref: string;
  buyerIcon: typeof ShoppingBag01Icon;
  supplierIcon: typeof Factory01Icon;
  style?: React.CSSProperties;
}) {
  // Parse buyer / supplier rate strings into numeric bps so we can
  // (a) show a derived total and (b) draw the proportional split.
  // Strings look like "4 %" / "4%" in any locale — extract the digit
  // run defensively.
  const buyerPct = parseRate(flow.buyer.rate);
  const supplierPct = parseRate(flow.supplier.rate);
  const totalPct = buyerPct + supplierPct;
  // Use the parsed total as a safety net for missing dict keys; the
  // dict's `totalRate` is the canonical display string per locale.
  const totalDisplay = flow.totalRate ?? `${totalPct} %`;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 lg:p-8",
        "transition-all duration-base ease-default",
        "animate-fade-up",
        "hover:-translate-y-0.5 hover:shadow-md",
        featured
          ? "border-action bg-surface shadow-md ring-1 ring-action/10"
          : "border-line bg-surface",
      )}
      style={style}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-action text-on-action px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          {popularLabel}
        </span>
      )}

      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-info">
          {flow.name}
        </p>
        <p className="mt-2 text-base text-muted leading-snug">{flow.tagline}</p>
      </header>

      {/* Headline total — the number partners read first. */}
      <div className="flex items-end gap-3 mb-5">
        <span className="text-5xl lg:text-6xl font-bold text-headline tracking-tight leading-none tabular-nums">
          {totalDisplay}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-faint pb-2">
          {totalTakeLabel}
        </span>
      </div>

      {/* Proportional split bar — buyer side then supplier side,
          each segment flex-grown by its rate percentage so the
          ratios are visually true (4:1 ↔ 2:1). */}
      <div
        className="h-2 rounded-full overflow-hidden flex bg-line-subtle mb-3"
        role="img"
        aria-label={`${flow.buyer.label} ${flow.buyer.rate} + ${flow.supplier.label} ${flow.supplier.rate}`}
      >
        <span
          className="bg-brand-600 transition-all"
          style={{ flexGrow: buyerPct }}
        />
        <span
          className="bg-brand-300 transition-all"
          style={{ flexGrow: supplierPct }}
        />
      </div>

      {/* Side labels for the split — small chips with icons. */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <SplitChip
          icon={buyerIcon}
          label={flow.buyer.label}
          rate={flow.buyer.rate}
          tone="strong"
          note={flow.buyer.note}
        />
        <SplitChip
          icon={supplierIcon}
          label={flow.supplier.label}
          rate={flow.supplier.rate}
          tone="soft"
          note={flow.supplier.note}
        />
      </div>

      {"research" in flow && flow.research && (
        <div className="rounded-lg border border-dashed border-line bg-page/40 p-3 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
            {flow.research.label}
          </p>
          <p className="text-sm font-semibold text-headline mt-0.5">
            {flow.research.amount}
          </p>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            {flow.research.note}
          </p>
        </div>
      )}

      <div className="mt-auto">
        <Link
          href={ctaHref}
          className={cn(
            buttonClass({
              variant: featured ? "primary" : "secondary",
              size: "md",
              fullWidth: true,
            }),
            "rounded-md",
          )}
        >
          {flow.cta}
        </Link>
      </div>
    </div>
  );
}

function SplitChip({
  icon,
  label,
  rate,
  tone,
  note,
}: {
  icon: typeof ShoppingBag01Icon;
  label: string;
  rate: string;
  tone: "strong" | "soft";
  note: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-3 flex flex-col gap-1",
        tone === "strong"
          ? "bg-info-soft text-info"
          : "bg-subtle text-fg",
      )}
      title={note}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center justify-center h-5 w-5 rounded-sm",
            tone === "strong"
              ? "bg-brand-600 text-on-action"
              : "bg-info-soft text-info",
          )}
        >
          <HugeiconsIcon icon={icon} size={11} strokeWidth={1.75} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold tracking-tight tabular-nums leading-none">
        {rate}
      </p>
    </div>
  );
}

/** Parse a locale-rendered rate string like "4 %" / "4%" / "4 ٪" → 4. */
function parseRate(s: string): number {
  const match = s.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;
  return Number(match[1]!.replace(",", "."));
}

function IncludedExcluded({ dict }: { dict: Dictionary }) {
  return (
    <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      <div
        className="rounded-lg border border-line bg-surface p-6 animate-fade-up"
        style={{ animationDelay: "160ms" }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-success mb-4">
          {dict.pricing.included.title}
        </h3>
        <ul className="flex flex-col gap-3">
          {dict.pricing.included.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-success-soft text-success">
                <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={2.5} />
              </span>
              <span className="text-sm text-fg leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-lg border border-line bg-subtle p-6 animate-fade-up"
        style={{ animationDelay: "220ms" }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">
          {dict.pricing.excluded.title}
        </h3>
        <ul className="flex flex-col gap-3">
          {dict.pricing.excluded.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-full bg-neutral-200 text-muted">
                <HugeiconsIcon icon={CancelCircleIcon} size={12} strokeWidth={2} />
              </span>
              <span className="text-sm text-muted leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
