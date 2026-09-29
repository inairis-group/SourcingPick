export type FxQuote = {
  cnyPerEur: number;
  asOf: string;
  source: "ecb" | "currency-api" | "label";
  fetchedAt: number;
};

export function rateWhen(fetchedAt: number, en = false) {
  if (!fetchedAt) return "";
  return new Date(fetchedAt).toLocaleTimeString(en ? "en-GB" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

export function isYuan(currency?: string) {
  const value = String(currency || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  return value === "cny" || value === "cnh" || value === "rmb" || value === "yuan" || value === "yuans" || value === "¥" || value === "￥" || value === "renminbi";
}

export function moneyCode(currency?: string): "EUR" | "CNY" {
  return isYuan(currency) ? "CNY" : "EUR";
}

export function formatMoney(cents: number, currency?: string) {
  const amount = (Number.isFinite(cents) ? cents : 0) / 100;
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: moneyCode(currency) }).format(amount);
}

export function formatRate(rate: number) {
  return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(rate);
}

export function parseFxLabel(label?: string) {
  const n = Number(String(label || "").replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 7.6;
}

export function eurCentsFromCny(cents: number, cnyPerEur: number) {
  if (!(cnyPerEur > 0) || !Number.isFinite(cents)) return 0;
  return Math.round(cents / cnyPerEur);
}

export function cnyCentsFromEur(cents: number, cnyPerEur: number) {
  if (!(cnyPerEur > 0) || !Number.isFinite(cents)) return 0;
  return Math.round(cents * cnyPerEur);
}
