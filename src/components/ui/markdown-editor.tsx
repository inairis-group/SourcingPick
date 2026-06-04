"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  ListSettingIcon,
  LeftToRightListNumberIcon,
  Link04Icon,
  Heading01Icon,
  Heading02Icon,
  QuoteUpIcon,
  CodeIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/**
 * WYSIWYG markdown editor — Tiptap on top of ProseMirror, configured to
 * serialise its content as GFM-style markdown for storage and form
 * submission. The user sees rendered formatting while typing (no visible
 * `**` / `_` / `-` syntax) and the standard chord shortcuts work:
 *
 *   Ctrl/⌘+B  bold              Ctrl/⌘+I  italic
 *   Ctrl/⌘+K  link (toolbar)    Ctrl/⌘+`  inline code
 *   Ctrl/⌘+Shift+8  bullet list  Ctrl/⌘+Shift+7  ordered list
 *   Ctrl/⌘+Z / Shift+Z  undo / redo
 *
 * The component still surfaces the same form API as the old textarea-
 * based editor — a hidden input named `name` carries the markdown
 * payload — so all existing callers (product form, auction form, etc.)
 * keep working without changes.
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
  const [markdown, setMarkdown] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  // Tiptap mounts asynchronously; cache the last serialised markdown so
  // SSR / first render shows the right hidden-input value.
  const lastSerialisedRef = useRef(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        // We provide our own link extension below for click-to-open
        // behaviour + auto-link recognition.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: {
          class: "text-link underline underline-offset-2",
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
        emptyEditorClass: "is-empty-editor",
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        bulletListMarker: "-",
        linkify: true,
        breaks: false,
        transformPastedText: true,
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        // The class drives our prose styles + outlines focus state on
        // the contenteditable region. We render our own wrapper so the
        // editor sits flush inside the bordered shell.
        class:
          "markdown-editor-content focus:outline-none min-h-40 p-3",
      },
      handleKeyDown: (_view, event) => {
        // Hard-cap input at maxLength — let undo/delete keys through.
        if (!maxLength) return false;
        const editable = (event.target as HTMLElement | null)?.isContentEditable;
        if (!editable) return false;
        const isEditingKey =
          event.metaKey ||
          event.ctrlKey ||
          event.key === "Backspace" ||
          event.key === "Delete" ||
          event.key === "ArrowLeft" ||
          event.key === "ArrowRight" ||
          event.key === "ArrowUp" ||
          event.key === "ArrowDown" ||
          event.key === "Home" ||
          event.key === "End" ||
          event.key === "Tab" ||
          event.key === "Escape";
        if (isEditingKey) return false;
        // Compare against current serialised length; if at the cap and
        // about to type a printable, suppress.
        if (
          lastSerialisedRef.current.length >= maxLength &&
          event.key.length === 1
        ) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const md = serialiseMarkdown(ed);
      lastSerialisedRef.current = md;
      setMarkdown(md);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    immediatelyRender: false,
  });

  // Sync defaultValue back into the editor when it changes (parent re-
  // renders with new defaults — e.g. editing a different record).
  useEffect(() => {
    if (!editor) return;
    const current = serialiseMarkdown(editor);
    if (current !== defaultValue) {
      editor.commands.setContent(defaultValue, { emitUpdate: false });
      lastSerialisedRef.current = defaultValue;
      setMarkdown(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, editor]);

  const charCount = markdown.length;
  const overMax = Boolean(maxLength && charCount > maxLength);
  const underMin = Boolean(minLength && charCount > 0 && charCount < minLength);

  return (
    <div
      className={cn(
        "flex flex-col gap-0 rounded-md border bg-surface transition-colors duration-fast",
        isFocused
          ? "border-focus ring-2 ring-focus/30"
          : "border-line-strong",
      )}
    >
      <Toolbar editor={editor} />

      <EditorContent editor={editor} />

      {/* The hidden input that the surrounding <form> reads on submit.
          We track required + minLength here too so native form validation
          fires before the action runs. The custom validity message gives
          a better hint than "Please fill out this field" for empty
          rich-text bodies. */}
      <input
        type="hidden"
        name={name}
        value={markdown}
        required={required}
        // HTML5 minLength only validates on `text` / `password` / etc.
        // not on `hidden`. We mirror the cap in JS via the toolbar count
        // and bubble a custom error if it's a hard requirement.
        ref={(el) => {
          if (!el) return;
          if (required && markdown.trim().length === 0) {
            el.setCustomValidity("This field is required.");
          } else if (minLength && markdown.length < minLength) {
            el.setCustomValidity(`At least ${minLength} characters required.`);
          } else if (maxLength && markdown.length > maxLength) {
            el.setCustomValidity(`At most ${maxLength} characters allowed.`);
          } else {
            el.setCustomValidity("");
          }
        }}
      />

      {(minLength || maxLength) && (
        <div className="flex items-center justify-end gap-2 px-3 py-1.5 border-t border-line-subtle text-[10px] text-faint tabular-nums">
          {overMax && (
            <span className="text-danger">
              {charCount}/{maxLength}
            </span>
          )}
          {underMin && (
            <span className="text-warning">
              {charCount}/{minLength} min
            </span>
          )}
          {!overMax && !underMin && (
            <span>
              {charCount}
              {maxLength && ` / ${maxLength}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Toolbar with the canonical formatting actions. We only render buttons
 * that map to commands StarterKit + Link expose, so the markdown round-
 * trip stays clean.
 */
function Toolbar({ editor }: { editor: Editor | null }) {
  const isReady = editor !== null && !editor.isDestroyed;

  return (
    <div className="flex items-center gap-0.5 border-b border-line-subtle px-1.5 py-1 flex-wrap">
      <ToolbarButton
        label="Bold"
        ariaShortcut="Ctrl/Cmd+B"
        icon={TextBoldIcon}
        active={isReady && editor.isActive("bold")}
        disabled={!isReady}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Italic"
        ariaShortcut="Ctrl/Cmd+I"
        icon={TextItalicIcon}
        active={isReady && editor.isActive("italic")}
        disabled={!isReady}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="Strikethrough"
        icon={TextStrikethroughIcon}
        active={isReady && editor.isActive("strike")}
        disabled={!isReady}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      />
      <ToolbarButton
        label="Inline code"
        ariaShortcut="Ctrl/Cmd+E"
        icon={CodeIcon}
        active={isReady && editor.isActive("code")}
        disabled={!isReady}
        onClick={() => editor?.chain().focus().toggleCode().run()}
      />

      <Divider />

      <ToolbarButton
        label="Heading 1"
        icon={Heading01Icon}
        active={isReady && editor.isActive("heading", { level: 1 })}
        disabled={!isReady}
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 1 }).run()
        }
      />
      <ToolbarButton
        label="Heading 2"
        icon={Heading02Icon}
        active={isReady && editor.isActive("heading", { level: 2 })}
        disabled={!isReady}
        onClick={() =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run()
        }
      />

      <Divider />

      <ToolbarButton
        label="Bullet list"
        icon={ListSettingIcon}
        active={isReady && editor.isActive("bulletList")}
        disabled={!isReady}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Numbered list"
        icon={LeftToRightListNumberIcon}
        active={isReady && editor.isActive("orderedList")}
        disabled={!isReady}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label="Quote"
        icon={QuoteUpIcon}
        active={isReady && editor.isActive("blockquote")}
        disabled={!isReady}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
      />

      <Divider />

      <ToolbarButton
        label="Link"
        ariaShortcut="Ctrl/Cmd+K"
        icon={Link04Icon}
        active={isReady && editor.isActive("link")}
        disabled={!isReady}
        onClick={() => {
          if (!editor) return;
          const previous = editor.getAttributes("link").href as
            | string
            | undefined;
          const url = window.prompt("URL", previous ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
      />
    </div>
  );
}

function ToolbarButton({
  label,
  ariaShortcut,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  ariaShortcut?: string;
  icon: typeof TextBoldIcon;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaShortcut ? `${label} (${ariaShortcut})` : label}
      aria-pressed={active}
      title={ariaShortcut ? `${label} · ${ariaShortcut}` : label}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded-md",
        "transition-colors duration-fast",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        active
          ? "bg-action/10 text-action"
          : "text-muted hover:text-fg hover:bg-subtle",
      )}
    >
      <HugeiconsIcon icon={icon} size={14} strokeWidth={1.5} />
    </button>
  );
}

function Divider() {
  return <span className="self-stretch w-px bg-line-subtle mx-1 my-0.5" />;
}

/**
 * Pull the markdown serialisation off the editor's storage. The
 * `tiptap-markdown` extension exposes `getMarkdown()` here.
 */
function serialiseMarkdown(editor: Editor): string {
  // The typing on `storage.markdown.getMarkdown()` is loose because
  // tiptap-markdown attaches at runtime; cast through unknown so we
  // don't drag in their module type.
  const storage = editor.storage as unknown as {
    markdown?: { getMarkdown: () => string };
  };
  return storage.markdown?.getMarkdown() ?? "";
}
