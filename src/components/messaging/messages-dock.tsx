"use client";

import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { useDictionary, useLocale } from "@/lib/i18n/client-provider";
import { formatDate } from "@/lib/i18n/formatters";
import { cn } from "@/lib/utils";

/**
 * Floating bottom-right messaging dock — partner #3.
 *
 * Persistent across every authenticated page. Click opens a drawer
 * with the same recent-thread list the top bell shows; selecting a
 * thread navigates to the thread's deep-link (where the full
 * conversation can be maximised via the `MaximizableThread` wrapper).
 *
 * Visually: a 56px floating action button with the unread count badge
 * + a 360px drawer. Hidden on the unauthenticated marketing pages —
 * the layout decides where to mount.
 */

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

export function MessagesDock() {
  const dict = useDictionary();
  const locale = useLocale();
  const [data, setData] = useState<Payload>({
    unreadCount: 0,
    unreadThreads: 0,
    items: [],
  });
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/messaging/threads", { cache: "no-store" });
      if (!res.ok) return;
      const payload = (await res.json()) as Payload;
      setData(payload);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
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
    <>
      {/* Backdrop that captures clicks outside the drawer. */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-overlay/30 backdrop-blur-[1px]"
        />
      )}

      <div className="fixed bottom-4 end-4 z-40 flex flex-col items-end gap-3">
        {open && (
          <div
            role="dialog"
            aria-label={dict.messaging.dockTitle}
            className={cn(
              "w-90 max-w-[calc(100vw-2rem)] rounded-lg",
              "border border-line bg-surface shadow-xl overflow-hidden",
              "flex flex-col max-h-[70vh]",
            )}
          >
            <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-line-subtle">
              <p className="text-sm font-semibold text-headline">
                {dict.messaging.dockTitle}
              </p>
              <div className="flex items-center gap-2">
                {data.unreadThreads > 0 && (
                  <span className="text-[11px] text-muted">
                    {dict.messaging.unreadCount.replace(
                      "{n}",
                      String(data.unreadThreads),
                    )}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={dict.messaging.minimizeAria}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-fg"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={14}
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            </header>

            <ul className="flex-1 overflow-y-auto divide-y divide-line-subtle">
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
                        <Link
                          href={t.href}
                          variant="muted"
                          className="block"
                          onClick={() => setOpen(false)}
                        >
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

            <footer className="px-4 py-2 border-t border-line-subtle">
              <Link
                href={`/${locale}/messages`}
                variant="muted"
                className="text-xs text-link hover:text-link-hover"
                onClick={() => setOpen(false)}
              >
                {dict.messaging.dockAllCta} →
              </Link>
            </footer>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={dict.messaging.dockOpenAria}
          aria-expanded={open}
          className={cn(
            "relative inline-flex h-14 w-14 items-center justify-center rounded-full",
            "bg-action text-on-action shadow-lg hover:bg-action-hover",
            "transition-transform duration-fast active:scale-95",
            "focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2",
          )}
        >
          <HugeiconsIcon
            icon={open ? Cancel01Icon : Message01Icon}
            size={22}
            strokeWidth={1.5}
          />
          {!open && data.unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -inset-e-1 inline-flex items-center justify-center",
                "min-w-5 h-5 px-1 rounded-full text-[11px] font-semibold leading-none",
                "bg-danger text-on-danger border-2 border-page",
              )}
            >
              {shownCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
