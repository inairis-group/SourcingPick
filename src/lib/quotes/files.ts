/**
 * What may be attached to a public quote request.
 *
 * Shared by the picker and the action on purpose. The browser check is there
 * so somebody dragging a 90 MB video finds out before they wait for it to
 * upload; the server check is the one that decides. If the two ever disagreed,
 * a visitor would be told their file was fine and then silently lose it.
 *
 * The accepted types are the three the canvas names under the drop zone —
 * "PDF, JPG or PNG" — and not the wider set the attachment adapter allows.
 * The page makes a promise; this keeps it.
 */

export const MAX_FILES = 8;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 30 * 1024 * 1024;

export const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;

/** For the input's `accept`, which matches on extension in some browsers. */
export const ACCEPT_ATTR = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

const ACCEPTED_EXT = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

export type FileRejection =
  | "too_many_files"
  | "file_too_large"
  | "total_too_large"
  | "unsupported_type";

function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i).toLowerCase();
}

function accepted(file: { name: string; type: string }): boolean {
  // Type first, extension as the fallback: some browsers report an empty
  // type for a file dragged out of an archive or a scanner app.
  if ((ACCEPTED_MIME as readonly string[]).includes(file.type)) return true;
  return file.type === "" && ACCEPTED_EXT.has(extensionOf(file.name));
}

/**
 * Checks a whole selection at once, because two of the three limits are only
 * meaningful across the set.
 */
export function validateQuoteFiles(
  files: readonly { name: string; type: string; size: number }[],
): { ok: true } | { ok: false; error: FileRejection; file?: string } {
  const real = files.filter((f) => f.size > 0);
  if (real.length > MAX_FILES) return { ok: false, error: "too_many_files" };

  let total = 0;
  for (const f of real) {
    if (!accepted(f)) {
      return { ok: false, error: "unsupported_type", file: f.name };
    }
    if (f.size > MAX_FILE_BYTES) {
      return { ok: false, error: "file_too_large", file: f.name };
    }
    total += f.size;
  }
  if (total > MAX_TOTAL_BYTES) return { ok: false, error: "total_too_large" };
  return { ok: true };
}

/** "2.4 MB" — for the picker's file list and the admin's. */
export function formatBytes(bytes: number, locale: string): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(mb)} MB`;
  }
  const kb = Math.max(1, Math.round(bytes / 1024));
  return `${new Intl.NumberFormat(locale).format(kb)} KB`;
}
