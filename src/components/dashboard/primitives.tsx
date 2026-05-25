import type { ReactNode } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

/**
 * Tiny dashboard primitives — kept in one file because they're all small
 * and they're only used by the four role dashboards. Each one is a pure
 * server component (no client state) so dashboards stay fast.
 */

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "warning" | "success" | "danger" | "info";
  icon?: IconSvgElement;
  href?: string;
}) {
  const toneClasses = {
    neutral: "text-headline",
    warning: "text-warning",
    success: "text-success",
    danger: "text-danger",
    info: "text-info",
  }[tone];

  const card = (
    <article
      className={cn(
        "group rounded-lg border border-line bg-surface p-4 flex flex-col gap-2 h-full",
        "transition-colors duration-fast",
        href && "hover:bg-subtle cursor-pointer",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
          {label}
        </p>
        {icon && (
          <HugeiconsIcon
            icon={icon}
            size={16}
            strokeWidth={1.5}
            className="text-faint"
          />
        )}
      </div>
      <p className={cn("text-2xl font-bold leading-none mt-auto", toneClasses)}>
        {value}
      </p>
      {/* Hint slot is always rendered so cards in the same grid match height. */}
      <p className="text-[11px] text-muted leading-snug min-h-[1.05em]">
        {hint ?? " "}
      </p>
    </article>
  );

  if (href) {
    return (
      <Link href={href} variant="muted" className="block">
        {card}
      </Link>
    );
  }
  return card;
}

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-line bg-surface", className)}>
      <header className="flex items-start justify-between gap-3 px-5 py-3 border-b border-line-subtle">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-headline">{title}</h2>
          {description && (
            <p className="text-xs text-muted mt-0.5">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyRow({ label }: { label: string }) {
  return (
    <p className="text-sm text-faint text-center py-4">{label}</p>
  );
}

/**
 * Stacked list of "item with right-side metadata", used in dashboards for
 * recent activity and quick lists. Keeps the visual rhythm consistent
 * between roles.
 */
export function ActivityList<T>({
  items,
  empty,
  render,
}: {
  items: T[];
  empty: string;
  render: (item: T) => ReactNode;
}) {
  if (items.length === 0) return <EmptyRow label={empty} />;
  return (
    <ul className="flex flex-col divide-y divide-line-subtle -my-2.5">
      {items.map((item, i) => (
        <li key={i} className="py-2.5">
          {render(item)}
        </li>
      ))}
    </ul>
  );
}

export function DashboardHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div className="flex flex-col gap-1 min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold text-headline tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="w-full md:w-auto flex-shrink-0">{actions}</div>}
    </header>
  );
}
