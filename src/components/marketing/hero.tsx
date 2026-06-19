import { HugeiconsIcon } from "@hugeicons/react";
import {
  Factory01Icon,
  PackageIcon,
  SecurityCheckIcon,
  StoreManagement01Icon,
  WalletDoneIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Landing-page hero.
 *
 * Left column: the same headline + dual-CTA stack as before, with
 * each piece arriving on its own stagger-fade so the hero composes
 * piece-by-piece on load instead of as one block.
 *
 * Right column (lg+): a "live platform" composition built from the
 * same UI tokens we ship on the real product — an Order card, an
 * Insured badge, a Tested-✓ pill, an example factory profile, etc.
 * Stock illustration energy intentionally avoided; the right side
 * reads as "the platform exists and looks like this," not "here's a
 * vector man holding a box."
 *
 * Hidden below lg to keep the mobile hero focused on the message.
 */
export function Hero({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle brand-tinted radial. Same as before. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/40 to-page pointer-events-none"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Copy column */}
          <div className="lg:col-span-7">
            <p
              className="text-sm font-medium text-brand-700 tracking-wide uppercase mb-4 animate-fade-up"
              style={{ animationDelay: "0ms" }}
            >
              {dict.marketing.hero.eyebrow}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-headline tracking-tight leading-tight animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              {dict.marketing.hero.title}
            </h1>
            <p
              className="mt-6 text-lg sm:text-xl text-muted max-w-2xl leading-relaxed animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              {dict.marketing.hero.subtitle}
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href={`/${locale}/signup`}
                className={buttonClass({ variant: "primary", size: "lg" })}
              >
                {dict.marketing.hero.ctaPrimary}
              </Link>
              <Link
                href={`/${locale}/marketplace`}
                className={buttonClass({ variant: "secondary", size: "lg" })}
              >
                {dict.marketing.hero.ctaSecondary}
              </Link>
            </div>

            <p
              className="mt-6 text-sm text-faint animate-fade-up"
              style={{ animationDelay: "320ms" }}
            >
              {dict.marketing.hero.assurance}
            </p>
          </div>

          {/* Composition column — lg+ only. */}
          <div
            aria-hidden
            className="hidden lg:block lg:col-span-5 relative h-105 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            {/* Soft brand aura behind the cards. */}
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-brand-100/70 via-brand-50/50 to-transparent blur-2xl" />

            {/* Decorative dot grid. */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(var(--color-line-strong) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* The composition. Each card uses real UI tokens; the
                gentle floating animation is paused under reduced-
                motion via globals.css. */}
            <div className="relative h-full">
              <OrderCard className="absolute top-2 inset-s-2 hero-float-slow" />
              <TestedPill className="absolute top-8 inset-e-4 hero-float-mid" />
              <InsuredPill className="absolute top-28 inset-e-2 hero-float-fast" />
              <FactoryCard className="absolute bottom-16 inset-s-6 hero-float-mid" />
              <PayoutChip className="absolute bottom-4 inset-e-8 hero-float-slow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrderCard({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "w-64 rounded-xl border border-line bg-page shadow-lg p-4 flex flex-col gap-2",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wide text-faint">
            ORD-58127
          </p>
          <p className="text-sm font-semibold text-headline">
            Stainless-steel kettles · 1 200 u
          </p>
        </div>
        <span className="inline-flex items-center h-5 px-2 rounded-full border border-warning-edge bg-warning-soft text-warning text-[10px] font-medium uppercase tracking-wide whitespace-nowrap">
          QC
        </span>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1">
          <HugeiconsIcon icon={PackageIcon} size={12} strokeWidth={1.5} />
          ETA 23 d
        </span>
        <span className="text-faint">·</span>
        <span>DAP · Geodis</span>
      </div>
      <div className="h-1.5 rounded-full bg-line-subtle overflow-hidden mt-1">
        <span
          className="block h-full bg-action"
          style={{ width: "62%" }}
        />
      </div>
    </article>
  );
}

function TestedPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-7 px-3 rounded-full border border-success-edge bg-success-soft text-success text-[11px] font-semibold uppercase tracking-wide shadow-sm",
        className,
      )}
    >
      <HugeiconsIcon icon={SecurityCheckIcon} size={12} strokeWidth={1.75} />
      Tested ✓
    </span>
  );
}

function InsuredPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-7 px-3 rounded-full border border-info-edge bg-info-soft text-info text-[11px] font-semibold uppercase tracking-wide shadow-sm",
        className,
      )}
    >
      <HugeiconsIcon icon={SecurityCheckIcon} size={12} strokeWidth={1.75} />
      Insured
    </span>
  );
}

function FactoryCard({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "w-56 rounded-xl border border-line bg-page shadow-md p-3 flex items-center gap-3",
        className,
      )}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        <HugeiconsIcon icon={Factory01Icon} size={16} strokeWidth={1.5} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-headline truncate">
          Shenzhen Acme Mfg
        </p>
        <p className="text-[11px] text-muted">CN · Verified · 14d MOQ 1 000</p>
      </div>
    </article>
  );
}

function PayoutChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 h-9 px-3 rounded-full bg-page border border-line shadow-md",
        className,
      )}
    >
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-success-soft text-success">
        <HugeiconsIcon icon={WalletDoneIcon} size={12} strokeWidth={1.75} />
      </span>
      <span className="text-[11px] font-semibold text-fg">Escrow released</span>
      <span className="text-[11px] text-muted tabular-nums">€18,420</span>
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-subtle text-muted">
        <HugeiconsIcon
          icon={StoreManagement01Icon}
          size={12}
          strokeWidth={1.5}
        />
      </span>
    </span>
  );
}
