# Pricing model v3 — overrides spec §1.1

**Status:** locked 2026-06-12. **Per-flow commission split**: sourcing 4% buyer / 1% supplier; marketplace 2% buyer / 1% seller. Total platform take is 5% on sourcing and 3% on marketplace.
**Supersedes:** spec §1.1, plus prior v2 / v2.1 of this document. The spec's SaaS subscription tiers (Starter / Growth / Pro) and per-plan commission rates remain **dropped**.

This doc is the source of truth for pricing in the v1 build. When the schema enforces commission calculation (Phase 3, payments), the values here are what get seeded into the `PricingRule` table.

## Model

**No subscription.** SourcingPick is paid 100% on successful transactions plus a per-request research fee for sourcing.

### Sourcing flow (agent-orchestrated, custom build)

| Side | Rate | Trigger | Notes |
|------|------|---------|-------|
| **Buyer** (client) | **4%** of order value | Order completion (escrow released) | Built into the quote shown to the buyer |
| **Buyer** (client) | Research fee at **€125/day or €500/week** | Per qualified sourcing request, before agent work starts | **Credited back** as platform credit if the buyer places an order within 30 days. Applies to every request — including small orders below €1,000. |
| **Supplier** (factory) | **1%** of order value | Order completion (escrow released) | Deducted from the payout to the factory |

Total platform take on a sourcing transaction: **5% of GMV**, flat.

### Marketplace flow (pre-negotiated catalogue, one-click buy)

| Side | Rate | Trigger | Notes |
|------|------|---------|-------|
| **Buyer** | **2%** of listed price | Order completion | Baked into the listed price — buyer pays sticker price, no add-on at checkout |
| **Buyer** | no research fee | — | One-click purchase, no agent labor to pay for |
| **Seller** (factory listing) | **1%** of listed price | Order completion | Deducted from the payout to the factory |

Marketplace listed price = factory net target ÷ (1 − 2% − 1%) = factory net ÷ 0.97. Both rates are invisible to the buyer (they see only the all-in price).

Total platform take on a marketplace transaction: **3% of GMV**, flat.

### Certification programme

Unchanged from spec §8.3. Per-norm forfait, billed to the factory or to a sponsoring client.

## What's included / not included

**Included in every transaction (no extra fee):**
- Funds held in escrow until conforming delivery is confirmed
- Tracking of the shipment to the buyer's premises
- Insurance specific to the product category (see also: insurance display in Phase 4 of the v3 rollout)

**Not included:**
- Shipping cost — buyer arranges or pays separately, ballpark surfaced via the v3 delivery calculator
- Customs / import duties — buyer's responsibility under the agreed Incoterm

## Dispute policy (unchanged)

**Standard product issue** (off-spec, defective, late beyond grace period):
- Partial refund to the buyer
- SourcingPick retains **20%** of the disputed amount
- That 20% is **split 50/50** between SourcingPick and the supplier (supplier compensation for materials/labor already committed)

**Custom / personalised product issue:**
- **Full refund** to the buyer
- SourcingPick and the supplier absorb their respective costs
- Rationale: custom goods are unsellable to anyone else; the platform shouldn't shift that risk to the buyer

## Implementation pointers

- `src/lib/orders/pricing.ts` exports `SOURCING_BUYER_BPS`, `SOURCING_SUPPLIER_BPS`, `MARKETPLACE_BUYER_BPS`, `MARKETPLACE_SELLER_BPS`, `applyBuyerMarkup(price, flow)`, `computeFactoryPayout(price, qty, flow)`, `buyerMarkupBps(flow)`, `supplierFeeBps(flow)`.
- `MARKETPLACE_NET_DIVISOR_BPS = 9700` (1 − 2% − 1%) is the divisor when the factory enters a net target and the form derives the listed price.
- Sourcing-flow callsites: tender quote submission ([tender-actions.ts](../src/lib/sourcing/tender-actions.ts)), agent-direct quote ([agent-quote-actions.ts](../src/lib/sourcing/agent-quote-actions.ts)).
- Marketplace-flow callsites: listing creation/edit ([marketplace/actions.ts](../src/lib/marketplace/actions.ts)).
- Payout-time flow resolution: `finalize.ts` reads `order.quote.request.origin` to pick the right rate.

## History

- **2026-06-12 v3** — Per-flow split: sourcing 4%/1%, marketplace 2%/1%. Total take cut roughly in half (was 9% on sourcing, 9% on marketplace at v2.1). Migration `20260612_marketplace_buyer_rate_2pc_v3` re-derived `priceCentsClient` on every non-archived MarketplaceProduct row from the new 1.02× rate.
- **2026-06-08 v2.1** — Sides flipped from 6%/3% to 3%/6%. Same 9% total, redistributed.
- **2026-05-26 v2 (caps removed)** — Original v2 cap (€15k buyer / €5k supplier) stripped. Buyer rate dropped 12% → 6%.
- **2026-05-24 v2 lock** — Pricing v2 first locked (Caystone + partner alignment).

## Memory cross-references

- `project_pricing_v2.md` — points to this doc for pricing
- `feedback_spec_adherence.md` — the rule that forced surfacing this deviation explicitly
