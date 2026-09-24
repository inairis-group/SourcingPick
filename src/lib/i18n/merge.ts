/**
 * Deep-merge a partial dictionary onto a complete one.
 *
 * The product speaks twelve languages and has complete translations for four
 * of them. The eight added with the 2026-09 SaaS canvas are being filled
 * section by section, so a dictionary is allowed to be incomplete — but a
 * *screen* is not. Merging per key rather than per file is what makes that
 * safe: a Polish reader gets Polish everywhere Polish exists and English
 * exactly where it does not, instead of an English page because one string
 * was missing, or a blank because a key was.
 *
 * Lives apart from `get-dictionary.ts` because that module is `server-only`
 * and this is a pure function worth testing on its own.
 */
export function mergeDictionary<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base;

  // Arrays are replaced wholesale, never merged element by element: a
  // translated list of four bullet points must not inherit a fifth from
  // English because the source list happened to be longer.
  if (Array.isArray(base) || Array.isArray(over)) return over as T;

  if (typeof base !== "object" || base === null) return over as T;
  if (typeof over !== "object") return over as T;

  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    // A key the base does not have is a stale entry in the translation —
    // carried through rather than dropped, so it shows up in review instead
    // of disappearing silently.
    out[k] = k in out ? mergeDictionary((base as Record<string, unknown>)[k], v) : v;
  }
  return out as T;
}
