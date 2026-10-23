import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { sitePath } from "@/lib/i18n/site-paths";
import { pageAlternates } from "@/lib/seo/alternates";
import { faqJsonLd, JsonLd } from "@/lib/seo/structured-data";
import { BLOG_ARTICLES, blogArticle } from "@/content/blog";
import { SeoArticle } from "../../_design/seo-article";
import { SeoMarkdown } from "../../_design/seo-markdown";

/** /blog/<slug> — one article. French only. */

export function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ lang: "fr", slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  const article = lang === "fr" ? blogArticle(slug) : undefined;
  if (!article || !isLocale(lang)) return {};
  return {
    title: { absolute: article.metaTitle },
    description: article.metaDescription,
    alternates: pageAlternates(lang, `/blog/${article.slug}`, ["fr"]),
  };
}

export default async function BlogArticlePage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  const article = lang === "fr" ? blogArticle(slug) : undefined;
  if (!article) notFound();
  const faq = article.faq ?? [];
  return (
    <>
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}
      <SeoArticle eyebrow="Article" back={{ href: sitePath("fr", "/blog"), label: "Blog" }} h1={article.title} lead={article.lead}>
        <SeoMarkdown>{article.body}</SeoMarkdown>
        {faq.length > 0 && (
          <SeoMarkdown>
            {["## Questions fréquentes", ...faq.map((q) => `### ${q.question}\n\n${q.answer}`)].join("\n\n")}
          </SeoMarkdown>
        )}
      </SeoArticle>
    </>
  );
}
