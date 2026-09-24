import type { ReactNode } from "react";
import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

/**
 * The list every section of the canvas is built around.
 *
 * The table itself is transcribed: headers in JetBrains Mono at 11.5px,
 * uppercase with 0.07em of tracking, no rule under them; rows separated by a
 * single #DCE3F2 line drawn on the *top* of each cell, so the last row has no
 * trailing rule; 14px of vertical padding and none horizontally, which is
 * what makes the first column sit flush with the card's edge.
 *
 * Below `md` it stops being a table. That is the one part with no artboard
 * behind it — the canvas is drawn at 1440px and never asked the question —
 * and a six-column table on a 360px screen has only bad answers: a horizontal
 * scroller hides the columns that matter, and squeezing turns every cell into
 * two words per line. So each row becomes a card: the column marked `primary`
 * is its heading, and the rest are label/value pairs underneath. The markup is
 * rendered twice rather than reflowed with CSS, because a `<td>` cannot carry
 * its own header's text and a screen reader needs the pairing either way.
 */
export type Column<T> = {
  key: string;
  header: string;
  /** The canvas gives explicit percentages; they only apply to the table. */
  width?: string;
  cell: (row: T) => ReactNode;
  /** The card's heading on a phone. Exactly one column should set it. */
  primary?: boolean;
  /**
   * Left off the card. Use it for a trailing "Open" link, which the card
   * replaces by making the whole thing tappable.
   */
  hideOnCard?: boolean;
  /** Right-align in the table — amounts, mostly. */
  align?: "start" | "end";
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
  empty,
  caption,
}: {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  /** Makes the phone card tappable, and is otherwise unused. */
  rowHref?: (row: T) => string;
  /** Shown instead of the table when there is nothing. */
  empty: ReactNode;
  /** Describes the table for a screen reader; never shown. */
  caption: string;
}) {
  if (rows.length === 0) return <>{empty}</>;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnCard);

  return (
    <>
      <table className="hidden w-full border-collapse md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={c.width ? { width: c.width } : undefined}
                className={cn(
                  "text-muted pb-3 font-mono text-[11.5px] font-semibold tracking-[0.07em] uppercase",
                  c.align === "end" ? "text-end" : "text-start",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "border-line text-fg border-t py-3.5 align-middle text-[14.5px]",
                    c.align === "end" ? "text-end" : "text-start",
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="m-0 flex list-none flex-col gap-0 p-0 md:hidden">
        {rows.map((row, i) => {
          const href = rowHref?.(row);
          const body = (
            <>
              <span className="text-fg text-md font-semibold">{primary.cell(row)}</span>
              <span className="flex flex-col gap-1.5">
                {rest.map((c) => (
                  <span key={c.key} className="flex items-baseline justify-between gap-3">
                    <span className="text-muted shrink-0 font-mono text-[11.5px] font-semibold tracking-[0.07em] uppercase">
                      {c.header}
                    </span>
                    <span className="text-fg min-w-0 text-end text-base">{c.cell(row)}</span>
                  </span>
                ))}
              </span>
            </>
          );
          return (
            <li
              key={rowKey(row)}
              className={cn("border-line py-3.5", i > 0 && "border-t")}
            >
              {href ? (
                <Link href={href} variant="muted" className="flex flex-col gap-2.5">
                  {body}
                </Link>
              ) : (
                <div className="flex flex-col gap-2.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** A reference in the canvas's mono face — the first cell of most lists. */
export function Ref({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[13.5px] font-semibold">{children}</span>;
}

/** A date, which the canvas always sets in mono at 13px and muted. */
export function Stamp({ children }: { children: ReactNode }) {
  return <span className="text-muted font-mono text-sm">{children}</span>;
}
