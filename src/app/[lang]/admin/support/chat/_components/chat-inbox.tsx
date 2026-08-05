"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GuestChatTeam, GuestConversationStatus } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeHighIcon, VolumeMute01Icon } from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { listGuestConversations } from "@/lib/support/guest-chat";
import { useMessageChime } from "@/lib/notifications/chime";
import { formatDate } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";
import { GuestReplyForm } from "./reply-form";
import { EscalationPanel } from "./escalation-panel";
import { cn } from "@/lib/utils";

/**
 * Public-chat inbox.
 *
 * The previous layout stacked every conversation as a full card with its own
 * reply box, so reading the third one meant scrolling past two transcripts and
 * there was nowhere to put per-conversation controls. This is the shape the
 * job actually has: a filterable list on one side, one thread at a time on the
 * other, and the routing/escalation controls beside the thread they act on.
 *
 * Filters live in client state rather than the URL because the list is fetched
 * through a server action on a timer — putting them in the URL would mean a
 * navigation per keystroke for no gain.
 */

export type InboxConversation = Awaited<
  ReturnType<typeof listGuestConversations>
>[number];

const POLL_MS = 10_000;

const countVisitorMessages = (list: InboxConversation[]): number =>
  list.reduce((sum, c) => sum + c.messages.filter((m) => !m.fromTeam).length, 0);

/** A conversation is waiting on us when the visitor spoke last. */
function needsReply(c: InboxConversation): boolean {
  const last = c.messages[c.messages.length - 1];
  return Boolean(last && !last.fromTeam);
}

