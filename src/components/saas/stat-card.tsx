import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { NavIcon, type NavIconKey } from "@/components/layout/app-shell/nav-icons";
import { cn } from "@/lib/utils";
import type { StatusTone } from "./status-pill";

/**
 * The four-across row of numbers every dashboard opens with.
 *
 * The canvas draws it as a card at 22px padding: the label and a 38px tinted
 * icon tile on one line, the number under it in Unbounded 34px, and a 38×3px
 * amber rule at the foot. That last mark is on every stat card on every
 * dashboard and carries no information — it is the brand's, the same amber
 * that underlines the marketing headlines.
 *
 * The icon tile takes its tint from the same eight-tone vocabulary the status
 * pills use, which is why a "quotations" stat is violet and an "in transit"
 * stat is teal without anyone choosing it twice.
 */
const TINTS: Record<StatusTone, { fg: string; bg: string }> = {
  new: { fg: "text-[#155DFC]", bg: "bg-[#155DFC14]" },
  quote: { fg: "text-[#7C5CFF]", bg: "bg-[#7C5CFF14]" },
  waiting: { fg: "text-[#D99A00]", bg: "bg-[#D99A0014]" },
  done: { fg: "text-[#0E9F6E]", bg: "bg-[#0E9F6E14]" },
  moving: { fg: "text-[#0B7FA8]", bg: "bg-[#0B7FA814]" },
  closed: { fg: "text-[#0E1A3D]", bg: "bg-[#0E1A3D14]" },
  failed: { fg: "text-[#E02424]", bg: "bg-[#E0242414]" },
  idle: { fg: "text-[#4A5578]", bg: "bg-[#4A557814]" },
};

export function StatCard({
  label,
  value,
  icon,
  tone = "new",
  note,
}: {
  label: ReactNode;
  value: ReactNode;
  icon: NavIconKey;
  tone?: StatusTone;
  /** The small line some boards put under the number. */
  note?: ReactNode;
}) {
  const t = TINTS[tone];
  return (
    <Card className="flex flex-col gap-3.5 p-[22px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted text-base">{label}</span>
        <span
          className={cn("inline-flex size-9.5 items-center justify-center rounded-xl", t.bg, t.fg)}
        >
          <NavIcon name={icon} />
        </span>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="font-display text-headline text-[34px] leading-none font-bold tracking-[-0.03em]">
          {value}
        </span>
      </div>
      {note && <span className="text-muted text-sm">{note}</span>}
      {/* Brand mark, not data. */}
      <span aria-hidden="true" className="bg-amber-edge h-[3px] w-9.5 rounded-sm" />
    </Card>
  );
}

/** The four-column grid the canvas lays stat cards out in. */
export function StatRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
  );
}
