/**
 * 1688 provider boundary.
 *
 * Every call to the outside world goes through this interface, and nothing
 * else in the app imports a 1688 SDK or URL. Two reasons:
 *
 *  1. We don't have a data source yet. The official Open Platform gates its
 *     useful endpoints behind partner approval and effectively a Chinese
 *     entity; the practical route is a reseller (OTAPI, Onebound, Sprwork).
 *     Building against an interface means the whole feature is testable now
 *     and swapping in a real provider is one file.
 *  2. The integration is a stub that may be removed. A single seam makes that
 *     a deletion rather than an excavation.
 *
 * Scraping 1688 is not implemented and should not be: it breaks against their
 * anti-bot constantly and is against their terms.
 *
 * No `server-only` here: this file is types plus an interface, which erase at
 * compile time. The implementations carry the API keys and are server-only;
 * the URL and pricing helpers are pure and intentionally usable client-side.
 */

/** Money from 1688 is CNY fen (1/100 yuan), integer — never floats. */
export type Fen = number;

export type Vendor1688Offer = {
  offerId: string;
  url: string;
  /** Original Chinese title. Kept verbatim — it is what the supplier sees. */
  title: string;
  /** Translated title when the provider supplies one. */
  titleTranslated?: string;
  images: string[];
  /** Supplier ask, before our markup. */
  unitPriceFen: Fen;
  moq: number;
  supplierName?: string;
  /** Free-form spec pairs; shape varies by provider, so kept loose. */
  attributes?: { name: string; value: string }[];
};

export type Vendor1688SearchResult = {
  offers: Vendor1688Offer[];
  /** Total matches upstream, when the provider reports it. */
  total?: number;
};

export type Vendor1688SubmitResult =
  | { ok: true; vendorOrderId: string }
  | { ok: false; reason: string };

export interface Vendor1688Provider {
  readonly name: string;
  /** True when the provider can actually reach 1688. */
  readonly live: boolean;
  search(query: string, page?: number): Promise<Vendor1688SearchResult>;
  getOffer(offerId: string): Promise<Vendor1688Offer | null>;
  /** Place the order upstream. Stubs return a not-configured failure. */
  submitOrder(input: {
    offerId: string;
    quantity: number;
    reference: string;
  }): Promise<Vendor1688SubmitResult>;
}
