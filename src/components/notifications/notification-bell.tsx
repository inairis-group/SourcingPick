"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  read: boolean;
  createdAt: string;
  href: string | null;
};

type Payload = {
  unreadCount: number;
  items: NotificationItem[];
};

/**
 * Refresh cadence:
 *  - Initial load on mount
 *  - Refetch when the popover opens (forces a sync after user action)
 *  - Refetch every 60s while the page is visible (cheap; one indexed query)
 *
 * Full SSE for notifications lands in Phase 6 alongside the dashboard work.
 */
export function NotificationBell() {
  const dict = useDictionary();
  const locale = useLocale();
  const router = useRouter();
  const [data, setData] = useState<Payload>({ unreadCount: 0, items: [] });
  const [, startTransition] = useTransition();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const payload = (await res.json()) as Payload;
      setData(payload);
    } catch {
      // Silent — bell stays at last-known state.
    }
  }, []);

  useEffect(() => {
    // Subscribe to two external sources: a 60s interval and the document's
    // visibility state. The initial `load()` is the priming fetch — without
    // it the bell would render empty for the first poll window.
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

  // Optimistic local update so the badge drops immediately. We also
  // intercept the navigation when the click is a plain left-click on a
  // notification with a deep-link: the server action is awaited first so
  // the next page's bell loads fresh data instead of seeing a stale
  // unread count (partner item #10 — "badge persistence"). Modifier
  // clicks (cmd/ctrl/shift/middle-mouse) keep the default behaviour so
  // open-in-new-tab still works.
  const onItemClick = (
    e: React.MouseEvent<HTMLElement>,
    id: string,
    href: string | null,
  ) => {
    setData((prev) => {
      const wasUnread = prev.items.find((i) => i.id === id && !i.read);
      if (!wasUnread) return prev;
      return {
        unreadCount: Math.max(0, prev.unreadCount - 1),
        items: prev.items.map((i) =>
          i.id === id ? { ...i, read: true } : i,
        ),
      };
    });

    const isModified =
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1;
    if (href && !isModified && e.button === 0) {
      e.preventDefault();
      void (async () => {
        await markNotificationReadAction(id).catch(() => {});
        router.push(href);
      })();
      return;
    }

    startTransition(async () => {
      await markNotificationReadAction(id).catch(() => {});
      load();
    });
  };

  const onMarkAll = () => {
    setData((prev) => ({
      unreadCount: 0,
      items: prev.items.map((i) => ({ ...i, read: true })),
    }));
    startTransition(async () => {
      await markAllNotificationsReadAction();
      load();
    });
  };

  const shownCount = data.unreadCount > 99 ? "99+" : data.unreadCount;

  return (
    <Popover className="relative">
      <>
        <PopoverButton
          aria-label={dict.notifications.bellLabel}
          // Refresh every time the bell is clicked. The previous render-prop
          // gate `data.items.length === 0` meant we only refreshed on the
          // very first open — after that the popover served whatever was
          // cached at mount, so badges and item read-state went stale.
          onClick={load}
          className={cn(
            "relative inline-flex items-center justify-center h-9 w-9 rounded-md",
            "hover:bg-subtle transition-colors duration-fast",
            "focus:outline-2 focus:outline-focus focus:outline-offset-2",
          )}
        >
              <HugeiconsIcon
                icon={Notification03Icon}
                size={18}
                strokeWidth={1.5}
              />
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
                "z-popover w-90 max-w-[calc(100vw-2rem)]",
                "rounded-lg border border-line bg-surface shadow-lg",
                "overflow-hidden",
              )}
            >
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line-subtle">
                <p className="text-sm font-semibold text-headline">
                  {dict.notifications.title}
                </p>
                {data.unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAll}
                    className="text-xs text-link hover:text-link-hover"
                  >
                    {dict.notifications.markAllRead}
                  </button>
                )}
              </div>
              <ul className="max-h-105 overflow-y-auto divide-y divide-line-subtle">
                {data.items.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-faint">
                    {dict.notifications.empty}
                  </li>
                ) : (
                  data.items.map((n) => {
                    const body = (
                      <div className="flex flex-col gap-0.5">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            n.read
                              ? "text-fg"
                              : "text-headline font-semibold",
                          )}
                        >
                          {n.title}
                        </p>
                        {n.description && (
                          <p className="text-xs text-muted leading-snug">
                            {n.description}
                          </p>
                        )}
                        <p className="text-[10px] text-faint mt-1">
                          {formatDate(new Date(n.createdAt), locale, "short")}
                        </p>
                      </div>
                    );
                    return (
                      <li
                        key={n.id}
                        className={cn(
                          "px-4 py-3 hover:bg-subtle transition-colors duration-fast",
                          !n.read && "bg-info-soft/30",
                        )}
                      >
                        {n.href ? (
                          <Link
                            href={n.href}
                            variant="muted"
                            onClick={(e) => onItemClick(e, n.id, n.href)}
                            className="block"
                          >
                            {body}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => onItemClick(e, n.id, null)}
                            className="block w-full text-start"
                          >
                            {body}
                          </button>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
        </PopoverPanel>
      </>
    </Popover>
  );
}
