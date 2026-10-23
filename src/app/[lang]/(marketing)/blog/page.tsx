import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { pageAlternates } from "@/lib/seo/alternates";
import { BLOG_ARTICLES } from "@/content/blog";

/** /blog — the list of articles. French only; 404 while there are none. */

const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (lang !== "fr" || !isLocale(lang) || BLOG_ARTICLES.length === 0) return {};
  return {
    title: { absolute: "Blog : importer de Chine, entre l’usine et le navire | Sourcing Pick" },
    description: "Consolidation, contrôle qualité, caisses NIMP 15, fret depuis Nansha, sourcing : nos guides pour importer de Chine.",
    alternates: pageAlternates(lang, "/blog", ["fr"]),
  };
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (lang !== "fr" || BLOG_ARTICLES.length === 0) notFound();
  const articles = [...BLOG_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section style={{ padding: "calc(88px * var(--sp-vs, 1)) var(--sp-gutter, 120px) calc(104px * var(--sp-vs, 1))", display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "8px", background: "#FFFFFF", padding: "6px 12px", borderRadius: "999px", border: "1px solid #DCE3F2", fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", fontSize: "12.5px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#155DFC" }}>
        Blog
      </div>
      <h1 style={{ margin: 0, fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif", fontSize: "var(--sp-fs-54, 54px)", lineHeight: 1.06, fontWeight: 600, letterSpacing: "-0.03em", color: "#0E1A3D", textWrap: "balance" }}>
        Importer de Chine, entre l’usine et le navire
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "var(--sp-grid-r3, repeat(3, minmax(0, 1fr)))", gap: "24px" }}>
        {articles.map((a) => (
          <Link key={a.slug} href={sitePath("fr", `/blog/${a.slug}`)} style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "var(--sp-pad-28, 28px)", borderRadius: "24px", background: "#FFFFFF", border: "1px solid #DCE3F2", color: "#0E1A3D" }}>
            <span style={{ fontFamily: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace", fontSize: "12px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#4A5578" }}>
              {date.format(new Date(`${a.date}T00:00:00Z`))}
            </span>
            <span style={{ fontFamily: "'Unbounded', 'Trebuchet MS', sans-serif", fontSize: "var(--sp-fs-22, 22px)", lineHeight: 1.25, fontWeight: 600, letterSpacing: "-0.03em" }}>{a.title}</span>
            <span style={{ fontSize: "15.5px", lineHeight: 1.55, color: "#4A5578" }}>{a.metaDescription}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
