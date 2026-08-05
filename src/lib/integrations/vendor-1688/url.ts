/**
 * 1688 URL helpers. Pure and deliberately NOT server-only: the client needs
 * `parseOfferId` to validate a pasted link before submitting it.
 */

/**
 * Offer id from a 1688 URL.
 *
 * Deterministic and provider-independent, so it is worth having regardless of
 * which feed we end up on. Handles the detail and mobile forms:
 *   detail.1688.com/offer/123456789.html
 *   m.1688.com/offer/123456789.html
 *   detail.m.1688.com/page/index.htm?offerId=123456789
 */
export function parseOfferId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d{6,}$/.test(trimmed)) return trimmed;
  const fromPath = trimmed.match(/\/offer\/(\d{6,})/);
  if (fromPath?.[1]) return fromPath[1];
  const fromQuery = trimmed.match(/[?&]offerId=(\d{6,})/i);
  if (fromQuery?.[1]) return fromQuery[1];
  return null;
}

export function offerUrl(offerId: string): string {
  return `https://detail.1688.com/offer/${offerId}.html`;
}
