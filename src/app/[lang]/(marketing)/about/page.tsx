import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Factory01Icon,
  GlobeIcon,
  PackageIcon,
  SecurityCheckIcon,
  ShoppingBag01Icon,
  UserCircleIcon,
  WalletDoneIcon,
} from "@hugeicons/core-free-icons";
import { CtaSection } from "@/components/marketing/cta-section";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

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
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 animate-fade-up">
            <p className="text-sm font-medium text-brand-700 tracking-wide uppercase mb-4">
              {dict.about.eyebrow}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-headline tracking-tight leading-tight">
              {dict.about.title}
            </h1>
          </div>

          {/* Sober right-side composition: a soft brand-tinted aura behind
              a small grid of category pills. Reuses brand tokens so the
              piece reads as platform UI rather than a stock illustration.
              Hidden below `lg` to preserve the existing mobile layout. */}
          <div
            aria-hidden
            className="hidden lg:block lg:col-span-5 relative h-72"
          >
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-brand-100/70 via-brand-50/50 to-transparent blur-2xl" />
            <div className="relative h-full grid grid-cols-2 grid-rows-3 gap-3">
              <PillTile
                icon={Factory01Icon}
                title={dict.about.tiles.factories}
                tone="brand"
                className="col-span-2"
              />
              <PillTile
                icon={WalletDoneIcon}
                title={dict.about.tiles.escrow}
                tone="success"
              />
              <PillTile
                icon={SecurityCheckIcon}
                title={dict.about.tiles.certified}
                tone="info"
              />
              <PillTile
                icon={GlobeIcon}
                title={dict.about.tiles.global}
                tone="muted"
              />
              <PillTile
                icon={PackageIcon}
                title={dict.about.tiles.tracking}
                tone="warning"
              />
            </div>
          </div>
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

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-medium tracking-wide uppercase text-brand-700 mb-3">
            {dict.about.founders.eyebrow}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-headline tracking-tight">
            {dict.about.founders.title}
          </h2>
        </div>

        {/* Founder cards. Swap the photoUrl on each FounderCard to a real
            asset once the photo files land — until then the initials are the
            fallback. Names below are placeholders that the team can edit in
            this file (one place, no i18n round-trip needed). */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          
          <FounderCard
            name="Adam Fernandez"
            role={dict.about.founders.coFounderRole}
            photoUrl={null}
          />
          <FounderCard
            name="Caleb-Livingstone Emmanuel"
            role={dict.about.founders.eyebrow}
            photoUrl={null}
          />
        </div>
      </section>

      <CtaSection dict={dict} locale={lang} />
    </>
  );
}

const TONE_CLASSES: Record<
  "brand" | "success" | "info" | "muted" | "warning",
  string
> = {
  brand: "bg-brand-50 border-brand-100 text-brand-700",
  success: "bg-success-soft/60 border-success-edge text-success",
  info: "bg-info-soft/60 border-info-edge text-info",
  muted: "bg-surface border-line text-muted",
  warning: "bg-warning-soft/60 border-warning-edge text-warning",
};

/**
 * Founder card with photo or initials-avatar fallback. The initials variant
 * is intentional — the alternative would be a stock silhouette which looks
 * worse than two clean letters in the brand palette. To swap in a real
 * photo later, pass `photoUrl` and the component renders an `<img>` cover.
 */
function FounderCard({
  name,
  role,
  photoUrl,
}: {
  name: string;
  role: string;
  photoUrl: string | null;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
      <div className="shrink-0 h-16 w-16 rounded-full overflow-hidden bg-brand-50 text-brand-700 flex items-center justify-center font-semibold text-lg">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-headline">{name}</p>
        <p className="text-sm text-muted">{role}</p>
      </div>
    </div>
  );
}

function PillTile({
  icon,
  title,
  tone,
  className,
}: {
  icon: typeof ShoppingBag01Icon;
  title: string;
  tone: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border backdrop-blur-md px-3 py-2 flex items-center gap-2",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <HugeiconsIcon icon={icon} size={16} strokeWidth={1.5} />
      <span className="text-xs font-semibold tracking-wide">{title}</span>
    </div>
  );
}
