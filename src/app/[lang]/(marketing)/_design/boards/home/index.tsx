// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: Main.dc.html
// Regenerate: npm run design:port
/*
 * Some languages do not have the same shape as French. Turkish puts
 * the placeholder at the head of a sentence French ends with, which
 * moves a <span> and shifts every string after it, so it is
 * transcribed separately rather than bent into one component.
 */

import type { Locale } from "@/lib/i18n/config";
import { HomeBoardFR } from "./fr";
import { HomeBoardTR } from "./tr";

const BY_LOCALE: Partial<Record<Locale, typeof HomeBoardFR>> = { tr: HomeBoardTR };

export function HomeBoard({ lang }: { lang: Locale }) {
  const Board = BY_LOCALE[lang] ?? HomeBoardFR;
  return <Board lang={lang} />;
}
