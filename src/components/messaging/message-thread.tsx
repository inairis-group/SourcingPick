"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { AttachmentKind, Role } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Attachment01Icon,
  File01Icon,
  Sent02Icon,
} from "@hugeicons/core-free-icons";
import { FormError } from "@/components/ui/form-error";
import {
  markThreadReadAction,
  sendMessageAction,
  sendMessageWithAttachmentsAction,
} from "@/lib/messaging/actions";
import { AttachmentPicker } from "@/components/attachments/attachment-picker";
import { VoiceRecorderButton } from "@/components/messaging/voice-recorder-button";
import { VoicePlayer } from "@/components/messaging/voice-player";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

type MessageAttachment = {
  id: string;
  kind: AttachmentKind;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
};

type Message = {
  id: string;
  body: string;
  authorUserId: string | null;
  author: {
    firstName: string;
    lastName: string;
    role: Role;
  } | null;
  createdAt: string;
  attachments: MessageAttachment[];
};

type FetchPayload = {
  messages: Message[];
  selfUserId: string;
};

/**
 * Live message panel. Architecture:
 *   1. Initial GET /api/messaging/threads/{id}/messages → seeds the list
 *      and learns the actor's userId (used for own/other styling).
 *   2. EventSource on /api/messaging/stream/{id} subscribes to the
 *      Postgres NOTIFY channel.
 *   3. On every "message" event, fetch ?after=<lastTs> and append.
 *
 * We chose fetch-on-NOTIFY over body-in-NOTIFY so the server stays the
 * single source of truth for message shape + author lookup, and so SSE
 * payloads stay small enough to survive NOTIFY's 8 KB limit at scale.
 */
