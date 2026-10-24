import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";

/** "1 234,56 RMB", plus " + 92,70 €" when part of the price is in euros. */
export function formatPrice(rmb: number, eur: number, lang: Locale): string {
  const amount = (n: number) => formatNumber(n, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const parts = [`${amount(rmb)} RMB`];
  if (eur > 0) parts.push(formatNumber(eur, lang, { style: "currency", currency: "EUR" }));
  return parts.join(" + ");
}

export function formatKg(kg: number, lang: Locale): string {
  return `${formatNumber(kg, lang, { maximumFractionDigits: 1 })} kg`;
}
