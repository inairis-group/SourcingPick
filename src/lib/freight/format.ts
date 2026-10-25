import type { Locale } from "@/lib/i18n/config";
import { formatNumber } from "@/lib/i18n/formatters";
import type { Currency, Money } from "./estimate";

/** One amount: "1 234,56 RMB", "92,70 €", "29,66 $US" — the language's way. */
export function formatAmount(amount: number, currency: Currency, lang: Locale): string {
  if (currency === "RMB") return `${formatNumber(amount, lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RMB`;
  return formatNumber(amount, lang, { style: "currency", currency });
}

/** "1 234,56 RMB", plus " + 92,70 €" and " + 29,66 $US" for the parts in euros and dollars. */
export function formatMoney(m: Money, lang: Locale): string {
  const parts = [formatAmount(m.RMB, "RMB", lang)];
  if (m.EUR > 0) parts.push(formatAmount(m.EUR, "EUR", lang));
  if (m.USD > 0) parts.push(formatAmount(m.USD, "USD", lang));
  return parts.join(" + ");
}

export function formatKg(kg: number, lang: Locale): string {
  return `${formatNumber(kg, lang, { maximumFractionDigits: 1 })} kg`;
}
