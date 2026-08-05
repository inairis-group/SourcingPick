import { formatDate } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { RatingStars } from "./rating-stars";

/**
 * Published reviews.
 *
 * The author is the buying ORGANISATION, not a person — the relationship is
 * with the company, and naming individuals on a public page would expose staff
 * of our customers. Country is shown because "verified buyer in Germany"
 * carries weight that a bare company name doesn't.
 */
export function ReviewList({
  reviews,
  lang,
  copy,
}: {
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    body: string;
    createdAt: Date;
    orderId: string | null;
    authorOrg: { displayName: string; country: string };
  }[];
  lang: Locale;
  copy: Record<string, string>;
}) {
  if (reviews.length === 0) {
    return <p className="text-muted text-sm">{copy.reviewsEmpty}</p>;
  }

  return (
    <ul className="flex flex-col gap-5">
      {reviews.map((r) => (
        <li key={r.id} className="border-line-subtle border-b pb-5 last:border-b-0">
          <div className="flex flex-wrap items-center gap-3">
            <RatingStars average={r.rating} count={1} countLabel="" />
            {r.title && (
              <p className="text-headline text-sm font-semibold">{r.title}</p>
            )}
            {/* Presence of a linked order is the whole basis of the badge —
                the id itself is never rendered. */}
            {r.orderId && (
              <span className="border-success-edge bg-success-soft text-success inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold">
                {copy.verifiedPurchase}
              </span>
            )}
          </div>
          <p className="text-fg mt-2 text-sm whitespace-pre-wrap">{r.body}</p>
          <p className="text-faint mt-2 text-xs">
            {r.authorOrg.displayName} · {r.authorOrg.country} ·{" "}
            {formatDate(r.createdAt, lang)}
          </p>
        </li>
      ))}
    </ul>
  );
}
