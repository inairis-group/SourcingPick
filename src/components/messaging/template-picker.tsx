"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";
import { useDictionary } from "@/lib/i18n/client-provider";
import { cn } from "@/lib/utils";

/**
 * Quick-insert templates for a message composer — partner #23.
 *
 * The picker is a popover triggered from a small icon next to the composer.
 * Selecting a template injects the localized body into the draft via
 * `onInsert`, so the operator edits before sending — a canned answer sent
 * verbatim reads like a robot, and half of these need a detail filled in.
 *
 * The template *set* is passed in rather than read from the dictionary here:
 * internal threads answer existing customers about their order, while public
 * chat answers strangers asking what the company even does. Same mechanism,
 * different questions.
 */

export type MessageTemplate = { key: string; title: string; body: string };

export function TemplatePicker({
  templates,
  onInsert,
}: {
  /// Resolved and localized by the caller.
  templates: MessageTemplate[];
  onInsert: (body: string) => void;
}) {
  const dict = useDictionary();
  const t = dict.messaging.templates;
  const [open, setOpen] = useState(false);

  if (templates.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.pickerAria}
        title={t.pickerAria}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md",
          "border border-line bg-surface text-muted hover:bg-subtle hover:text-fg",
          "transition-colors duration-fast",
          "focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1",
        )}
      >
        <HugeiconsIcon icon={File01Icon} size={14} strokeWidth={1.75} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute bottom-full mb-2 start-0 z-40 w-72",
              "rounded-lg border border-line bg-surface shadow-lg p-2",
            )}
          >
            <p className="text-[11px] uppercase tracking-wide text-faint px-2 py-1">
              {t.pickerTitle}
            </p>
            <ul className="flex flex-col gap-0.5">
              {templates.map((tpl) => (
                <li key={tpl.key}>
                  <button
                    type="button"
                    onClick={() => {
                      onInsert(tpl.body);
                      setOpen(false);
                    }}
                    className="w-full text-start px-2 py-1.5 rounded-md hover:bg-subtle text-xs text-fg"
                  >
                    <p className="font-medium text-headline">{tpl.title}</p>
                    <p className="text-faint truncate text-[10px]">
                      {tpl.body.slice(0, 70)}…
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
