import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/i18n/formatters";
import { listPendingReviews } from "@/lib/marketplace/reviews";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { ModerateForm } from "./_components/moderate-form";

/**
 * Review moderation queue.
 *
 * Reviews are never published unseen: one libellous or retaliatory review on a
 * factory's listing is a legal exposure for us, so every one passes a human.
 * Oldest first — a review waiting three days is the problem, not the newest.
 *
 * `listPendingReviews` performs its own admin check, so the guard lives with
 * the data rather than only on the page.
 */
export default async function AdminReviewQueuePage({
  params,
}: PageProps<"/[lang]/admin/marketplace/reviews">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = dict.publicMarketplace as unknown as Record<string, string>;

  const reviews = await listPendingReviews();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-headline mb-6 text-2xl font-bold tracking-tight">
        {t.moderationTitle}
      </h1>

      {reviews.length === 0 ? (
        <p className="border-line bg-surface text-muted rounded-lg border p-8 text-center text-sm">
          {t.moderationEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="border-line bg-surface rounded-lg border p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <RatingStars average={r.rating} count={1} countLabel="" />
                <span className="text-headline text-sm font-semibold">
                  {r.product.name}
                </span>
                <span className="text-faint font-mono text-xs">
                  {r.product.reference}
                </span>
                {r.orderId && (
                  <span className="border-success-edge bg-success-soft text-success inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-semibold">
                    {t.verifiedPurchase}
                  </span>
                )}
              </div>
              {r.title && (
                <p className="text-headline mt-2 text-sm font-semibold">
                  {r.title}
                </p>
              )}
              <p className="text-fg mt-1 text-sm whitespace-pre-wrap">
                {r.body}
              </p>
              <p className="text-faint mt-2 text-xs">
                {r.authorOrg.displayName} · {formatDate(r.createdAt, lang)}
              </p>
              <ModerateForm reviewId={r.id} copy={t} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
