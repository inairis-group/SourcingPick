import { cn } from "@/lib/utils";

/**
 * The status pill, counted off the canvas rather than invented.
 *
 * Every board that shows a state uses the same construction: a 7px dot, the
 * label, a 999px corner, and one colour used twice — at full strength for the
 * text and the dot, and at `14` hex (about 8%) for the ground. Across all
 * fifty boards exactly eight colours appear, and each one means something:
 *
 *   blue    something has just arrived, or is being qualified
 *   violet  a quotation is in play
 *   amber   we are waiting on somebody — to pay, to sign, to send funds
 *   green   a step passed: received, inspected, paid, signed
 *   teal    it is moving — loaded, at sea, clearing customs
 *   navy    finished and closed
 *   red     cancelled, refused, or late
 *   grey    expired or idle
 *
 * The 8% ground is written as a separate token per tone rather than composed
 * with a colour-mix, because these are the exact values the artboards use and
 * a computed tint lands a shade off.
 */
export type StatusTone =
  | "new"
  | "quote"
  | "waiting"
  | "done"
  | "moving"
  | "closed"
  | "failed"
  | "idle";

const TONES: Record<StatusTone, { fg: string; bg: string }> = {
  new: { fg: "text-[#155DFC]", bg: "bg-[#155DFC14]" },
  quote: { fg: "text-[#7C5CFF]", bg: "bg-[#7C5CFF14]" },
  waiting: { fg: "text-[#D99A00]", bg: "bg-[#D99A0014]" },
  done: { fg: "text-[#0E9F6E]", bg: "bg-[#0E9F6E14]" },
  moving: { fg: "text-[#0B7FA8]", bg: "bg-[#0B7FA814]" },
  closed: { fg: "text-[#0E1A3D]", bg: "bg-[#0E1A3D14]" },
  failed: { fg: "text-[#E02424]", bg: "bg-[#E0242414]" },
  idle: { fg: "text-[#4A5578]", bg: "bg-[#4A557814]" },
};

/**
 * `size` is the same pill at the two scales the canvas draws it: `sm` in a
 * table cell, `md` beside a page title. Nothing else differs between them.
 */
export function StatusPill({
  tone,
  children,
  size = "sm",
  dot = true,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  size?: "sm" | "md";
  /** The canvas drops the dot on the squared-off badge used for documents. */
  dot?: boolean;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] rounded-full font-semibold whitespace-nowrap",
        size === "sm" ? "px-[11px] py-1 text-xs" : "px-[11px] py-1.5 text-sm",
        t.fg,
        t.bg,
        className,
      )}
    >
      {dot && <span aria-hidden="true" className="size-[7px] rounded-full bg-current" />}
      {children}
    </span>
  );
}

/**
 * The squared-off variant, used where a document's state sits next to its
 * title: 8px corner, no dot, a shade larger text.
 */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold whitespace-nowrap",
        t.fg,
        t.bg,
        className,
      )}
    >
      {children}
    </span>
  );
}
