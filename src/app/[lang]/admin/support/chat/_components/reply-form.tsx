"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { replyToGuest } from "@/lib/support/guest-chat";
import { useDictionary } from "@/lib/i18n/client-provider";
import { TemplatePicker } from "@/components/messaging/template-picker";

/**
 * Team reply to a public-chat visitor.
 *
 * No author is captured — the visitor is told they're talking to "the team",
 * and the message row stores only `fromTeam: true`. Sending also marks the
 * conversation handled, which is what clears it from the top of the queue.
 *
 * The template picker inserts a canned answer into the draft rather than
 * sending it: these are pre-sales questions from strangers, and a stock reply
 * fired off verbatim reads exactly like one. Most of them want a sentence
 * added about the visitor's actual situation before it goes.
 */

/// The recurring questions that arrive through the public widget. Distinct
/// from the internal set in message-thread, which answers existing customers
/// about their own orders.
const PUBLIC_TEMPLATE_KEYS = [
  "how_it_works",
  "pricing",
  "lead_times",
  "china_only",
  "become_supplier",
  "marketplace_buy",
  "vehicles",
  "create_account",
] as const;

export function GuestReplyForm({
  conversationId,
  label,
  send,
  onSent,
}: {
  conversationId: string;
  label: string;
  send: string;
  /// Optional: the live queue passes a refresh so a sent reply appears at
  /// once instead of on the next poll.
  onSent?: () => void;
}) {
  const dict = useDictionary();
  const t = dict.admin.guestChat.templates;
  const [state, action, pending] = useActionState(replyToGuest, null);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.ok) {
      onSent?.();
      setDraft("");
    }
  }, [state, onSent]);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="conversationId" value={conversationId} />
      <textarea
        ref={textareaRef}
        name="message"
        rows={3}
        required
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={label}
        className="border-line bg-page w-full rounded-md border px-3 py-2 text-sm"
      />
      <div className="flex items-center justify-between gap-2">
        <TemplatePicker
          templates={PUBLIC_TEMPLATE_KEYS.map((key) => ({
            key,
            title: t.titles[key],
            body: t.bodies[key],
          }))}
          onInsert={(body) => {
            setDraft((current) =>
              current.trim().length > 0 ? `${current}\n\n${body}` : body,
            );
            textareaRef.current?.focus();
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-action text-on-action h-9 shrink-0 rounded-md px-4 text-xs font-semibold disabled:opacity-60"
        >
          {send}
        </button>
      </div>
    </form>
  );
}
