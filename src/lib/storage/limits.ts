/**
 * Upload size limits shared by client forms and server validation.
 *
 * Pure module — NO `server-only` — so client components can pre-validate a
 * multipart submission before posting and surface a precise "too large"
 * message instead of letting the user hit a raw nginx 413 (which happens at
 * the proxy, before the Server Action runs, so it can't return a friendly
 * error).
 *
 * MAX_UPLOAD_BYTES mirrors two infra limits that must stay in sync:
 *   - nginx  `client_max_body_size`            (reverse proxy)
 *   - Next   `serverActions.bodySizeLimit`     (next.config.ts)
 * If you change one, change all three.
 */
export const MAX_UPLOAD_BYTES = 150 * 1024 * 1024; // 150 MB

/** Human-readable byte size, e.g. 178 MB / 512 KB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

/** Sum the byte sizes of a set of files (ignores non-File entries). */
export function sumFileSizes(files: Iterable<unknown>): number {
  let total = 0;
  for (const f of files) {
    if (f instanceof File) total += f.size;
  }
  return total;
}
