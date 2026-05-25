"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
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

  const onItemClick = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id);
      load();
    });
  };

  const onMarkAll = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      load();
    });
  };

  const shownCount = data.unreadCount > 99 ? "99+" : data.unreadCount;

  return (
    <Popover className="relative">
      {({ open }) => {
        // Refresh when popover opens.
        if (open && data.items.length === 0) {
          // Don't await; queue a load on next tick to avoid setState during render.
          queueMicrotask(load);
        }
        return (
          <>
            <PopoverButton
              aria-label={dict.notifications.bellLabel}
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
                    "min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-semibold leading-none",
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
                "z-popover w-[360px] max-w-[calc(100vw-2rem)]",
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
              <ul className="max-h-[420px] overflow-y-auto divide-y divide-line-subtle">
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
                            onClick={() => onItemClick(n.id)}
                            className="block"
                          >
                            {body}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onItemClick(n.id)}
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
        );
      }}
    </Popover>
  );
}
