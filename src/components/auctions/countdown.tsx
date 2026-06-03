"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Auction countdown — updates once a second. Shows days / hours / minutes
 * for long windows, drops to MM:SS on the final 10 minutes, and renders
 * "Ended" once endsAt is in the past.
 *
 * Server passes the ISO-8601 endsAt — we parse client-side so the timer
 * starts ticking with the viewer's clock instead of being frozen at SSR.
 */
export function Countdown({
  endsAt,
  className,
  labels,
}: {
  endsAt: string;
  className?: string;
  labels: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    ended: string;
  };
}) {
  const target = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    // Render a stable placeholder during SSR / first paint to avoid the
    // hydration mismatch a Date.now() call would cause.
    return <span className={className}>—</span>;
  }

  const remaining = target - now;
  if (remaining <= 0) {
    return (
      <span className={cn("text-danger font-medium", className)}>
        {labels.ended}
      </span>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Final 10 minutes → mm:ss precision, otherwise day/hour/minute granularity.
  const urgent = totalSeconds <= 600;
  const tone = urgent ? "text-danger" : "text-headline";

  return (
    <span className={cn("font-mono tabular-nums", tone, className)}>
      {urgent ? (
        <>
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </>
      ) : days > 0 ? (
        <>
          {days}
          {labels.days} {hours}
          {labels.hours} {minutes}
          {labels.minutes}
        </>
      ) : (
        <>
          {hours}
          {labels.hours} {minutes}
          {labels.minutes} {seconds}
          {labels.seconds}
        </>
      )}
    </span>
  );
}