export function GuestChatInbox({
  initial,
  lang,
  copy,
  teamLabels,
  statusLabels,
}: {
  initial: InboxConversation[];
  lang: Locale;
  copy: Record<string, string>;
  teamLabels: Record<string, string>;
  statusLabels: Record<string, string>;
}) {
  const [conversations, setConversations] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(
    initial[0]?.id ?? null,
  );
  const [team, setTeam] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [draftQuery, setDraftQuery] = useState("");

  const initialInbound = useMemo(() => countVisitorMessages(initial), [initial]);
  const { muted, setMuted, notify } = useMessageChime(initialInbound);

  const refresh = useCallback(async () => {
    const next = await listGuestConversations({ team, status, query });
    setConversations(next);
    // Only visitor messages ring — our own replies coming back from the server
    // would otherwise chime at the person who just sent them.
    notify(countVisitorMessages(next));
  }, [team, status, query, notify]);

  // Filters change → refetch immediately rather than waiting for the timer.
  // `refresh` sets state only after its await resolves, so this is a fetch
  // subscription rather than a cascading render; the rule can't see past the
  // async boundary.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const tick = () => {
      // A hidden tab doesn't need to be current, and browsers throttle its
      // timers anyway — skipping avoids queueing stale requests.
      if (document.visibilityState === "visible") void refresh();
    };
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  const selected =
    conversations.find((c) => c.id === selectedId) ?? conversations[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(draftQuery);
          }}
          className="min-w-56 flex-1"
        >
          <Input
            value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
          />
        </form>
        <Select
          size="md"
          className="min-w-40"
          value={team}
          onChange={setTeam}
          options={[
            { value: "", label: copy.allTeams },
            { value: "NONE", label: copy.unrouted },
            ...Object.values(GuestChatTeam).map((t) => ({
              value: t,
              label: teamLabels[t],
            })),
          ]}
        />
        <Select
          size="md"
          className="min-w-36"
          value={status}
          onChange={setStatus}
          options={[
            { value: "", label: copy.allStatuses },
            ...Object.values(GuestConversationStatus).map((s) => ({
              value: s,
              label: statusLabels[s],
            })),
          ]}
        />
        <button
          type="button"
          onClick={() => setMuted(!muted)}
          aria-pressed={muted}
          className="border-line text-muted hover:bg-subtle duration-fast inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors"
        >
          <HugeiconsIcon
            icon={muted ? VolumeMute01Icon : VolumeHighIcon}
            size={15}
            strokeWidth={1.5}
          />
          {muted ? copy.soundOff : copy.soundOn}
        </button>
      </div>

      <div className="border-line bg-surface grid min-h-[32rem] overflow-hidden rounded-lg border lg:grid-cols-[20rem_1fr_16rem]">
        {/* List. Hidden on small screens once a thread is open, so a phone
            shows one pane at a time instead of a squeezed three-column grid. */}
        <ol
          className={cn(
            "border-line divide-line-subtle divide-y overflow-y-auto lg:max-h-[70vh] lg:border-e",
            selected && "hidden lg:block",
          )}
        >
          {conversations.length === 0 && (
            <li className="text-muted p-6 text-center text-sm">
              {copy.emptyList}
            </li>
          )}
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "hover:bg-subtle duration-fast w-full px-4 py-3 text-start transition-colors",
                  c.id === selected?.id && "bg-subtle",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-headline truncate text-sm font-semibold">
                    {c.name}
                  </span>
                  {needsReply(c) && (
                    <span className="bg-warning inline-block h-2 w-2 shrink-0 rounded-full" />
                  )}
                </div>
                <p className="text-faint truncate text-xs">{c.email}</p>
                <p className="text-muted mt-1 truncate text-xs">
                  {c.messages[c.messages.length - 1]?.body ?? ""}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  {c.team && (
                    <Chip tone="info">{teamLabels[c.team]}</Chip>
                  )}
                  {!c.team && <Chip tone="warn">{copy.unrouted}</Chip>}
                  {c.status !== GuestConversationStatus.OPEN && (
                    <Chip tone="neutral">{statusLabels[c.status]}</Chip>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ol>

        {selected ? (
          <>
            <div className="flex min-w-0 flex-col">
              <header className="border-line-subtle flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="text-info mb-1 text-xs font-medium lg:hidden"
                  >
                    {copy.backToList}
                  </button>
                  <p className="text-headline truncate text-sm font-semibold">
                    {selected.name}
                  </p>
                  <p className="text-muted truncate font-mono text-xs">
                    {selected.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-faint text-xs uppercase">
                    {selected.locale}
                  </span>
                  <Chip tone={needsReply(selected) ? "warn" : "neutral"}>
                    {needsReply(selected) ? copy.needsReply : copy.handled}
                  </Chip>
                </div>
              </header>

              <ol className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4 lg:max-h-[52vh]">
                {selected.messages.map((m) => (
                  <li
                    key={m.id}
                    className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                      m.fromTeam
                        ? "bg-info-soft text-info self-end"
                        : "bg-subtle text-fg self-start",
                    )}
                  >
                    <p className="text-[10px] opacity-70">
                      {m.fromTeam ? copy.handled : selected.name} ·{" "}
                      {formatDate(m.createdAt, lang)}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
                  </li>
                ))}
              </ol>

              <div className="border-line-subtle border-t px-4 py-3">
                <GuestReplyForm
                  conversationId={selected.id}
                  label={copy.replyPlaceholder}
                  send={copy.send}
                  onSent={refresh}
                />
              </div>
            </div>

            <EscalationPanel
              // Remount per conversation so the account lookup and the order
              // picker can't carry over from the previously selected visitor.
              key={selected.id}
              conversation={selected}
              lang={lang}
              copy={copy}
              teamLabels={teamLabels}
              onChanged={refresh}
            />
          </>
        ) : (
          <div className="text-muted col-span-2 hidden items-center justify-center p-10 text-sm lg:flex">
            {copy.emptyThread}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "info" | "warn" | "neutral";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium",
        tone === "info" && "border-info-edge bg-info-soft text-info",
        tone === "warn" && "border-warning-edge bg-warning-soft text-warning",
        tone === "neutral" && "border-line bg-subtle text-muted",
      )}
    >
      {children}
    </span>
  );
}
