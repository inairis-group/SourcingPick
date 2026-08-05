"use client";

import { useActionState } from "react";
import { moderateMarketplaceReview } from "@/lib/marketplace/reviews";

/**
 * Publish/reject control. Rejection requires a reason — the action enforces
 * it, and the field is always visible so the moderator isn't surprised by a
 * validation error after clicking.
 */
export function ModerateForm({
  reviewId,
  copy,
}: {
  reviewId: string;
  copy: Record<string, string>;
}) {
  const [state, action, pending] = useActionState(
    moderateMarketplaceReview,
    null,
  );
  const error =
    state && !state.ok
      ? (copy[`rvErr_${state.error}`] ?? copy.rvErr_generic)
      : null;

  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <input
        name="note"
        placeholder={copy.moderationNote}
        className="border-line bg-page min-w-52 flex-1 rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        name="decision"
        value="publish"
        disabled={pending}
        className="bg-action text-on-action h-9 rounded-md px-4 text-xs font-semibold disabled:opacity-60"
      >
        {copy.moderationPublish}
      </button>
      <button
        type="submit"
        name="decision"
        value="reject"
        disabled={pending}
        className="border-danger-edge text-danger h-9 rounded-md border px-4 text-xs font-semibold disabled:opacity-60"
      >
        {copy.moderationReject}
      </button>
      {error && (
        <p className="text-danger w-full text-xs">{error}</p>
      )}
    </form>
  );
}
