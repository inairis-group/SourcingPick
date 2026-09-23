import Image from "next/image";
import { Link } from "@/components/ui/link";
import { LocaleSwitch } from "@/components/site/locale-switch";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/**
 * Site header for the 2026-09 redesign.
 *
 * Two bars, as drawn: a navy announcement strip that states plainly the
 * company is new, then the navigation on a near-white translucent ground.
 * That strip is a deliberate piece of positioning, not decoration — the
 * design's whole trust argument is "we'd rather show you the warehouse than
 * invent reviews", and it opens with that.
 *
 * The nav is sticky so the quote CTA stays reachable down an 8000px page.
 */
export function SiteNav({
  lang,
  dict,
  signedIn,
  dashboardHref,
}: {
  lang: Locale;
  dict: Dictionary;
  signedIn: boolean;
  dashboardHref: string | null;
}) {
  const t = dict.site.home.nav;
  const base = `/${lang}`;

  const links = [
    { href: `${base}/services`, label: t.link1 },
    { href: `${base}/comment-ca-marche`, label: t.link2 },
    { href: `${base}/entrepot`, label: t.link3 },
    { href: `${base}/pricing`, label: t.link4 },
    { href: `${base}/faq`, label: t.link5 },
  ];

  return (
    <div className="sticky top-0 z-50">
      <div className="bg-navy-900 text-navy-200 flex min-h-11 items-center justify-center gap-3.5 px-6 py-2.5 text-center text-sm">
        <span
          aria-hidden="true"
          className="bg-amber-edge h-2 w-2 shrink-0 rounded-full"
        />
        <span className="hidden sm:inline">{t.announce}</span>
        <Link
          href={`${base}#transparence`}
          className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-white hover:underline"
        >
          {t.announceLink}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <header className="border-navy-100 bg-navy-25/92 flex h-21 items-center justify-between gap-6 border-b px-6 backdrop-blur-md lg:px-24">
        <Link href={base} aria-label="Sourcing Pick" className="flex shrink-0 items-center">
          <Image src="/logo.svg" alt="Sourcing Pick" width={168} height={34} className="h-[34px] w-auto" priority />
        </Link>

        <nav aria-label={t.link1} className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-navy-900 hover:text-action text-[15px] font-medium whitespace-nowrap transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <LocaleSwitch lang={lang} />
          <Link
            href={signedIn && dashboardHref ? dashboardHref : `${base}/login`}
            className="text-navy-900 hover:text-action hidden text-[15px] font-medium whitespace-nowrap transition-colors sm:inline"
          >
            {t.login}
          </Link>
          <Link
            href={`${base}/devis`}
            className="bg-action hover:bg-action-hover duration-fast inline-flex h-11 items-center rounded-full px-5 text-[15px] font-semibold whitespace-nowrap text-white transition-colors"
          >
            {t.quote}
          </Link>
        </div>
      </header>
    </div>
  );
}
