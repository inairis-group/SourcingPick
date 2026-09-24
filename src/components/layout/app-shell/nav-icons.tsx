/**
 * The sidebar's icons, transcribed from the 2026-09 SaaS canvas.
 *
 * The application already depends on an icon set, and none of it is used
 * here. The canvas draws its own marks — 24-unit grid, 1.9 stroke, round caps
 * — and they are not interchangeable with a library's: the "documents" mark
 * is a paperclip bent to a particular angle, the "billing" mark is a struck
 * euro. Substituting near-equivalents is exactly the drift the transcription
 * of the marketing site existed to prevent, so they are copied path for path.
 *
 * Keyed by mark rather than by menu entry, because the same mark does
 * different jobs in different roles: the person icon is "Settings" for a
 * client and "Agents" for an administrator.
 */

export type NavIconKey =
  | "grid"
  | "list"
  | "cube"
  | "euro"
  | "paperclip"
  | "chat"
  | "person"
  | "document"
  | "card"
  | "people"
  | "envelope"
  | "funnel"
  | "cycle"
  | "flag"
  | "arrowBack";

const PATHS: Record<NavIconKey, React.ReactNode> = {
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  list: (
    <>
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  euro: (
    <>
      <path d="M17 6.5A7 7 0 007 12a7 7 0 0010 5.5" />
      <path d="M4 10h9" />
      <path d="M4 14h9" />
    </>
  ),
  paperclip: (
    <path d="M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.5 3.5 0 015 5L10 17.5a2 2 0 01-3-3l7.5-7.5" />
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5" />
      <path d="M16 4.8a3.5 3.5 0 010 6.4" />
      <path d="M18 14.8c1.8.8 3 2.6 3.5 5.2" />
    </>
  ),
  envelope: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
    </>
  ),
  funnel: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,
  cycle: (
    <>
      <path d="M4 8V4h4" />
      <path d="M16 4h4v4" />
      <path d="M20 16v4h-4" />
      <path d="M8 20H4v-4" />
      <path d="M4 12h16" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </>
  ),
  arrowBack: (
    <>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </>
  ),
};

/**
 * `stroke` is `currentColor` so a nav row can colour its own icon by changing
 * its text colour — the canvas draws the resting icon in #8E9BC4 and the
 * active one in amber, which is a colour change and nothing else.
 */
export function NavIcon({ name, size = 18 }: { name: NavIconKey; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {PATHS[name]}
    </svg>
  );
}
