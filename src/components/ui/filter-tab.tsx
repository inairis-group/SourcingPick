import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

/**
 * Filter-tab pill — the small rounded-full links that switch between
 * tabs of a filtered list (admin invoices, quotes, messages, support
 * queue, etc.).
 *
 * Shared instead of redeclared in each page file so the motion +
 * sizing tokens stay consistent. Motion: smooth color transition on
 * hover, a subtle scale-press on click, gentle lift in the inactive
 * state (drops to flat once active).
 *
 * Two sizes:
 *   - md (default) → h-8 px-3, the common one used on list-filter rows
 *   - sm           → h-7 px-2.5, used on dense table filters (admin invoices)
 *
 * `count` is optional — when set, renders a small badge after the
 * label (used by admin/support to show queue depth per status).
 */
export function FilterTab({
  href,
  active,
  label,
  count,
  size = "md",
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={href}
      variant="muted"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        "transition-all duration-base ease-default",
        // Click feedback — the pill briefly shrinks under the cursor.
        "active:scale-95",
        size === "md"
          ? "h-8 px-3 text-xs"
          : "h-7 px-2.5 text-[11px]",
        active
          ? "bg-action text-on-action shadow-sm"
          : "bg-subtle text-muted hover:text-fg hover:bg-line-subtle",
      )}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-mono",
            "transition-colors duration-base",
            active ? "bg-on-action/20" : "bg-line",
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
