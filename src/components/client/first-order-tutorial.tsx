"use client";

import { useEffect, useLayoutEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  InvoiceIcon,
  PackageIcon,
  ShoppingBag01Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { dismissClientTutorialAction } from "@/lib/client/tutorial-actions";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * First-order onboarding tutorial — partner #16.
 *
 * Guided spotlight tour: each step references a real UI element on
 * the dashboard / shell, dims everything else, and pops a callout
 * card next to the highlighted region.
 *
 * Targets are referenced by `data-tour` attributes:
 *   - "marketplace"     → bottom-pill marketplace link
 *   - "new-request"     → header "+ New request" CTA
 *   - "active-orders"   → kpiActiveOrders KpiCard
 *   - "awaiting-payment"→ kpiAwaitingPayment KpiCard (escrow concept)
 *
 * If a target isn't found on the current page (smaller breakpoint,
 * something rendered conditionally), the callout falls back to a
 * centered modal-style position with a full-viewport dim.
 *
 * Mounted via `createPortal(document.body)` so the spotlight can
 * cover anything regardless of stacking context. Renders only when
 * `User.clientTutorialDismissedAt` is null.
 */
export function FirstOrderTutorial() {
  const dict = useDictionary();
  const t = dict.client.tutorial;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [_, startTransition] = useTransition();

  const steps = [
    {
      target: '[data-tour="marketplace"]',
      icon: Store01Icon,
      title: t.step1Title,
      body: t.step1Body,
    },
    {
      target: '[data-tour="new-request"]',
      icon: ShoppingBag01Icon,
      title: t.step2Title,
      body: t.step2Body,
    },
    {
      target: '[data-tour="active-orders"]',
      icon: PackageIcon,
      title: t.step3Title,
      body: t.step3Body,
    },
    {
      target: '[data-tour="awaiting-payment"]',
      icon: InvoiceIcon,
      title: t.step4Title,
      body: t.step4Body,
    },
  ] as const;

  // Wait one render so `document` is available before attempting to
  // resolve targets / portal the overlay.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-resolve target rect on every step change + on resize + scroll.
  // `useLayoutEffect` is paired with the first `setRect` so the
  // callout renders at the right position from frame one.
  useLayoutEffect(() => {
    if (hidden || !mounted) return;
    const current = steps[step];
    if (!current) return;

    const compute = () => {
      const target = document.querySelector<HTMLElement>(current.target);
      if (!target) {
        setRect(null);
        return;
      }
      const r = target.getBoundingClientRect();
      setRect(r);

      // Scroll the target into view if it's clipped — handles cases
      // where the bottom-pill or a KPI is below the fold.
      const vh = window.innerHeight;
      const isClipped = r.top < 16 || r.bottom > vh - 16;
      if (isClipped) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };

    compute();
    // One delayed re-check after the smooth-scroll settles so the
    // callout lands on the final rect, not the pre-scroll one.
    const id = window.setTimeout(compute, 350);

    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, {
      passive: true,
      capture: true,
    });
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [step, hidden, mounted]);

  if (hidden || !mounted) return null;

  const current = steps[step]!;

  const dismiss = () => {
    setPending(true);
    startTransition(async () => {
      await dismissClientTutorialAction();
      setPending(false);
      setHidden(true);
      router.refresh();
    });
  };

  // Callout positioning — pick the side with the most room around
  // the target, then clamp to the viewport so the card never spills
  // off-screen. The "ARROW" gap is the visible offset between the
  // target rect and the callout edge.
  const HOLE_PADDING = 10;
  const ARROW = 14;
  const CALLOUT_WIDTH = 380;
  const CALLOUT_HEIGHT_EST = 240; // approximation; only used to choose side
  const VIEWPORT_PAD = 12;

  let calloutTop = 0;
  let calloutLeft = 0;
  let arrowSide: "top" | "bottom" | "left" | "right" | null = null;
  let isCentered = false;

  if (rect && typeof window !== "undefined") {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = vw - rect.right;
    const spaceLeft = rect.left;

    // Prefer below → above → right → left.
    if (spaceBelow >= CALLOUT_HEIGHT_EST + ARROW + VIEWPORT_PAD) {
      arrowSide = "top";
      calloutTop = rect.bottom + ARROW;
      calloutLeft = rect.left + rect.width / 2 - CALLOUT_WIDTH / 2;
    } else if (spaceAbove >= CALLOUT_HEIGHT_EST + ARROW + VIEWPORT_PAD) {
      arrowSide = "bottom";
      calloutTop = rect.top - ARROW - CALLOUT_HEIGHT_EST;
      calloutLeft = rect.left + rect.width / 2 - CALLOUT_WIDTH / 2;
    } else if (spaceRight >= CALLOUT_WIDTH + ARROW + VIEWPORT_PAD) {
      arrowSide = "left";
      calloutTop = rect.top + rect.height / 2 - CALLOUT_HEIGHT_EST / 2;
      calloutLeft = rect.right + ARROW;
    } else if (spaceLeft >= CALLOUT_WIDTH + ARROW + VIEWPORT_PAD) {
      arrowSide = "right";
      calloutTop = rect.top + rect.height / 2 - CALLOUT_HEIGHT_EST / 2;
      calloutLeft = rect.left - ARROW - CALLOUT_WIDTH;
    } else {
      // Nowhere to put it — fall through to centered.
      isCentered = true;
    }

    if (!isCentered) {
      calloutLeft = Math.min(
        Math.max(calloutLeft, VIEWPORT_PAD),
        vw - CALLOUT_WIDTH - VIEWPORT_PAD,
      );
      calloutTop = Math.min(
        Math.max(calloutTop, VIEWPORT_PAD),
        vh - VIEWPORT_PAD,
      );
    }
  } else {
    isCentered = true;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-modal"
      role="dialog"
      aria-modal="true"
      aria-label={t.eyebrow}
    >
      {/* Spotlight cutout. When we have a target rect, an empty box
          sits over it with a massive box-shadow that paints the
          surrounding dim — the inside stays transparent, so the
          target shows through. With no target, we draw a regular
          backdrop instead. The 600ms transition smooths step changes
          so the hole "glides" between elements. */}
      {rect ? (
        <div
          aria-hidden
          className={cn(
            "absolute pointer-events-none",
            "transition-all duration-slow ease-emphasize",
          )}
          style={{
            top: rect.top - HOLE_PADDING,
            left: rect.left - HOLE_PADDING,
            width: rect.width + HOLE_PADDING * 2,
            height: rect.height + HOLE_PADDING * 2,
            borderRadius: 12,
            boxShadow:
              "rgba(2, 6, 23, 0.55) 0 0 0 9999px, var(--color-brand-600, #2563eb) 0 0 0 2px inset",
          }}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-overlay pointer-events-none"
        />
      )}

      {/* Callout card */}
      <div
        className={cn(
          "absolute pointer-events-auto",
          "bg-page rounded-lg border border-line shadow-lg",
          "p-5 w-95 max-w-[calc(100vw-1.5rem)]",
          "transition-all duration-slow ease-emphasize",
        )}
        style={
          isCentered
            ? {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }
            : { top: calloutTop, left: calloutLeft }
        }
      >
        {/* Pointer arrow — only when anchored next to a target. */}
        {arrowSide && !isCentered && rect && (
          <CalloutArrow
            side={arrowSide}
            targetCenterX={rect.left + rect.width / 2 - calloutLeft}
            targetCenterY={rect.top + rect.height / 2 - calloutTop}
          />
        )}

        <header className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-700">
              <HugeiconsIcon
                icon={current.icon}
                size={16}
                strokeWidth={1.5}
              />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                {t.eyebrow} · {step + 1} / {steps.length}
              </p>
              <h2 className="text-base font-semibold text-headline">
                {current.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            disabled={pending}
            aria-label={t.dismissAria}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-fg"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.75} />
          </button>
        </header>

        <p className="text-sm text-fg leading-snug mb-4">{current.body}</p>

        <ol className="flex items-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <li
              key={i}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "h-1.5 rounded-full transition-all duration-base",
                i === step ? "w-8 bg-brand-700" : "w-1.5 bg-brand-200",
              )}
            />
          ))}
        </ol>

        <div className="flex items-center justify-end gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              disabled={pending}
            >
              {t.backCta}
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
              disabled={pending}
            >
              {t.nextCta}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={dismiss}
              loading={pending}
            >
              {t.finishCta}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Tiny CSS-triangle arrow on the side of the callout pointing toward
 * the highlighted target. `targetCenter{X,Y}` are coords RELATIVE TO
 * the callout's top-left so we can pin the arrow to the target's
 * midpoint along the matching axis (clamped so it doesn't wander off
 * the callout's edge).
 */
function CalloutArrow({
  side,
  targetCenterX,
  targetCenterY,
}: {
  side: "top" | "bottom" | "left" | "right";
  targetCenterX: number;
  targetCenterY: number;
}) {
  const SIZE = 9;
  // Inset so the arrow doesn't sit at the very corner of the
  // callout (which would look broken when the target is far off).
  const EDGE_PAD = 18;

  const common: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
  };

  if (side === "top") {
    return (
      <span
        aria-hidden
        style={{
          ...common,
          top: -SIZE,
          left: clamp(targetCenterX - SIZE, EDGE_PAD, 380 - EDGE_PAD - SIZE * 2),
          borderLeft: `${SIZE}px solid transparent`,
          borderRight: `${SIZE}px solid transparent`,
          borderBottom: `${SIZE}px solid var(--color-line)`,
          // Inner triangle to cover the border seam
          filter: "drop-shadow(0 -1px 0 var(--color-page))",
        }}
      />
    );
  }
  if (side === "bottom") {
    return (
      <span
        aria-hidden
        style={{
          ...common,
          bottom: -SIZE,
          left: clamp(targetCenterX - SIZE, EDGE_PAD, 380 - EDGE_PAD - SIZE * 2),
          borderLeft: `${SIZE}px solid transparent`,
          borderRight: `${SIZE}px solid transparent`,
          borderTop: `${SIZE}px solid var(--color-line)`,
          filter: "drop-shadow(0 1px 0 var(--color-page))",
        }}
      />
    );
  }
  if (side === "left") {
    return (
      <span
        aria-hidden
        style={{
          ...common,
          left: -SIZE,
          top: clamp(targetCenterY - SIZE, EDGE_PAD, 240 - EDGE_PAD - SIZE * 2),
          borderTop: `${SIZE}px solid transparent`,
          borderBottom: `${SIZE}px solid transparent`,
          borderRight: `${SIZE}px solid var(--color-line)`,
          filter: "drop-shadow(-1px 0 0 var(--color-page))",
        }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{
        ...common,
        right: -SIZE,
        top: clamp(targetCenterY - SIZE, EDGE_PAD, 240 - EDGE_PAD - SIZE * 2),
        borderTop: `${SIZE}px solid transparent`,
        borderBottom: `${SIZE}px solid transparent`,
        borderLeft: `${SIZE}px solid var(--color-line)`,
        filter: "drop-shadow(1px 0 0 var(--color-page))",
      }}
    />
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
