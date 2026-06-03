"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

type ThreadItem = {
  threadId: string;
  title: string;
  href: string | null;
  unreadCount: number;
  lastMessageAt: string;
  preview: string | null;
  previewAuthor: string | null;
};

type Payload = {
  unreadCount: number;
  unreadThreads: number;
  items: ThreadItem[];
};

/**
 * Top-bar bell that surfaces recent message threads + total unread count.
 * Mirrors the NotificationBell pattern: 60s polling while visible, refetch
 * on visibility change, click-through links to the thread's context page.
 */
export function MessagesBell() {
  const dict = useDictionary();
  const locale = useLocale();
  const [data, setData] = useState<Payload>({
    unreadCount: 0,
    unreadThreads: 0,
    items: [],
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/messaging/threads", { cache: "no-store" });
      if (!res.ok) return;
      const payload = (await res.json()) as Payload;
      setData(payload);
    } catch {
      /* silent — bell keeps last-known state */
    }
  }, []);

  useEffect(() => {
    // Same poll-plus-visibility pattern as the notification bell. Initial
    // load primes the dropdown so the first open isn't empty.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const shownCount = data.unreadCount > 99 ? "99+" : data.unreadCount;

  return (
    <Popover className="relative">
      <PopoverButton
        aria-label={dict.messaging.bellLabel}
        className={cn(
          "relative inline-flex items-center justify-center h-9 w-9 rounded-md",
          "hover:bg-subtle transition-colors duration-fast",
          "focus:outline-2 focus:outline-focus focus:outline-offset-2",
        )}
      >
        <HugeiconsIcon icon={Message01Icon} size={18} strokeWidth={1.5} />
        {data.unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -inset-e-0.5 inline-flex items-center justify-center",
              "min-w-4 h-4 px-1 rounded-full text-[10px] font-semibold leading-none",
              "bg-action text-on-action border-2 border-page",
            )}
          >
            {shownCount}
          </span>
        )}
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: "bottom end", gap: 8 }}
        className={cn(
          "z-popover w-95 max-w-[calc(100vw-2rem)]",
          "rounded-lg border border-line bg-surface shadow-lg overflow-hidden",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line-subtle">
          <p className="text-sm font-semibold text-headline">
            {dict.messaging.bellTitle}
          </p>
          {data.unreadThreads > 0 && (
            <span className="text-[11px] text-muted">
              {dict.messaging.unreadCount.replace(
                "{n}",
                String(data.unreadThreads),
              )}
            </span>
          )}
        </div>
        <ul className="max-h-105 overflow-y-auto divide-y divide-line-subtle">
          {data.items.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-faint">
              {dict.messaging.bellEmpty}
            </li>
          ) : (
            data.items.map((t) => {
              const body = (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-sm leading-snug truncate",
                        t.unreadCount > 0
                          ? "text-headline font-semibold"
                          : "text-fg",
                      )}
                    >
                      {t.title}
                    </p>
                    {t.unreadCount > 0 && (
                      <span className="shrink-0 inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-semibold bg-action text-on-action">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                  {t.preview && (
                    <p className="text-xs text-muted leading-snug line-clamp-2">
                      {t.previewAuthor && (
                        <span className="font-medium text-fg">
                          {t.previewAuthor}:{" "}
                        </span>
                      )}
                      {t.preview}
                    </p>
                  )}
                  <p className="text-[10px] text-faint mt-1">
                    {formatDate(new Date(t.lastMessageAt), locale, "short")}
                  </p>
                </div>
              );
              return (
                <li
                  key={t.threadId}
                  className={cn(
                    "px-4 py-3 hover:bg-subtle transition-colors duration-fast",
                    t.unreadCount > 0 && "bg-info-soft/30",
                  )}
                >
                  {t.href ? (
                    <Link href={t.href} variant="muted" className="block">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })
          )}
        </ul>
      </PopoverPanel>
    </Popover>
  );
}