export function MessageThread({
  threadId,
  fill = false,
}: {
  threadId: string;
  /**
   * When true the thread expands to fill its parent's height (message
   * list grows, composer pinned to the bottom). The parent must be a
   * height-constrained flex column or this collapses. Default false
   * keeps the legacy fixed-height widget used inside order / request
   * detail pages where the thread is one section among many.
   */
  fill?: boolean;
}) {
  const dict = useDictionary();
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [_, startTransition] = useTransition();
  const listRef = useRef<HTMLOListElement>(null);
  const scrollPinnedToBottom = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to ~5 rows worth of height, then scroll.
  // Single-line by default keeps the composer feeling like a chat input.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const next = Math.min(ta.scrollHeight, 140);
    ta.style.height = `${next}px`;
  }, [draft]);

  const loadInitial = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/messaging/threads/${threadId}/messages`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        setError(dict.messaging.errorLoad);
        return;
      }
      const data = (await res.json()) as FetchPayload;
      setMessages(data.messages);
      setSelfId(data.selfUserId);
    } catch {
      setError(dict.messaging.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [threadId, dict.messaging.errorLoad]);

  const loadIncremental = useCallback(
    async (after: string) => {
      const res = await fetch(
        `/api/messaging/threads/${threadId}/messages?after=${encodeURIComponent(after)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data = (await res.json()) as FetchPayload;
      if (data.messages.length === 0) return;
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const next = data.messages.filter((m) => !seen.has(m.id));
        return next.length > 0 ? [...prev, ...next] : prev;
      });
    },
    [threadId],
  );

  // Initial load — primes the message list before SSE takes over for
  // incremental updates. The lint rule prefers data fetching outside
  // effects, but pulling this above the SSE subscription would break the
  // ordering guarantee.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInitial();
  }, [loadInitial]);

  // Mark thread read whenever the panel is mounted or new messages arrive.
  useEffect(() => {
    if (messages.length === 0) return;
    startTransition(() => {
      markThreadReadAction(threadId).catch(() => {
        /* ignore */
      });
    });
  }, [threadId, messages.length]);

  // Subscribe to SSE. We read the latest message timestamp via a
  // functional setState — passing `current → current` is bailout-cheap
  // (Object.is short-circuits the re-render) but gives the SSE callback
  // access to the freshest state without a mirror ref. The old ref +
  // sync-effect pattern tripped React 19's `react-hooks/set-state-in-
  // effect` rule because mutating a ref used as a dep is forbidden.
  useEffect(() => {
    const source = new EventSource(`/api/messaging/stream/${threadId}`);
    source.addEventListener("message", () => {
      setMessages((current) => {
        const lastTs =
          current[current.length - 1]?.createdAt ??
          new Date(0).toISOString();
        void loadIncremental(lastTs);
        return current;
      });
    });
    source.addEventListener("error", () => {
      // EventSource auto-reconnects on transient errors; we surface a
      // soft warning if the browser permanently gives up.
      if (source.readyState === EventSource.CLOSED) {
        setError(dict.messaging.errorStream);
      }
    });
    return () => source.close();
  }, [threadId, loadIncremental, dict.messaging.errorStream]);

  // Auto-scroll to bottom when new messages arrive *if* the user was
  // already at the bottom; otherwise leave their scroll position alone.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !scrollPinnedToBottom.current) return;
    list.scrollTop = list.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    const threshold = 24;
    scrollPinnedToBottom.current =
      list.scrollHeight - list.scrollTop - list.clientHeight < threshold;
  };

  /**
   * Shared send path. Used by the form submit (text + queued attachments)
   * AND by the voice recorder (single-file, immediate send — partner UX
   * feedback: voice notes should feel like WhatsApp, not like "attach
   * then submit").
   *
   * `clearDraft` is false for voice-only sends so the user's in-progress
   * text doesn't get wiped while they tap the mic.
   */
  const send = (
    body: string,
    files: File[],
    options: { clearDraft: boolean } = { clearDraft: true },
  ) => {
    if (sending) return;
    if (!body && files.length === 0) return;
    setError(null);
    setSending(true);

    const finish = (ok: boolean, errMsg?: string, warnings?: string[]) => {
      setSending(false);
      if (!ok) {
        setError(errMsg ?? null);
        return;
      }
      if (warnings && warnings.length > 0) setError(warnings.join(" · "));
      if (options.clearDraft) {
        setDraft("");
        setPendingFiles([]);
        setShowPicker(false);
      }
      // Read freshest messages via functional setState — same pattern
      // as the SSE callback; avoids a mirror ref.
      setMessages((current) => {
        const lastTs =
          current[current.length - 1]?.createdAt ?? new Date(0).toISOString();
        void loadIncremental(lastTs);
        return current;
      });
    };

    if (files.length === 0) {
      // Fast path: keep the legacy text-only action so existing call
      // patterns don't churn.
      sendMessageAction(threadId, body)
        .then((r) => (r.ok ? finish(true) : finish(false, r.error)))
        .catch(() => finish(false, dict.messaging.errorLoad));
    } else {
      const fd = new FormData();
      fd.append("threadId", threadId);
      if (body) fd.append("body", body);
      for (const f of files) fd.append("attachments", f);
      sendMessageWithAttachmentsAction(fd)
        .then((r) =>
          r.ok ? finish(true, undefined, r.warnings) : finish(false, r.error),
        )
        .catch(() => finish(false, dict.messaging.errorLoad));
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send(draft.trim(), pendingFiles, { clearDraft: true });
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-line bg-surface",
        fill && "h-full min-h-0",
      )}
    >
      <ol
        ref={listRef}
        onScroll={onScroll}
        className={cn(
          "flex flex-col gap-2 px-4 py-3 overflow-y-auto",
          fill ? "flex-1 min-h-0" : "max-h-105",
        )}
      >
        {loading ? (
          <li className="text-xs text-faint text-center py-6">
            {dict.messaging.loading}
          </li>
        ) : messages.length === 0 ? (
          <li className="text-xs text-faint text-center py-6">
            {dict.messaging.empty}
          </li>
        ) : (
          messages.map((m) => {
            const mine = m.authorUserId === selfId;
            const authorLabel = m.author
              ? `${m.author.firstName} ${m.author.lastName}`
              : dict.messaging.systemAuthor;
            return (
              <li
                key={m.id}
                className={cn(
                  "flex flex-col max-w-[78%]",
                  mine ? "items-end self-end" : "items-start self-start",
                )}
              >
                {!mine && (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-faint mb-0.5 px-1">
                    {authorLabel}
                    {m.author && (
                      <span className="ms-1 lowercase font-normal">
                        ·{" "}
                        {dict.common.roles[
                          m.author.role.toLowerCase() as
                          | "client"
                          | "factory"
                          | "agent"
                          | "admin"
                        ]}
                      </span>
                    )}
                  </span>
                )}
                <div
                  className={cn(
                    "rounded-md px-3 py-2 text-sm leading-snug whitespace-pre-wrap wrap-break-word flex flex-col gap-2",
                    mine
                      ? "bg-action text-on-action"
                      : "bg-subtle text-fg border border-line-subtle",
                  )}
                >
                  {m.body.trim().length > 0 && <span>{m.body}</span>}
                  {m.attachments.length > 0 && (
                    <MessageAttachments
                      attachments={m.attachments}
                      mine={mine}
                    />
                  )}
                </div>
                <span className="text-[10px] text-faint mt-0.5 px-1">
                  {formatDate(new Date(m.createdAt), locale, "short")}
                </span>
              </li>
            );
          })
        )}
      </ol>

      <form
        onSubmit={onSubmit}
        className="border-t border-line-subtle p-3 flex flex-col gap-2"
      >
        {error && <FormError>{error}</FormError>}

        {(showPicker || pendingFiles.length > 0) && (
          <AttachmentPicker
            label={dict.messaging.attachLabel}
            hint={dict.messaging.attachHint}
            files={pendingFiles}
            onChange={setPendingFiles}
          />
        )}

        {/* Composer pill. The recorder is rendered ONCE, outside any
            conditional that flips with `voiceActive`, so its
            MediaRecorder + MediaStream survive the recording-state
            transition. Everything else is hidden via display:none while
            recording so the recorder takes the row visually but the rest
            of the inputs aren't unmounted (preserving draft + textarea
            scroll). */}
        {(() => {
          const hasContent = draft.trim().length > 0 || pendingFiles.length > 0;
          return (
            <div
              className={cn(
                "flex items-end gap-1.5 rounded-3xl border bg-surface px-1.5 py-1.5",
                "transition-colors duration-fast",
                voiceActive
                  ? "border-line"
                  : "border-line-strong focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/30",
              )}
            >
              <button
                type="button"
                onClick={() => setShowPicker((v) => !v)}
                aria-label={dict.messaging.attachLabel}
                className={cn(
                  "inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-full",
                  "text-muted hover:text-fg hover:bg-subtle transition-colors duration-fast",
                  (showPicker || pendingFiles.length > 0) &&
                    "bg-subtle text-fg",
                  voiceActive && "hidden",
                )}
              >
                <HugeiconsIcon
                  icon={Attachment01Icon}
                  size={18}
                  strokeWidth={1.5}
                />
              </button>

              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
                maxLength={5000}
                placeholder={dict.messaging.placeholder}
                aria-label={dict.messaging.placeholder}
                className={cn(
                  "flex-1 min-w-0 resize-none bg-transparent border-0 outline-none",
                  "text-sm text-fg placeholder:text-faint leading-6",
                  "px-1 py-1.5 max-h-35 overflow-y-auto",
                  voiceActive && "hidden",
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                  }
                }}
              />

              <button
                type="submit"
                disabled={sending}
                aria-label={dict.messaging.send}
                className={cn(
                  "inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-full",
                  "bg-action text-on-action hover:bg-action/90 shadow-sm",
                  "transition-colors duration-fast",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  (voiceActive || !hasContent) && "hidden",
                )}
              >
                <HugeiconsIcon
                  icon={Sent02Icon}
                  size={16}
                  strokeWidth={1.75}
                />
              </button>

              {/* Always mounted. Wrapper expands to fill the row while
                  recording so the recorder's own w-full layout has
                  room. When idle and the send button is showing, the
                  wrapper is display:none — recorder state is preserved
                  but the icon stays out of the user's way. */}
              <div
                className={cn(
                  voiceActive
                    ? "flex-1 min-w-0"
                    : hasContent
                      ? "hidden"
                      : "shrink-0",
                )}
              >
                <VoiceRecorderButton
                  onRecorded={(file) =>
                    send("", [file], { clearDraft: false })
                  }
                  onActiveChange={setVoiceActive}
                  disabled={sending}
                />
              </div>
            </div>
          );
        })()}

        <p className="text-[10px] text-faint text-center px-1">
          {dict.messaging.shortcutHint}
        </p>
      </form>
    </div>
  );
}

