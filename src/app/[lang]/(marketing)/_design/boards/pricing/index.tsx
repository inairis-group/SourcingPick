// GENERATED FROM THE 2026-10 DESIGN EXPORT — DO NOT EDIT BY HAND.
// Source: Site-Tarifs.dc.html
// Regenerate: npm run design:port
/*
 * Some languages do not have the same shape as French. Turkish puts
 * the placeholder at the head of a sentence French ends with, which
 * moves a <span> and shifts every string after it, so it is
 * transcribed separately rather than bent into one component.
 */

import type { Locale } from "@/lib/i18n/config";
import { PricingBoardFR } from "./fr";
import { PricingBoardEN } from "./en";

const BY_LOCALE: Partial<Record<Locale, typeof PricingBoardFR>> = { en: PricingBoardEN, zh: PricingBoardEN, es: PricingBoardEN, de: PricingBoardEN, it: PricingBoardEN, pt: PricingBoardEN, nl: PricingBoardEN, ar: PricingBoardEN, ru: PricingBoardEN, tr: PricingBoardEN, pl: PricingBoardEN };

export function PricingBoard({ lang }: { lang: Locale }) {
  const Board = BY_LOCALE[lang] ?? PricingBoardFR;
  return <Board lang={lang} />;
}
