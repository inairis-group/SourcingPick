import { cn } from "@/lib/utils";

/**
 * Star rating.
 *
 * Renders nothing when a listing has no reviews — an unrated product showing
 * five empty stars reads as "rated zero", which is worse than showing no
 * rating at all. Callers pass `average === null` for that case.
 *
 * The stars are `aria-hidden` and the real value goes in a text label, because
 * a screen reader announcing "star star star" ten times is noise.
 */
export function RatingStars({
  average,
  count,
  countLabel,
  size = "sm",
  className,
}: {
  average: number | null;
  count: number;
  countLabel: string;
  size?: "sm" | "md";
  className?: string;
}) {
  if (average === null || count === 0) return null;

  const dim = size === "md" ? "h-4 w-4" : "h-3 w-3";
  const filled = Math.round(average);

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-label={`${average} / 5 — ${count} ${countLabel}`}
    >
      <span aria-hidden className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={cn(dim, i <= filled ? "text-warning" : "text-line")}
            fill="currentColor"
          >
            <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.1 6.1 20.2l1.2-6.6L2.5 9l6.6-.9L12 2z" />
          </svg>
        ))}
      </span>
      <span
        className={cn(
          "text-muted tabular-nums",
          size === "md" ? "text-sm" : "text-xs",
        )}
      >
        {average.toFixed(1)}{" "}
        <span className="text-faint">({count})</span>
      </span>
    </span>
  );
}
