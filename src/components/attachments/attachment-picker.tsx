"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Attachment01Icon,
  Cancel01Icon,
  File01Icon,
  Image01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Multi-file picker that stages selections client-side. Files are NOT
 * uploaded here — they're surfaced via `onChange` so the parent form can
 * fold them into its own FormData submission.
 *
 * Same UX across messages, request wizard, marketplace listings:
 *   - click button → native file picker
 *   - preview chips with type icon + filename + size + remove (×)
 *   - drag-drop on the chip strip (optional, for desktop power users)
 *
 * Accept attribute matches what `storeAttachment()` will accept; if you
 * add formats there, mirror them here.
 */
const ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif," +
  "video/mp4,video/webm,video/quicktime," +
  ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip";

const MAX_DEFAULT = 10;

export function AttachmentPicker({
  name = "attachments",
  max = MAX_DEFAULT,
  label,
  hint,
  files,
  onChange,
}: {
  /** FormData key the parent form will submit under. */
  name?: string;
  max?: number;
  label: string;
  hint?: string;
  files: File[];
  onChange: (next: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const accept = (picked: FileList | null) => {
    if (!picked) return;
    const next = [...files];
    for (let i = 0; i < picked.length && next.length < max; i++) {
      next.push(picked[i]);
    }
    onChange(next);
  };

  const remove = (i: number) => {
    const next = files.slice();
    next.splice(i, 1);
    onChange(next);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    accept(e.dataTransfer.files);
  };

  const hidden = files.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-fg">{label}</span>
        <span className="text-xs text-faint">
          {files.length}/{max}
        </span>
      </div>
      {hint && <p className="text-xs text-muted -mt-1">{hint}</p>}

      {/* Files staged but not yet submitted are encoded into a hidden
          DataTransfer-backed input via a ref-controlled file input on
          form submit. React doesn't let us assign FileList directly, so
          we keep the native input around and sync it on every change. */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={ACCEPT}
        multiple
        className="sr-only"
        // Defensive: if the browser dispatches a change directly on this
        // hidden input (rare — accessibility tools sometimes do), absorb it.
        onChange={(e) => accept(e.target.files)}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-md border-2 border-dashed p-3 transition-colors duration-fast",
          dragOver
            ? "border-action bg-action/5"
            : "border-line-strong bg-surface",
        )}
      >
        {hidden ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-1 py-4 text-muted hover:text-fg transition-colors duration-fast"
          >
            <HugeiconsIcon
              icon={Attachment01Icon}
              size={20}
              strokeWidth={1.5}
            />
            <span className="text-sm">{label}</span>
            {hint && <span className="text-[11px] text-faint">{hint}</span>}
          </button>
        ) : (
          <>
            <ul className="flex flex-col gap-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 rounded-sm bg-subtle px-2 py-1.5"
                >
                  <FileIcon name={f.name} mime={f.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-fg truncate">
                      {f.name}
                    </p>
                    <p className="text-[10px] text-faint">
                      {formatSize(f.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="Remove"
                    className="inline-flex items-center justify-center h-6 w-6 rounded-full text-faint hover:text-danger hover:bg-danger-soft transition-colors duration-fast"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={12}
                      strokeWidth={1.75}
                    />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => inputRef.current?.click()}
                disabled={files.length >= max}
              >
                + Add more
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FileIcon({ name, mime }: { name: string; mime: string }) {
  const lower = name.toLowerCase();
  const isImage =
    mime.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/.test(lower);
  const isVideo =
    mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/.test(lower);
  const icon = isImage ? Image01Icon : isVideo ? Video01Icon : File01Icon;
  return (
    <HugeiconsIcon
      icon={icon}
      size={16}
      strokeWidth={1.5}
      className="text-muted shrink-0"
    />
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
