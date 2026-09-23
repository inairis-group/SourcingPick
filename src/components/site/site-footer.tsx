import Image from "next/image";
import { Link } from "@/components/ui/link";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/**
 * Site footer for the 2026-09 redesign.
 *
 * The design lists twelve languages; this lists the four that have
 * dictionaries. Offering a language whose pages 404 is a worse failure than
 * offering fewer — so the list is driven by `locales`, not by copy.
 */
export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const f = dict.site.home.footer;
  const base = `/${lang}`;

  const columns = [
    {
      title: f.colServices,
      links: [
        f.service1, f.service2, f.service3, f.service4,
        f.service5, f.service6, f.service7,
      ].map((label) => ({ label, href: `${base}/services` })),
    },
    {
      title: f.colCompany,
      links: [
        { label: f.company1, href: `${base}/about` },
        { label: f.company2, href: `${base}/entrepot` },
        { label: f.company3, href: `${base}#transparence` },
        { label: f.company4, href: `${base}/contact` },
      ],
    },
    {
      title: f.colHelp,
      links: [
        { label: f.help1, href: `${base}/faq` },
        { label: f.help2, href: `${base}/application` },
        { label: f.help3, href: `${base}/login` },
        { label: f.help4, href: `${base}/devis` },
      ],
    },
    {
      title: f.colLegal,
      links: [
        { label: f.legal1, href: `${base}/legal` },
        { label: f.legal2, href: `${base}/legal/privacy` },
        { label: f.legal3, href: `${base}/legal/cookies` },
        { label: f.legal4, href: `${base}/legal/terms` },
      ],
    },
  ];

  return (
    <footer className="bg-navy-950 pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Image
              src="/design/logo-white.svg"
              alt="Sourcing Pick"
              width={168}
              height={34}
              className="h-[34px] w-auto"
            />
            <p className="font-display mt-5 text-lg font-semibold text-white">
              {f.tagline}
            </p>
            <p className="text-navy-300 mt-3 max-w-sm text-sm leading-relaxed">
              {f.body}
            </p>
            <a
              href={`mailto:${f.email}`}
              className="text-brand-onnavy mt-4 inline-block text-sm font-semibold hover:underline"
            >
              {f.email}
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-navy-400 text-[11px] font-semibold tracking-[0.08em] uppercase">
                {col.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-navy-200 text-sm transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="font-mono text-navy-400 text-[11px] font-semibold tracking-[0.08em] uppercase">
            {f.langsLabel}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {locales.map((l) => (
              <li key={l}>
                <Link
                  href={`/${l}`}
                  lang={l}
                  className={
                    l === lang
                      ? "text-sm font-semibold text-white"
                      : "text-navy-400 text-sm transition-colors hover:text-white"
                  }
                >
                  {localeLabels[l]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-navy-400 mt-8 text-xs">
          {f.copyright}{" "}
          <span className="bg-amber-soft text-amber-ink font-mono rounded px-1.5 py-0.5 font-semibold">
            {f.entity}
          </span>{" "}
          · {f.place}
        </p>
      </div>
    </footer>
  );
}
