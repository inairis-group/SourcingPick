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
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import {
  markThreadReadAction,
  sendMessageAction,
  sendMessageWithAttachmentsAction,
} from "@/lib/messaging/actions";
import { AttachmentPicker } from "@/components/attachments/attachment-picker";
import { VoiceRecorderButton } from "@/components/messaging/voice-recorder-button";
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
export function MessageThread({ threadId }: { threadId: string }) {
  const dict = useDictionary();
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [_, startTransition] = useTransition();
  const listRef = useRef<HTMLOListElement>(null);
  const scrollPinnedToBottom = useRef(true);

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

  // Subscribe to SSE.
  useEffect(() => {
    const source = new EventSource(`/api/messaging/stream/${threadId}`);
    source.addEventListener("message", () => {
      const lastTs =
        messagesRef.current[messagesRef.current.length - 1]?.createdAt ??
        new Date(0).toISOString();
      loadIncremental(lastTs);
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

  // Keep ref in sync — needed inside the SSE callback because it captures.
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = draft.trim();
    if (sending) return;
    // Allow attachment-only sends (no body) but require at least one of
    // body or files. The server enforces the same; this is just to skip
    // a pointless round-trip when both are empty.
    if (!body && pendingFiles.length === 0) return;
    setError(null);
    setSending(true);

    const finish = (ok: boolean, errMsg?: string, warnings?: string[]) => {
      setSending(false);
      if (!ok) {
        setError(errMsg ?? null);
        return;
      }
      // Warnings come from per-file storage errors; surface but don't
      // block — the message itself sent successfully.
      if (warnings && warnings.length > 0) setError(warnings.join(" · "));
      setDraft("");
      setPendingFiles([]);
      setShowPicker(false);
      const lastTs =
        messagesRef.current[messagesRef.current.length - 1]?.createdAt ??
        new Date(0).toISOString();
      loadIncremental(lastTs);
    };

    if (pendingFiles.length === 0) {
      // Fast path: keep the legacy text-only action so existing call
      // patterns don't churn.
      sendMessageAction(threadId, body)
        .then((r) => (r.ok ? finish(true) : finish(false, r.error)))
        .catch(() => finish(false, dict.messaging.errorLoad));
    } else {
      const fd = new FormData();
      fd.append("threadId", threadId);
      if (body) fd.append("body", body);
      for (const f of pendingFiles) fd.append("attachments", f);
      sendMessageWithAttachmentsAction(fd)
        .then((r) =>
          r.ok ? finish(true, undefined, r.warnings) : finish(false, r.error),
        )
        .catch(() => finish(false, dict.messaging.errorLoad));
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface">
      <ol
        ref={listRef}
        onScroll={onScroll}
        className="flex flex-col gap-2 px-4 py-3 max-h-105 overflow-y-auto"
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
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          maxLength={5000}
          placeholder={dict.messaging.placeholder}
          className={cn(
            "w-full rounded-sm border bg-surface text-fg placeholder:text-faint p-2 text-sm resize-y",
            "border-line-strong focus:border-focus focus:outline-2 focus:outline-focus focus:outline-offset-2",
          )}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
            }
          }}
        />

        {(showPicker || pendingFiles.length > 0) && (
          <AttachmentPicker
            label={dict.messaging.attachLabel}
            hint={dict.messaging.attachHint}
            files={pendingFiles}
            onChange={setPendingFiles}
          />
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              aria-label={dict.messaging.attachLabel}
              className={cn(
                "inline-flex items-center justify-center h-7 w-7 rounded-full",
                "text-muted hover:text-fg hover:bg-subtle transition-colors duration-fast",
                (showPicker || pendingFiles.length > 0) &&
                "bg-subtle text-fg",
              )}
            >
              <HugeiconsIcon
                icon={Attachment01Icon}
                size={14}
                strokeWidth={1.5}
              />
            </button>
            <VoiceRecorderButton
              onRecorded={(file) =>
                setPendingFiles((prev) => [...prev, file])
              }
              disabled={sending}
            />
            <span className="text-[10px] text-faint">
              {dict.messaging.shortcutHint}
            </span>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={sending}
            disabled={!draft.trim() && pendingFiles.length === 0}
          >
            <HugeiconsIcon icon={Sent02Icon} size={14} strokeWidth={1.5} />
            <span className="ms-1.5">{dict.messaging.send}</span>
          </Button>
        </div>
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
        <audio
          key={a.id}
          src={`/api/attachments/${a.id}`}
          controls
          preload="metadata"
          className={cn(
            "w-full rounded-full",
            mine ? "bg-on-action/10" : "bg-surface",
          )}
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
