"use client";

import { useEffect, useState } from "react";

/**
 * Compact countdown for flash-sale badges: "12d 04h", "03h 17m", "47m 12s".
 *
 * Self-contained client component — keeps the parent badge a server
 * component. Picks a tick cadence based on how much time is left:
 *   • ≥ 1h → tick every minute (the seconds-changing wouldn't be visible
 *            on a "Xd Yh" / "Xh Ym" display anyway, no point burning
 *            renders)
 *   • < 1h → tick every second so users see the urgency
 *
 * Returns `null` once the deadline has passed — the listing card hides
 * the badge entirely in that case (parent decides via `flashActive`).
 */
export function FlashCountdown({ endsAt }: { endsAt: Date }) {
  const target = endsAt.getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    // Compute fresh on mount in case hydration was stale (e.g. user
    // navigated back to a cached page).
    setRemaining(target - Date.now());

    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = (msLeft: number) => {
      if (stopped) return;
      // Fine cadence in the last hour, coarse outside it.
      const delay = msLeft > 60 * 60 * 1000 ? 60_000 : 1_000;
      timer = setTimeout(() => {
        const next = target - Date.now();
        setRemaining(next);
        if (next > 0) schedule(next);
      }, delay);
    };

    schedule(target - Date.now());

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [target]);

  if (remaining <= 0) return null;
  return (
    <span className="font-mono normal-case opacity-90 ms-0.5">
      {format(remaining)}
    </span>
  );
}

function format(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(totalSeconds / 86_400);
  const h = Math.floor((totalSeconds % 86_400) / 3_600);
  const m = Math.floor((totalSeconds % 3_600) / 60);
  const s = totalSeconds % 60;
  if (d > 0) return `${d}d ${pad(h)}h`;
  if (h > 0) return `${h}h ${pad(m)}m`;
  return `${m}m ${pad(s)}s`;
}

const pad = (n: number) => String(n).padStart(2, "0");
