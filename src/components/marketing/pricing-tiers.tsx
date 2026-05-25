import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Pricing model v2 — see docs/pricing-v2.md.
 *
 * Two flows, each shown as a card. Within each card we show the buyer side,
 * the supplier side, and (for sourcing only) the research fee.
 *
 * Values here come from dict.pricing.* — backed by the spec deviation locked
 * in docs/pricing-v2.md. Do NOT hardcode numbers inline.
 */
export function PricingTiers({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const flows = [
    { key: "sourcing" as const, featured: true, ctaHref: `/${locale}/signup` },
    { key: "marketplace" as const, featured: false, ctaHref: `/${locale}/marketplace` },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {flows.map(({ key, featured, ctaHref }) => (
          <FlowCard
            key={key}
            flow={dict.pricing.flows[key]}
            featured={featured}
            popularLabel={dict.pricing.popular}
            ctaHref={ctaHref}
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
  ctaHref,
}: {
  flow: FlowCopy;
  featured: boolean;
  popularLabel: string;
  ctaHref: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border p-6 lg:p-8",
        featured ? "border-action bg-surface shadow-md" : "border-line bg-surface",
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-action text-on-action px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          {popularLabel}
        </span>
      )}

      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {flow.name}
        </p>
        <p className="mt-2 text-base text-muted leading-snug">{flow.tagline}</p>
      </header>

      <div className="space-y-5 mb-8">
        <PriceRow
          label={flow.buyer.label}
          rate={flow.buyer.rate}
          cap={flow.buyer.cap}
          note={flow.buyer.note}
          featured={featured}
        />
        <PriceRow
          label={flow.supplier.label}
          rate={flow.supplier.rate}
          cap={flow.supplier.cap}
          note={flow.supplier.note}
          featured={featured}
        />
        {"research" in flow && flow.research && (
          <PriceRow
            label={flow.research.label}
            rate={flow.research.amount}
            cap={flow.research.cap}
            note={flow.research.note}
            featured={featured}
          />
        )}
      </div>

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

function PriceRow({
  label,
  rate,
  cap,
  note,
  featured,
}: {
  label: string;
  rate: string;
  cap: string | null;
  note: string;
  featured: boolean;
}) {
  return (
    <div className="border-t border-line-subtle pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">
          {label}
        </p>
        <div className="flex items-baseline gap-2 text-end">
          <span
            className={cn(
              "text-2xl font-bold tracking-tight",
              featured ? "text-headline" : "text-headline",
            )}
          >
            {rate}
          </span>
          {cap && <span className="text-xs text-muted whitespace-nowrap">{cap}</span>}
        </div>
      </div>
      <p className="text-sm text-muted leading-snug">{note}</p>
    </div>
  );
}

function IncludedExcluded({ dict }: { dict: Dictionary }) {
  return (
    <div className="mt-12 lg:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      <div className="rounded-lg border border-line bg-surface p-6">
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

      <div className="rounded-lg border border-line bg-subtle p-6">
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
