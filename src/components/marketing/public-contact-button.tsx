"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, CustomerService01Icon } from "@hugeicons/core-free-icons";
import {
  getGuestConversation,
  postGuestMessage,
  startGuestConversation,
} from "@/lib/support/guest-chat";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Public live chat — replaces the previous "sign up or email us" dock.
 *
 * That dock existed because a live widget needed a vendor, a DPA and an
 * operator rota. This version needs none of them: it writes to our own
 * GuestConversation tables, so there is no third party and no new paperwork.
 *
 * A logged-out visitor gives a name, an email and a first message, then talks
 * to the team in the same panel. Replies are attributed to "the team", never
 * to a named person — notifications go to every admin, so naming one would be
 * untrue the moment they're away.
 *
 * The conversation token lives in localStorage and never appears in the URL:
 * it is the visitor's only credential, and a transcript shouldn't be
 * recoverable from browser history or a pasted link.
 *
 * Polling, not sockets. This is a low-volume pre-sales channel; a 15s poll
 * while the panel is open costs far less than a socket relay, and it stops
 * entirely when the panel closes.
 */

const STORAGE_KEY = "sp_chat_token";
const POLL_MS = 15_000;

type Message = {
  id: string;
  body: string;
  fromTeam: boolean;
  createdAt: Date | string;
};

export function PublicContactButton() {
  const dict = useDictionary();
  const t = dict.marketing.contact as unknown as Record<string, string>;

  const [open, setOpen] = useState(false);
  const [restored, setRestored] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [startState, startAction, starting] = useActionState(
    startGuestConversation,
    null,
  );
  const [replyState, replyAction, replying] = useActionState(
    postGuestMessage,
    null,
  );

  /**
   * The active token is derived, not stored twice: a conversation just
   * started wins, otherwise whatever was restored from localStorage. Deriving
   * avoids a second setState in an effect purely to mirror the action result.
   */
  const token = startState?.ok ? startState.token : restored;

  /**
   * Restore on open rather than on mount. It's a user event, so no effect and
   * no cascading render — and visitors who never open the panel don't touch
   * localStorage at all.
   */
  const togglePanel = () => {
    if (!open && !restored) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setRestored(saved);
    }
    setOpen((v) => !v);
  };

  // Persisting is a write to an external system — what effects are actually
  // for — and sets no React state.
  useEffect(() => {
    if (startState?.ok && startState.token) {
      window.localStorage.setItem(STORAGE_KEY, startState.token);
    }
  }, [startState]);

  const refresh = useCallback(async (tk: string) => {
    const convo = await getGuestConversation(tk);
    if (convo) {
      setMessages(convo.messages);
      return;
    }
    // Token no longer resolves — stale value from another environment, or the
    // record was purged. Drop it rather than leaving the panel stuck empty.
    window.localStorage.removeItem(STORAGE_KEY);
    setRestored(null);
  }, []);

  /**
   * Poll while the panel is open. `refresh` is async, so its `setMessages`
   * runs in a callback once the fetch resolves — this is the "subscribe for
   * updates from an external system" case the rule's own guidance describes,
   * not a synchronous cascading render. The linter can't see through the
   * async boundary, hence the targeted disable.
   */
  useEffect(() => {
    if (!open || !token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh(token);
    const id = window.setInterval(() => void refresh(token), POLL_MS);
    return () => window.clearInterval(id);
  }, [open, token, refresh, replyState]);

  const err = (state: { ok: boolean; error?: string } | null) =>
    state && !state.ok && state.error
      ? (t[`chatErr_${state.error}`] ?? t.chatErr_generic)
      : null;
  const error = err(startState) ?? err(replyState);

  const field = "border-line bg-page w-full rounded-md border px-3 py-2 text-sm";

  return (
    <div className="fixed bottom-4 z-popover inset-e-4 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label={t.chatTitle}
          className="border-line bg-surface flex max-h-[70vh] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border shadow-xl"
        >
          <header className="border-line-subtle border-b px-4 py-3">
            <p className="text-headline text-sm font-semibold">{t.chatTitle}</p>
            <p className="text-muted mt-0.5 text-xs">{t.chatIntro}</p>
          </header>

          {token ? (
            <>
              <ol className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      m.fromTeam
                        ? "bg-subtle text-fg self-start"
                        : "bg-action text-on-action self-end",
                    )}
                  >
                    <p className="text-[10px] opacity-70">
                      {m.fromTeam ? t.chatTeam : t.chatYou}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                  </li>
                ))}
              </ol>

              <form
                action={replyAction}
                className="border-line-subtle flex items-end gap-2 border-t px-3 py-3"
              >
                <input type="hidden" name="token" value={token} />
                <textarea
                  name="message"
                  rows={2}
                  required
                  placeholder={t.chatReply}
                  className={field}
                />
                <button
                  type="submit"
                  disabled={replying}
                  className="bg-action text-on-action h-9 shrink-0 rounded-md px-3 text-xs font-semibold disabled:opacity-60"
                >
                  {t.chatSend}
                </button>
              </form>
            </>
          ) : (
            <form action={startAction} className="flex flex-col gap-3 px-4 py-4">
              <input
                name="name"
                required
                placeholder={t.chatName}
                className={field}
              />
              <input
                name="email"
                type="email"
                required
                placeholder={t.chatEmail}
                className={field}
              />
              <textarea
                name="message"
                rows={3}
                required
                placeholder={t.chatMessage}
                className={field}
              />
              <button
                type="submit"
                disabled={starting}
                className="bg-action text-on-action h-10 rounded-md text-sm font-semibold disabled:opacity-60"
              >
                {t.chatSend}
              </button>
            </form>
          )}

          {error && (
            <p className="border-danger-edge bg-danger-soft text-danger mx-4 mb-3 rounded-md border px-3 py-2 text-xs">
              {error}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={togglePanel}
        aria-label={t.chatTitle}
        aria-expanded={open}
        className={cn(
          "relative inline-flex h-14 w-14 items-center justify-center rounded-full",
          "bg-action text-on-action shadow-lg hover:bg-action-hover",
          "duration-fast transition-transform active:scale-95",
          "focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2",
        )}
      >
        <HugeiconsIcon
          icon={open ? Cancel01Icon : CustomerService01Icon}
          size={22}
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}
