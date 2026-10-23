import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { pageAlternates } from "@/lib/seo/alternates";
import { SERVICE_PAGES } from "@/content/seo/service-pages";
import { SeoArticle } from "../../_design/seo-article";
import { SeoMarkdown } from "../../_design/seo-markdown";

/**
 * The SEO pack's five service pages (/services/consolidation-entrepot-chine,
 * …), one per operation of the hub page. French only: in another language the
 * address does not exist.
 */

function find(lang: string, slug: string) {
  if (lang !== "fr") return undefined;
  return SERVICE_PAGES.find((p) => p.slug === slug);
}

export function generateStaticParams() {
  return SERVICE_PAGES.map((p) => ({ lang: "fr", slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  const page = isLocale(lang) ? find(lang, slug) : undefined;
  if (!page || !isLocale(lang)) return {};
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: pageAlternates(lang, `/services/${page.slug}`, ["fr"]),
  };
}

export default async function ServiceDetailPage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  const page = isLocale(lang) ? find(lang, slug) : undefined;
  if (!page) notFound();
  return (
    <SeoArticle
      eyebrow={page.eyebrow}
      back={{ href: sitePath("fr", "/services"), label: "Services" }}
      h1={page.h1}
      lead={page.lead}
      image={page.image}
    >
      <SeoMarkdown>{page.body}</SeoMarkdown>
    </SeoArticle>
  );
}
