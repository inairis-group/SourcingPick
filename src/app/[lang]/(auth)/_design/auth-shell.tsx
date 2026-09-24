import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/components/ui/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * The two-pane frame the 2026-09 SaaS canvas draws behind every access screen
 * — login, signup, verification.
 *
 * Values are the artboard's: a flexible left pane holding a 420px column, a
 * fixed 560px navy panel on the right, 48px and 56px/48px padding, 22px and
 * 24px stacks. Unlike the marketing boards this is not transcribed — the app's
 * artboards are pictures of a working product, full of sample data (the login
 * field is drawn pre-filled with a customer's address), so only the frame and
 * its styling cross over. Every string comes from the dictionaries, which is
 * how this works in the ten languages the canvas does not draw.
 *
 * The right panel is hidden below 1024px rather than stacked: it is a
 * reassurance panel, and on a phone it would push the form — the reason the
 * page exists — under a fold.
 */
export function AuthShell({
  dict,
  control,
  children,
}: {
  dict: Dictionary;
  /** The language switcher — the one thing here the canvas does not draw. */
  control: ReactNode;
  children: ReactNode;
}) {
  const t = dict.auth.panel;
  return (
    <div className="flex min-h-dvh bg-surface">
      <div className="relative flex min-w-0 flex-1 items-center justify-center p-6 sm:p-12">
        {/* Out of the column rather than above it: each screen opens with its
            own mark — a wordmark on login and signup, an illustration on
            verification — and a switcher in the flow would displace it. */}
        <div className="absolute end-6 top-6 sm:end-12 sm:top-8">{control}</div>
        <div className="flex w-full max-w-[420px] flex-col gap-[22px]">{children}</div>
      </div>

      {/* Decorative in the strict sense: it repeats nothing the form needs and
          says nothing a screen reader has to hear twice on three pages. */}
      <aside
        aria-hidden="true"
        className="hidden w-[560px] shrink-0 flex-col justify-center gap-6 bg-navy-950 px-12 py-14 text-white lg:flex"
      >
        <Image
          src="/design/logo-white.svg"
          alt=""
          width={132}
          height={30}
          className="h-[30px] w-auto self-start"
        />
        <h2 className="font-display m-0 text-[34px] leading-[1.2] font-semibold tracking-[-0.02em]">
          {t.headline}
        </h2>
        <p className="text-navy-panel m-0 text-[16.5px] leading-[1.6]">{t.body}</p>
        <Image
          src="/design/app/auth-traceability.svg"
          alt=""
          width={464}
          height={340}
          className="h-auto w-full max-w-[464px] self-center"
          priority
        />
        <p className="text-navy-panel m-0 flex items-center gap-2.5 rounded-callout bg-white/[0.08] px-4 py-3.5 text-base">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-amber-edge)"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
          </svg>
          {t.note}
        </p>
      </aside>
    </div>
  );
}

/**
 * The heading pair every access screen opens with — 30px display over 15px
 * body, an 8px gap between them.
 */
export function AuthHeading({ title, body }: { title: string; body: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-display text-headline m-0 text-3xl leading-[1.2] font-semibold tracking-[-0.02em]">
        {title}
      </h1>
      <p className="text-muted m-0 text-md leading-[1.6]">{body}</p>
    </div>
  );
}

/**
 * The submit control the canvas draws at the foot of each access screen: full
 * width, 17px, with an arrow that points the way the language reads. The
 * arrow is flipped by CSS rather than by swapping the path, so it follows the
 * document direction without this component knowing the locale.
 */
export function AuthSubmitIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 rtl:-scale-x-100"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

/**
 * The wordmark the canvas puts at the head of the login and signup columns,
 * 30px tall and flush to the start edge.
 */
export function AuthWordmark({ href, alt }: { href: string; alt: string }) {
  return (
    <Link href={href} variant="muted" aria-label={alt} className="self-start">
      <Image src="/design/logo.svg" alt={alt} width={132} height={30} priority className="h-7.5 w-auto" />
    </Link>
  );
}