/**
 * Inline attachments rendered inside a message bubble. Server-rendered
 * `MediaGrid` exists for detail-page galleries; this is the lightweight
 * in-bubble version that handles per-kind layout.
 */
function MessageAttachments({
  attachments,
  mine,
}: {
  attachments: MessageAttachment[];
  mine: boolean;
}) {
  const images = attachments.filter((a) => a.kind === AttachmentKind.IMAGE);
  const videos = attachments.filter((a) => a.kind === AttachmentKind.VIDEO);
  const audios = attachments.filter((a) => a.kind === AttachmentKind.AUDIO);
  const files = attachments.filter((a) => a.kind === AttachmentKind.FILE);

  return (
    <div className="flex flex-col gap-1.5">
      {images.length > 0 && (
        <div
          className={cn(
            "grid gap-1",
            images.length === 1 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {images.map((a) => (
            <a
              key={a.id}
              href={`/api/attachments/${a.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-sm overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/attachments/${a.id}`}
                alt={a.originalName}
                className="w-full max-h-60 object-cover bg-black/10"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}

      {videos.map((a) => (
        <video
          key={a.id}
          src={`/api/attachments/${a.id}`}
          controls
          preload="metadata"
          className="w-full max-h-64 rounded-sm bg-black"
        />
      ))}

      {audios.map((a) => (
        <VoicePlayer
          key={a.id}
          src={`/api/attachments/${a.id}`}
          variant={mine ? "outgoing" : "incoming"}
        />
      ))}

      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((a) => (
            <li key={a.id}>
              <a
                href={`/api/attachments/${a.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs",
                  mine
                    ? "bg-on-action/15 hover:bg-on-action/25"
                    : "bg-surface hover:bg-subtle border border-line-subtle",
                )}
              >
                <HugeiconsIcon
                  icon={File01Icon}
                  size={12}
                  strokeWidth={1.5}
                  className="shrink-0"
                />
                <span className="truncate">{a.originalName}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
