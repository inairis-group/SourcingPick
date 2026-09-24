import type { ReactNode } from "react";
import { Link } from "@/components/ui/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * A titled card with an optional link in its top-right corner — the canvas's
 * "SLA queue · See all →" construction, which appears on every dashboard and
 * most detail screens.
 *
 * The heading is Unbounded 18px over an optional 13.5px line, and the card
 * itself is the shared one: 22px corner, one hairline, the soft navy lift.
 */
export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={cn("flex flex-col gap-3.5", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="font-display text-headline m-0 text-lg leading-snug font-semibold tracking-[-0.02em]">
            {title}
          </h2>
          {subtitle && <p className="text-muted m-0 text-[13.5px]">{subtitle}</p>}
        </div>
        {action && (
          <Link
            href={action.href}
            variant="inline"
            className="shrink-0 text-base font-semibold whitespace-nowrap"
          >
            {action.label} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
      <div className={cn("flex min-w-0 flex-col", bodyClassName)}>{children}</div>
    </Card>
  );
}

/**
 * What a panel shows when it has nothing to show.
 *
 * The canvas draws this as a single muted line centred in the card's body —
 * "Aucun devis en attente d'envoi." — with no illustration and no button.
 * That restraint is deliberate and worth keeping: an empty queue on an
 * operator's dashboard is good news, not a call to action.
 */
export function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted m-0 py-8 text-center text-base">{children}</p>
  );
}

/**
 * A key/value row — the canvas's detail-card construction: label on the left
 * in muted 14px, value on the right in mono semibold, a hairline beneath.
 */
export function DetailRow({
  label,
  children,
  mono = true,
}: {
  label: ReactNode;
  children: ReactNode;
  /** Values that are prose rather than data are set in the body face. */
  mono?: boolean;
}) {
  return (
    <div className="border-line flex justify-between gap-3.5 border-b py-2.5 text-base last:border-b-0">
      <span className="text-muted shrink-0">{label}</span>
      <span className={cn("text-end font-semibold", mono && "font-mono")}>{children}</span>
    </div>
  );
}
