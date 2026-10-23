import { WHATSAPP_NUMBER } from "@/lib/contact/whatsapp";
import { getSiteUrl } from "./site";

/**
 * Structured data (schema.org JSON-LD) for the public pages.
 *
 * Only what the site itself states: the brand, the company behind it (from
 * the legal notice), the logo, the e-mail and the WhatsApp number. No street
 * address while the warehouse moves, and no founding date, which the home
 * page ("depuis 2023") and the legal notice (company formed in 2026) give
 * differently.
 */

type Json = Record<string, unknown>;

export function organizationJsonLd(): Json {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site}/#organization`,
    name: "Sourcing Pick",
    legalName: "Hangzhou Qiyuan Ying Technology Information Co., Ltd.",
    url: `${site}/`,
    logo: `${site}/logo.svg`,
    email: "contact@sourcingpick.com",
    telephone: WHATSAPP_NUMBER,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: WHATSAPP_NUMBER,
        email: "contact@sourcingpick.com",
      },
    ],
  };
}

export function websiteJsonLd(): Json {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site}/#website`,
    name: "Sourcing Pick",
    url: `${site}/`,
    publisher: { "@id": `${site}/#organization` },
  };
}

/** A FAQPage from question/answer pairs, as the page shows them. */
export function faqJsonLd(pairs: ReadonlyArray<{ question: string; answer: string }>): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/**
 * The script tag. `<` is escaped so a string in the data can never close the
 * tag it sits in.
 */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
