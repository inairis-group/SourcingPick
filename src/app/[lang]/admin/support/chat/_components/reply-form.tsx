"use client";

import { useActionState } from "react";
import { replyToGuest } from "@/lib/support/guest-chat";

/**
 * Team reply to a public-chat visitor.
 *
 * No author is captured — the visitor is told they're talking to "the team",
 * and the message row stores only `fromTeam: true`. Sending also marks the
 * conversation handled, which is what clears it from the top of the queue.
 */
export function GuestReplyForm({
  conversationId,
  label,
  send,
}: {
  conversationId: string;
  label: string;
  send: string;
}) {
  const [, action, pending] = useActionState(replyToGuest, null);

  return (
    <form action={action} className="mt-3 flex items-end gap-2">
      <input type="hidden" name="conversationId" value={conversationId} />
      <textarea
        name="message"
        rows={2}
        required
        placeholder={label}
        className="border-line bg-page w-full rounded-md border px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-action text-on-action h-9 shrink-0 rounded-md px-4 text-xs font-semibold disabled:opacity-60"
      >
        {send}
      </button>
    </form>
  );
}
