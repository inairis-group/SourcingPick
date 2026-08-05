"use client";

import { useActionState, useState } from "react";
import { submitMarketplaceReview } from "@/lib/marketplace/reviews";
import { cn } from "@/lib/utils";

/**
 * Review submission.
 *
 * The rating is a radio group, not a select or a hover-star widget: it has to
 * be keyboard-reachable and announce its value, and five radios do that for
 * free. Stars are the visual layer over them.
 */
export function ReviewForm({ productId, copy }: { productId: string; copy: Record<string, string> }) {
  const [state, action, pending] = useActionState(submitMarketplaceReview, null);
  const [rating, setRating] = useState(0);

  if (state?.ok) {
    return (
      <p className="border-success-edge bg-success-soft text-success rounded-md border px-3 py-2 text-sm">
        {copy.reviewPending}
      </p>
    );
  }

  const error =
    state && !state.ok
      ? (copy[`rvErr_${state.error}`] ?? copy.rvErr_generic)
      : null;
  const field = "border-line bg-page w-full rounded-md border px-3 py-2 text-sm";

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />

      <fieldset>
        <legend className="text-faint mb-1 text-xs font-medium">
          {copy.reviewRating}
        </legend>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="cursor-pointer"
              aria-label={`${n} / 5`}
            >
              <input
                type="radio"
                name="rating"
                value={n}
                required
                checked={rating === n}
                onChange={() => setRating(n)}
                className="sr-only"
              />
              <svg
                viewBox="0 0 24 24"
                className={cn(
                  "h-6 w-6",
                  n <= rating ? "text-warning" : "text-line",
                )}
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.1 6.1 20.2l1.2-6.6L2.5 9l6.6-.9L12 2z" />
              </svg>
            </label>
          ))}
        </div>
      </fieldset>

      <input name="title" placeholder={copy.reviewTitleField} className={field} />
      <textarea
        name="body"
        rows={4}
        required
        minLength={10}
        placeholder={copy.reviewBody}
        className={field}
      />

      {error && (
        <p className="border-danger-edge bg-danger-soft text-danger rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-action text-on-action h-10 self-start rounded-md px-5 text-sm font-semibold disabled:opacity-60"
      >
        {copy.reviewSubmit}
      </button>
    </form>
  );
}
