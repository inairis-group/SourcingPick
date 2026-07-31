import { Link } from "@/components/ui/link";
import { Logo } from "./logo";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export function MarketingFooter({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const year = new Date().getFullYear();

  const cols: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
    {
      heading: dict.footer.product,
      links: [
        { href: `/${locale}/marketplace`, label: dict.nav.marketplace },
        { href: `/${locale}/factories`, label: dict.footer.forFactories },
        { href: `/${locale}/pricing`, label: dict.footer.pricing },
        { href: `/${locale}/about`, label: dict.footer.howItWorks },
      ],
    },
    {
      heading: dict.footer.company,
      links: [
        { href: `/${locale}/about`, label: dict.footer.about },
        { href: `/${locale}/faq`, label: dict.footer.faq },
        { href: `/${locale}/signup`, label: dict.footer.becomePartner },
      ],
    },
    {
      heading: dict.footer.legal,
      links: [
        { href: `/${locale}/legal/terms`, label: dict.footer.terms },
        { href: `/${locale}/legal/privacy`, label: dict.footer.privacy },
        { href: `/${locale}/legal/cookies`, label: dict.footer.cookies },
        {
          href: `/${locale}/legal/mentions-legales`,
          label: dict.legal.mentionsLegales.title,
        },
        { href: `/${locale}/legal/security`, label: dict.footer.security },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-subtle border-t border-line-subtle mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2">
            <Link href={`/${locale}`} variant="muted">
              <Logo height={32} />
              <span className="sr-only">SourcingPick</span>
            </Link>
            <p className="mt-4 text-sm text-muted max-w-xs">
              {dict.brand.tagline}
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h4 className="text-xs font-medium uppercase tracking-wide text-faint">
                {col.heading}
              </h4>
              {col.links.map((link) => (
                <Link key={link.href} href={link.href} variant="muted" className="text-sm">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-line-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-faint">
            © {year} SourcingPick · {dict.footer.allRights}
          </p>
          <a href='https://inairis.fr' className="text-xs text-faint" target="_blank">{dict.footer.madeIn}</a>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden text-center font-display translate-y-3 md:translate-y-16 text-[12vw] font-black leading-none tracking-tight text-info/20"
      >
        SOURCINGPICK
      </div>
    </footer>
  );
}
