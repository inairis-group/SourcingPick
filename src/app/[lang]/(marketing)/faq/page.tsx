import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingBag01Icon,
  Store01Icon,
  ChartLineData01Icon,
  PackageIcon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/components/ui/link";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.faq.title };
}

type SectionKey = "sourcing" | "marketplace" | "auctions" | "custom" | "disputes";

const ICONS: Record<SectionKey, typeof ShoppingBag01Icon> = {
  sourcing: ShoppingBag01Icon,
  marketplace: Store01Icon,
  auctions: ChartLineData01Icon,
  custom: PackageIcon,
  disputes: SecurityCheckIcon,
};

const ORDER: readonly SectionKey[] = [
  "sourcing",
  "marketplace",
  "auctions",
  "custom",
  "disputes",
] as const;

export default async function FaqPage({
  params,
}: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const t = dict.faq;
  const sections = ORDER.map((key) => ({
    key,
    icon: ICONS[key],
    block: t.sections[key],
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <header className="flex flex-col gap-2 mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-info">
          {t.eyebrow}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-headline tracking-tight">
          {t.title}
        </h1>
        <p className="text-sm sm:text-base text-muted leading-relaxed">
          {t.intro}
        </p>
      </header>

      <nav
        aria-label={t.tocLabel}
        className="mb-10 rounded-lg border border-line bg-surface p-4"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-faint mb-2">
          {t.tocLabel}
        </p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {sections.map((s) => (
            <li key={s.key}>
              <Link
                href={`#${s.key}`}
                variant="muted"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-fg hover:text-info transition-colors duration-fast"
              >
                <HugeiconsIcon icon={s.icon} size={14} strokeWidth={1.5} />
                {s.block.heading}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-10">
        {sections.map((s) => (
          <FaqSection key={s.key} id={s.key} icon={s.icon} block={s.block} />
        ))}
      </div>

      <div className="mt-16 pt-10 border-t border-line-subtle text-sm text-muted">
        {t.contactPrompt}{" "}
        <Link
          href={`mailto:${t.contactEmail}`}
          variant="muted"
          className="font-medium text-info hover:text-info"
        >
          {t.contactEmail}
        </Link>
      </div>
    </div>
  );
}

function FaqSection({
  id,
  icon,
  block,
}: {
  id: string;
  icon: typeof ShoppingBag01Icon;
  block: Dictionary["faq"]["sections"]["sourcing"];
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-1">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-info-soft text-info">
          <HugeiconsIcon icon={icon} size={18} strokeWidth={1.75} />
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-headline tracking-tight">
          {block.heading}
        </h2>
      </div>
      <p className="text-sm text-muted leading-relaxed mb-5 max-w-2xl">
        {block.intro}
      </p>
      <ul className="divide-y divide-line-subtle rounded-lg border border-line bg-surface">
        {block.items.map((item, idx) => (
          <li key={`${id}-${idx}`}>
            <details className="group">
              <summary className="cursor-pointer list-none px-4 py-3.5 flex items-start gap-3 hover:bg-subtle transition-colors duration-fast">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[10px] font-mono text-faint mt-0.5 group-open:bg-action group-open:text-on-action group-open:border-action transition-colors duration-fast">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-headline leading-snug">
                  {item.q}
                </span>
              </summary>
              <div className="px-4 pb-4 pl-12 -mt-1 text-sm text-muted leading-relaxed whitespace-pre-line">
                {item.a}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
