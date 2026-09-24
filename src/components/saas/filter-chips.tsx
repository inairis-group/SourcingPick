import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

/**
 * The row of filters above a list.
 *
 * The canvas draws four to six chips, the selected one filled navy and the
 * rest outlined, at 38px tall with a 999px corner. Unlike the marketing site's
 * FAQ chips — which turned out to be a table of contents — these really are
 * filters: the artboards that show a chip selected also show a shorter list
 * under it.
 *
 * They are anchors rather than buttons, so the filtered list is a URL: it can
 * be linked, bookmarked and reloaded, and it works with no JavaScript. The
 * page reads the parameter on the server; nothing here holds state.
 */
export type FilterChip = {
  key: string;
  label: string;
  /** Count shown after the label, where the board draws one. */
  count?: number;
};

export function FilterChips({
  chips,
  current,
  hrefFor,
  label,
  className,
}: {
  chips: readonly FilterChip[];
  /** The selected chip's key. */
  current: string;
  hrefFor: (key: string) => string;
  /** Names the group for a screen reader — "Filter requests by status". */
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {chips.map((chip) => {
        const active = chip.key === current;
        return (
          <Link
            key={chip.key}
            href={hrefFor(chip.key)}
            variant="muted"
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex min-h-9.5 items-center gap-2 rounded-full border px-3.5 text-base font-semibold transition-colors duration-fast",
              active
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-line bg-surface text-fg hover:bg-subtle",
            )}
          >
            {chip.label}
            {chip.count !== undefined && (
              <span className={cn("font-mono text-xs", active ? "text-white/70" : "text-muted")}>
                {chip.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
