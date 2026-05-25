import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GlobeIcon,
  UserCircleIcon,
  WalletDoneIcon,
} from "@hugeicons/core-free-icons";
import { CtaSection } from "@/components/marketing/cta-section";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.about.title };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const values = [
    { icon: WalletDoneIcon, copy: dict.about.values.escrow },
    { icon: UserCircleIcon, copy: dict.about.values.agents },
    { icon: GlobeIcon, copy: dict.about.values.global },
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="max-w-3xl animate-fade-up">
          <p className="text-sm font-medium text-brand-700 tracking-wide uppercase mb-4">
            {dict.about.eyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-headline tracking-tight leading-tight">
            {dict.about.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="space-y-6 text-lg leading-relaxed text-fg">
          {dict.about.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="bg-subtle border-y border-line-subtle">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-medium tracking-wide uppercase text-brand-700 mb-3">
              {dict.about.principles.eyebrow}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-headline tracking-tight">
              {dict.about.principles.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {values.map(({ icon, copy }) => (
              <div key={copy.title} className="flex flex-col gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <HugeiconsIcon icon={icon} size={22} strokeWidth={1.5} />
                </span>
                <h3 className="text-md font-semibold text-headline">{copy.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{copy.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection dict={dict} locale={lang} />
    </>
  );
}
