"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextBoldIcon,
  TextItalicIcon,
  ListSettingIcon,
  Link04Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { MarkdownDisplay } from "./markdown-display";
import { cn } from "@/lib/utils";

/**
 * Lightweight markdown editor — textarea + tiny toolbar of buttons that
 * wrap the current selection in markdown syntax (bold / italic / list /
 * link) + a Preview toggle. No WYSIWYG layer; the buyer sees the same
 * markdown rendered with rehype-sanitize.
 *
 * Matches the product form's submit pattern: the underlying value is in a
 * controlled textarea named `name`, so the parent form can post normally.
 */
export function MarkdownEditor({
  name,
  defaultValue = "",
  required,
  placeholder,
  minLength,
  maxLength,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  /**
   * Wrap the current selection in `before...after`; if nothing is
   * selected, insert the wrapper and move the cursor between the two
   * halves.
   */
  const wrap = (before: string, after = before) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next =
      value.slice(0, start) +
      before +
      value.slice(start, end) +
      after +
      value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      ta.focus();
      const cursor = start + before.length + (end - start);
      ta.setSelectionRange(cursor, cursor);
    });
  };

  /** Prefix every selected line with `prefix`; useful for bullet lists. */
  const prefixLines = (prefix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.slice(0, start);
    const selection = value.slice(start, end) || "item";
    const after = value.slice(end);
    const lined = selection
      .split("\n")
      .map((l) => `${prefix}${l}`)
      .join("\n");
    setValue(before + lined + after);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start, start + lined.length);
    });
  };

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-line-strong bg-surface focus-within:border-focus focus-within:outline-2 focus-within:outline-focus focus-within:outline-offset-2">
      <div className="flex items-center gap-1 border-b border-line-subtle px-1.5 py-1">
        <ToolbarButton
          label="Bold"
          icon={TextBoldIcon}
          onClick={() => wrap("**")}
        />
        <ToolbarButton
          label="Italic"
          icon={TextItalicIcon}
          onClick={() => wrap("_")}
        />
        <ToolbarButton
          label="Bullet list"
          icon={ListSettingIcon}
          onClick={() => prefixLines("- ")}
        />
        <ToolbarButton
          label="Link"
          icon={Link04Icon}
          onClick={() => wrap("[", "](https://)")}
        />
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setMode((m) => (m === "write" ? "preview" : "write"))}
          className={cn(
            "inline-flex items-center gap-1 h-7 px-2 rounded-md text-xs font-medium",
            "text-muted hover:text-fg hover:bg-subtle transition-colors duration-fast",
            mode === "preview" && "text-fg bg-subtle",
          )}
        >
          <HugeiconsIcon icon={ViewIcon} size={12} strokeWidth={1.5} />
          {mode === "preview" ? "Write" : "Preview"}
        </button>
      </div>

      {mode === "write" ? (
        <textarea
          ref={ref}
          name={name}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          className={cn(
            "w-full p-3 pt-0 text-base resize-y bg-transparent",
            "text-fg placeholder:text-faint focus:outline-none",
          )}
        />
      ) : (
        <div className="px-3 pb-3">
          {/* Hidden input keeps the value submitted while preview is shown */}
          <input type="hidden" name={name} value={value} />
          {value.trim() ? (
            <MarkdownDisplay source={value} />
          ) : (
            <p className="text-sm text-faint italic">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: typeof TextBoldIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded-md",
        "text-muted hover:text-fg hover:bg-subtle transition-colors duration-fast",
      )}
    >
      <HugeiconsIcon icon={icon} size={14} strokeWidth={1.5} />
    </button>
  );
}
