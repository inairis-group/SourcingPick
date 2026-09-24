import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The line every screen opens with: the title on the left, whatever you can
 * do about it on the right.
 *
 * The canvas draws it as a 24px-gapped row with the actions held to their
 * natural width and the heading taking the rest, an Unbounded 30px title over
 * an optional 15px line. Below `sm` the two halves stack — there is no
 * artboard for that, but 30px of Unbounded next to a 44px button does not fit
 * in 360px, and dropping the action below the title is the only arrangement
 * that keeps both legible.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  status,
  actions,
  className,
}: {
  /** Small mono line above the title, on the boards that carry one. */
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** A status pill, which the canvas puts on the right beside the actions. */
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && (
          <span className="text-muted font-mono text-xs font-semibold tracking-wide uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-headline m-0 text-3xl leading-[1.2] font-semibold tracking-[-0.02em]">
          {title}
        </h1>
        {subtitle && <p className="text-muted m-0 text-md leading-normal">{subtitle}</p>}
      </div>
      {(status || actions) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {status}
          {actions}
        </div>
      )}
    </div>
  );
}
