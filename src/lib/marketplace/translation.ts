import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db/client";
import type { Locale } from "@/lib/i18n/config";

/**
 * AI translation for marketplace product copy (name + description) —
 * partner #5.
 *
 * Strategy: when a buyer lands on a product detail page in a locale
 * that's different from the listing's source locale, we translate
 * once via the Anthropic API (Claude Haiku — fast + cheap), cache
 * the result under `MarketplaceProduct.translations[locale]`, and
 * serve from cache on every subsequent read. Re-publish + edit
 * invalidate by stamping a `generatedAt` per locale that the caller
 * can compare against `product.updatedAt`.
 *
 * Source locale heuristic: the factory's organisation locale at write
 * time. We don't store that explicitly yet — for v1 we pass it in as
 * `sourceLocale`, which the page-level resolver pulls from the
 * factory owner's `User.locale`. (TODO: store on the product row.)
 *
 * Environment: requires `ANTHROPIC_API_KEY`. When unset (e.g. local
 * dev without an API key), we return the original copy and log a
 * warning — no network calls, no failures.
 */

export type ProductTranslation = {
  name: string;
  description: string;
  sourceLocale: Locale;
  generatedAt: string; // ISO timestamp
};

type TranslationMap = Partial<Record<Locale, ProductTranslation>>;

const MODEL = "claude-haiku-4-5-20251001";

export async function getOrTranslateProductCopy(args: {
  productId: string;
  sourceLocale: Locale;
  targetLocale: Locale;
  name: string;
  description: string;
}): Promise<{ name: string; description: string; translated: boolean }> {
  // No-op for same-locale or untranslatable input.
  if (args.sourceLocale === args.targetLocale) {
    return { name: args.name, description: args.description, translated: false };
  }
  if (!args.name.trim() && !args.description.trim()) {
    return { name: args.name, description: args.description, translated: false };
  }

  // Fast-path the cache. We re-read the row to get the latest
  // translations + updatedAt anchor.
  const row = await prisma.marketplaceProduct.findUnique({
    where: { id: args.productId },
    select: { translations: true, updatedAt: true },
  });
  if (!row) {
    return { name: args.name, description: args.description, translated: false };
  }
  const cache = (row.translations as TranslationMap) ?? {};
  const hit = cache[args.targetLocale];
  if (hit && new Date(hit.generatedAt) >= row.updatedAt) {
    return { name: hit.name, description: hit.description, translated: true };
  }

  // Translate via Anthropic.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Silent fall-back when the env var is missing — common in local
    // dev. Log once so an operator notices.
    console.warn(
      "[translation] ANTHROPIC_API_KEY not set — serving source-locale copy.",
    );
    return { name: args.name, description: args.description, translated: false };
  }

  const client = new Anthropic({ apiKey });
  const targetLanguageName = LANGUAGE_NAME[args.targetLocale];
  const sourceLanguageName = LANGUAGE_NAME[args.sourceLocale];

  let translated: ProductTranslation;
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `You translate B2B marketplace product copy from ${sourceLanguageName} to ${targetLanguageName}. Preserve the product's meaning, units, certifications, and any spec numbers verbatim. Output ONLY a JSON object with keys "name" and "description". No prose, no markdown fences.`,
      messages: [
        {
          role: "user",
          content: `Translate the following product listing.\n\nname: ${args.name}\n\ndescription:\n${args.description}`,
        },
      ],
    });
    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    const parsed = JSON.parse(stripFences(text)) as {
      name: string;
      description: string;
    };
    translated = {
      name: parsed.name,
      description: parsed.description,
      sourceLocale: args.sourceLocale,
      generatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.warn("[translation] API call failed:", e);
    return { name: args.name, description: args.description, translated: false };
  }

  // Persist back into the cache.
  await prisma.marketplaceProduct.update({
    where: { id: args.productId },
    data: {
      translations: {
        ...cache,
        [args.targetLocale]: translated,
      },
    },
  });

  return {
    name: translated.name,
    description: translated.description,
    translated: true,
  };
}

// Named for the model in the prompt, so every site language is listed — a
// listing can be translated into Polish without the dashboard being.
const LANGUAGE_NAME: Record<Locale, string> = {
  fr: "French",
  en: "English",
  zh: "Mandarin Chinese",
  es: "Spanish",
  de: "German",
  it: "Italian",
  pt: "European Portuguese",
  nl: "Dutch",
  ar: "Arabic",
  ru: "Russian",
  tr: "Turkish",
  pl: "Polish",
};

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
}
