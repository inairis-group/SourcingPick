"use client";

import { useState } from "react";
import { ThreadContextType } from "@prisma/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Maximize02Icon,
} from "@hugeicons/core-free-icons";
import { Dialog } from "@/components/ui/dialog";
import { MessageThread } from "./message-thread";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Wraps the inline MessageThread surface with a "maximize" button that
 * opens the same thread in a near-fullscreen Dialog.
 *
 * Two mounts coexist while the dialog is open: the inline one (covered
 * by the modal overlay) and the dialog one. Both share an SSE
 * subscription to the same thread, so a message sent in the dialog
 * propagates to the inline mount automatically — when the user
 * minimizes, the inline view is already up-to-date.
 *
 * Dialog body is `flex-col` with a fixed header + a `flex-1`
 * scroll-area that hosts the MessageThread; the thread's internal
 * composer + message list expand to fill the available height.
 */
export function MaximizableThread({
  threadId,
  title,
  hint,
  contextType: _ctx,
}: {
  threadId: string;
  title: string;
  hint?: string;
  contextType: ThreadContextType;
}) {
  const dict = useDictionary();
  const t = dict.messaging;
  const [maximized, setMaximized] = useState(false);

  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {title}
          </h2>
          {hint && (
            <p className="text-xs text-muted mt-1 leading-snug">{hint}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMaximized(true)}
          aria-label={t.maximizeAria}
          title={t.maximizeAria}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            "border border-line bg-surface text-muted",
            "hover:bg-subtle hover:text-fg transition-colors duration-fast",
            "focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1",
          )}
        >
          <HugeiconsIcon
            icon={Maximize02Icon}
            size={14}
            strokeWidth={1.75}
          />
        </button>
      </header>

      <MessageThread threadId={threadId} />

      <Dialog open={maximized} onClose={setMaximized} size="full">
        <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-line shrink-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 truncate">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => setMaximized(false)}
            aria-label={t.minimizeAria}
            title={t.minimizeAria}
            className={cn(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              "text-muted hover:bg-subtle hover:text-fg transition-colors duration-fast",
              "focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1",
            )}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={16}
              strokeWidth={1.75}
            />
          </button>
        </header>
        {/* min-h-0 lets the flex-1 child take ownership of the
            overflow inside the panel, instead of pushing the panel
            taller than the viewport. */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          <MessageThread threadId={threadId} />
        </div>
      </Dialog>
    </section>
  );
}
