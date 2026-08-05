"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeHighIcon, VolumeMute01Icon } from "@hugeicons/core-free-icons";
import { listGuestConversations } from "@/lib/support/guest-chat";
import { useMessageChime } from "@/lib/notifications/chime";
import { formatDate } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { GuestReplyForm } from "./reply-form";
import { cn } from "@/lib/utils";

/**
 * The queue, live.
 *
 * It was a plain server page, so a visitor's reply only appeared when the
 * operator happened to reload — which for a pre-sales chat means the visitor
 * has usually already left. It now polls and rings.
 *
 * Polling rather than SSE: the internal messaging stream is per-thread and
 * authorised by ThreadParticipant, and a guest conversation has no
 * participants to check. A 10s poll on a page an operator has open on purpose
 * is cheap, and it stops when the tab is hidden.
 */

export type GuestConversation = {
  id: string;
  name: string;
  email: string;
  locale: string;
  handledAt: Date | string | null;
  messages: {
    id: string;
    body: string;
    fromTeam: boolean;
    createdAt: Date | string;
  }[];
};

const POLL_MS = 10_000;

const countVisitorMessages = (list: GuestConversation[]): number =>
  list.reduce((sum, c) => sum + c.messages.filter((m) => !m.fromTeam).length, 0);

export function GuestChatQueue({
  initial,
  lang,
  copy,
}: {
  initial: GuestConversation[];
  lang: Locale;
  copy: Record<string, string>;
}) {
  const [conversations, setConversations] = useState(initial);
  // Baseline from what the server rendered, so the first poll doesn't hear
  // every existing message as new.
  const initialInbound = useMemo(() => countVisitorMessages(initial), [initial]);
  const { muted, setMuted, notify } = useMessageChime(initialInbound);

  const refresh = useCallback(async () => {
    const next = await listGuestConversations();
    setConversations(next);
    // Only visitor messages ring. Our own replies arriving back from the
    // server would otherwise chime at the person who just sent them.
    notify(countVisitorMessages(next));
  }, [notify]);

  useEffect(() => {
    const tick = () => {
      // A backgrounded tab doesn't need to be current, and browsers throttle
      // its timers anyway — skipping keeps us from queueing stale requests.
      if (document.visibilityState === "visible") void refresh();
    };
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setMuted(!muted)}
          aria-pressed={muted}
          className="border-line text-muted hover:bg-subtle duration-fast inline-flex h-8 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors"
        >
          <HugeiconsIcon
            icon={muted ? VolumeMute01Icon : VolumeHighIcon}
            size={15}
            strokeWidth={1.5}
          />
          {muted ? copy.chatSoundOff : copy.chatSoundOn}
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="border-line bg-surface text-muted rounded-lg border p-8 text-center text-sm">
          {copy.chatQueueEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {conversations.map((c) => (
            <article
              key={c.id}
              className="border-line bg-surface rounded-lg border p-5"
            >
              <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-headline text-sm font-semibold">{c.name}</p>
                  {/* The email is the only way to reach them if they close the
                      tab — the token lives in their browser, not ours. */}
                  <p className="text-muted font-mono text-xs">{c.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-faint text-xs uppercase">{c.locale}</span>
                  <span
                    className={cn(
                      "inline-flex h-6 items-center rounded-full border px-2.5 text-[11px] font-medium",
                      c.handledAt
                        ? "border-line bg-subtle text-muted"
                        : "border-warning-edge bg-warning-soft text-warning",
                    )}
                  >
                    {c.handledAt ? copy.chatHandled : copy.chatUnhandled}
                  </span>
                </div>
              </header>

              <ol className="flex flex-col gap-2">
                {c.messages.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      m.fromTeam
                        ? "bg-info-soft text-info self-end"
                        : "bg-subtle text-fg self-start",
                    )}
                  >
                    <p className="text-[10px] opacity-70">
                      {m.fromTeam ? copy.chatTeam : c.name} ·{" "}
                      {formatDate(m.createdAt, lang)}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                  </li>
                ))}
              </ol>

              <GuestReplyForm
                conversationId={c.id}
                label={copy.chatReplyLabel}
                send={copy.chatSend}
                onSent={refresh}
              />
            </article>
          ))}
        </div>
      )}
    </>
  );
}
