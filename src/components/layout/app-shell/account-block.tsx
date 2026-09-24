import Image from "next/image";

/**
 * The signed-in person, at the end of the top bar.
 *
 * The canvas draws a 38px round avatar, the name at 14px semibold, the role
 * underneath at 12.5px, and a chevron. The name and role collapse below `sm`,
 * where the search field needs the room more than the label does — the avatar
 * stays, so the row still says who you are.
 *
 * The chevron is drawn because the canvas draws it. It opens nothing yet: the
 * account menu is `SaaS-Modales`, which is a later slice, and a control that
 * silently does nothing is better than a menu nobody designed.
 */
export function AccountBlock({
  name,
  role,
  image,
}: {
  name: string;
  role: string;
  image: string | null;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {image ? (
        <Image
          src={image}
          alt=""
          width={38}
          height={38}
          className="size-9.5 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="bg-navy-50 text-navy-900 flex size-9.5 shrink-0 items-center justify-center rounded-full text-md font-semibold"
        >
          {initial(name)}
        </span>
      )}
      <span className="hidden min-w-0 flex-col sm:flex">
        <span className="text-fg truncate text-base font-semibold">{name}</span>
        <span className="text-muted truncate text-[12.5px]">{role}</span>
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-muted hidden shrink-0 sm:block"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

/**
 * First letter of the name, or of the address when there is no name.
 * `Intl.Segmenter` rather than `[0]`, because a name may begin with a
 * character that JavaScript stores as two code units, and half of one of
 * those renders as a replacement glyph.
 */
function initial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const first = segmenter.segment(trimmed)[Symbol.iterator]().next();
  return first.done ? "?" : first.value.segment.toUpperCase();
}
