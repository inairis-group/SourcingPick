import { notFound } from "next/navigation";
import { CtaSection } from "@/components/marketing/cta-section";
import { Reveal } from "@/components/marketing/reveal";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.about.title };
}

/**
 * About — editorial rather than promotional.
 *
 * Structure follows the reference About page: a statement opener, then a
 * labelled story band split by a vertical rule, then values, then the team.
 *
 * Two of the reference's sections are deliberately absent. It leads with a
 * full-bleed group photograph and closes with a "life at / we're hiring"
 * block; we have neither a team photo nor any hiring copy, and inventing
 * either — particularly staged team imagery — would be a worse outcome than
 * a shorter page. They slot straight in if those assets ever land.
 */
export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const values = [
    dict.about.values.escrow,
    dict.about.values.agents,
    dict.about.values.global,
  ];

  // The closing paragraph is set as a display statement rather than body
  // copy — the same move the reference makes with its last line. Guarded so a
  // single-paragraph translation still renders sensibly.
  const body = dict.about.body;
  const closing = body.length > 1 ? body[body.length - 1] : null;
  const lead = closing ? body.slice(0, -1) : body;

  return (
    <>
      {/* Statement opener. The reference runs a group photograph here; with
          no such asset, the sentence carries it alone. */}
      <section className="max-w-6xl mx-auto px-4 pt-32 pb-16 sm:px-6 lg:pt-40 lg:pb-24">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-info mb-4 text-xs font-medium tracking-wide uppercase">
            {dict.about.eyebrow}
          </p>
          <h1 className="font-display text-headline text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {dict.about.title}
          </h1>
        </Reveal>
      </section>

      {/* Story band — narrow label column, vertical rule, wide prose column.
          The rule uses `border-s` (inline-start) so it flips correctly in
          Arabic rather than stranding itself on the wrong edge. */}
      <section className="max-w-6xl mx-auto px-4 pb-20 sm:px-6 lg:pb-32">
        <Reveal className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-0">
          <p className="text-faint font-mono text-xs tracking-wide uppercase lg:col-span-3">
            {dict.about.principles.eyebrow}
          </p>

          <div className="lg:border-line lg:col-span-9 lg:border-s lg:ps-12">
            <div className="text-fg space-y-6 text-lg leading-relaxed">
              {lead.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {closing && (
              <p className="font-display text-headline mt-10 text-2xl leading-snug font-bold tracking-tight text-balance sm:text-3xl">
                {closing}
              </p>
            )}
          </div>
        </Reveal>
      </section>

      {/* Values. Typographic rather than the previous icon grid — and
          deliberately not uppercased: the reference's all-caps value list is a
          Latin-script device that does nothing in Chinese and Arabic. */}
      <section className="bg-subtle border-line-subtle border-y">
        <div className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:py-32">
          <Reveal className="mb-12 max-w-3xl lg:mb-16">
            <h2 className="font-display text-headline text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {dict.about.principles.title}
            </h2>
          </Reveal>

          <dl className="flex flex-col">
            {values.map((value, i) => (
              <Reveal
                key={value.title}
                delay={80 + i * 70}
                className="border-line-subtle grid grid-cols-1 gap-3 border-t py-8 md:grid-cols-12 md:gap-8"
              >
                <dt className="font-display text-headline text-xl font-bold tracking-tight md:col-span-5 lg:text-2xl">
                  {value.title}
                </dt>
                <dd className="text-muted text-md leading-relaxed md:col-span-7">
                  {value.body}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:py-32">
        <Reveal className="mb-12 max-w-3xl">
          <p className="text-info mb-3 text-xs font-medium tracking-wide uppercase">
            {dict.about.founders.eyebrow}
          </p>
          <h2 className="font-display text-headline text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {dict.about.founders.title}
          </h2>
        </Reveal>

        {/* Names live here rather than in the dictionaries — they're the same
            in every locale. Roles come from the dictionary so translations
            stay in sync. Pass `photoUrl` once real portraits exist; until
            then the initials render. */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TeamCard
            name="Adam Fernandez"
            role={dict.about.founders.adamRole}
            photoUrl={null}
            delay={80}
          />
          <TeamCard
            name="Whey"
            role={dict.about.founders.wheyRole}
            photoUrl={null}
            delay={150}
          />
          <TeamCard
            name="Caleb-Livingstone Emmanuel"
            role={dict.about.founders.calebRole}
            photoUrl={null}
            delay={220}
          />
        </div>
      </section>

      <CtaSection dict={dict} locale={lang} />
    </>
  );
}

/**
 * Team card — tall portrait frame with the name and role beneath, matching
 * the portrait grid on the reference page.
 *
 * The initials fallback is intentional. A stock silhouette would read as a
 * placeholder for a person who doesn't exist; two letters in the brand palette
 * read as a deliberate choice until real photography lands.
 */
function TeamCard({
  name,
  role,
  photoUrl,
  delay,
}: {
  name: string;
  role: string;
  photoUrl: string | null;
  delay: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Reveal as="article" delay={delay} className="flex flex-col gap-4">
      <div
        className={cn(
          "bg-info-soft border-line aspect-3/4 overflow-hidden rounded-3xl border",
          "text-info flex items-center justify-center",
          "duration-base ease-default transition-transform hover:-translate-y-0.5",
        )}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden className="text-5xl font-bold tracking-tight">
            {initials}
          </span>
        )}
      </div>

      <div>
        <p className="text-headline text-base font-semibold">{name}</p>
        <p className="text-muted mt-0.5 text-sm">{role}</p>
      </div>
    </Reveal>
  );
}
