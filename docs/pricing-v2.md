# Pricing model v2 — overrides spec §1.1

**Status:** locked 2026-05-24. Caps removed 2026-05-26. Buyer rate dropped 12% → 6% on 2026-05-26. **Sides re-balanced on 2026-06-08 → buyer 3% / supplier 6%** (partner decision — most of the platform take now lands on the factory; buyers see a smaller surcharge at checkout). Total platform take unchanged at 9% of GMV.
**Supersedes:** spec §1.1 ("Modèle de revenus"). The spec's SaaS subscription tiers (Starter / Growth / Pro) and per-plan commission rates (8% / 6% / 4%) are **dropped**.

This doc is the source of truth for pricing in the v1 build. When the schema enforces commission calculation (Phase 3, payments), the values here are what get seeded into the `PricingRule` table.

## Model

**No subscription.** SourcingPick is paid 100% on successful transactions plus a per-request research fee for sourcing.

### Sourcing flow (agent-orchestrated, custom build)

| Side | Rate | Trigger | Notes |
|------|------|---------|-------|
| **Buyer** (client) | **3%** of order value | Order completion (escrow released) | Built into the quote shown to the buyer |
| **Buyer** (client) | Research fee at **€125/day or €500/week** | Per qualified sourcing request, before agent work starts | **Credited back** as platform credit if the buyer places an order within 30 days. Applies to every request — including small orders below €1,000. |
| **Supplier** (factory) | **6%** of order value | Order completion (escrow released) | Deducted from the payout to the factory |

Total platform take on a sourcing transaction: **9% of GMV**, flat. With agents based in China (loaded cost ~€80–€120/day), even orders down to €5k GMV are profitable per-request once you add the research fee.

### Marketplace flow (pre-negotiated catalogue, one-click buy)

| Side | Rate | Trigger | Notes |
|------|------|---------|-------|
| **Buyer** | **3%** of listed price | Order completion | Baked into the listed price — buyer pays sticker price, no add-on at checkout |
| **Buyer** | no research fee | — | One-click purchase, no agent labor to pay for |
| **Supplier** (factory listing) | **6%** of listed price | Order completion | Deducted from the payout to the factory |

Marketplace listed price = factory net target ÷ (1 − 3% − 6%) = factory net ÷ 0.91. Both rates are invisible to the buyer (they see only the all-in price).

### Certification programme

Unchanged from spec §8.3. Per-norm forfait, billed to the factory or to a sponsoring client.

## What's included / not included

**Included in every transaction (no extra fee):**
- Funds held in escrow until conforming delivery is confirmed
- Tracking of the shipment to the buyer's premises
- Insurance specific to the product category

**Not included:**
- Shipping cost — buyer arranges or pays separately
- Customs / import duties — buyer's responsibility under the agreed Incoterm

## Dispute policy (informs the EscrowTransaction state machine, Phase 3)

**Standard product issue** (off-spec, defective, late beyond grace period):
- Partial refund to the buyer
- SourcingPick retains **20%** of the disputed amount
- That 20% is **split 50/50** between SourcingPick and the supplier (supplier compensation for materials/labor already committed)

**Custom / personalised product issue:**
- **Full refund** to the buyer
- SourcingPick and the supplier absorb their respective costs
- Rationale: custom goods are unsellable to anyone else; the platform shouldn't shift that risk to the buyer

## Open implementation questions (for Phase 3)

- Exact triggering of the research-fee credit-back: at order placement, or at order completion?
- Whether the 30-day window starts at request creation or request qualification
- How the daily/weekly quote is generated: agent picks based on scope, or system suggests a default ladder (½ day · 1 day · 2 days · 1 week · 2 weeks)?
- Minimum billable unit — half day? Full day?
- How disputes flow through `EscrowTransaction.status` — already drafted in spec §6.3 but the 20% split needs to be wired
- Whether the 3% is shown to buyers as a separate line on the quote, or baked into the displayed unit price (spec §1.1 "Règle de gold" said invisible; at 3% transparent is defensible)

## Why this model, not the spec's SaaS-tier model

- **Sourcing is episodic.** A buyer who runs one campaign per quarter resents a monthly fee that runs whether they use the platform or not. Subscription would create churn that pure commission doesn't.
- **Research fee filters speculative requests AND covers agent time.** Charged per day or week of agent work (quoted upfront per request based on scope). SourcingPick's sourcing agents are based in China — loaded cost ~€80–€120/day in tier-1 Chinese cities — so €125/day sits slightly above labor cost while remaining well within reach of small buyers. The fee carries its own margin; the order commission is upside on top.
- **Why per-day/per-week instead of a flat token fee:** a flat fee disconnects revenue from actual scope. Per-day lets the agent quote in proportion to the work involved — a half-day catalogue scan and a two-week multi-region factory hunt are paid differently. With the credit-back on order placement, serious buyers net to zero on the research fee; speculative buyers self-select on whether the proposed scope is worth their order value.

## Why 3% buyer / 6% supplier (decided 2026-06-08)

Partner moved the platform take from {buyer 6% / supplier 3%} to {buyer 3% / supplier 6%}. Total platform GMV cut unchanged at 9%; the redistribution shifts most of the take to the supplier side.

- **Buyer-visible surcharge is now smaller at checkout.** Cutting the buyer line in half is a defensive move on conversion — fewer buyers stall at the line-item breakdown when the platform's add is 3% instead of 6%.
- **Factories absorb the larger share.** Suppliers gain qualified demand and a credible dispute / escrow guarantee — 6% is closer to the marketplace-fee norm for that bundle. The buyer side pays for orchestration; the supplier side pays for access to the order pipeline.
- **Same gross take, no unit-economics change.** The marketplace listed-price divisor is still 1 − 3% − 6% = 0.91. Agent labour P&L is unaffected; the order commission is still upside on the research-fee revenue line.
- **Reversible.** Rates live in `src/lib/orders/pricing.ts` (`BUYER_MARKUP_BPS` / `SUPPLIER_FEE_BPS`) and the dictionary `pricing.flows.*.{buyer,supplier}.rate` copy. No schema migration; only the marketplace re-pricing migration if the marketplace catalogue needs to be re-derived from factory-net targets.

### Prior buyer-rate change — 12% → 6% on 2026-05-26

The original v2 set the buyer side at 12%. Partner reviewed the rate against the actual offering and pulled it to 6% before the 2026-06-08 re-balance:

- 12% was uncompetitive once caps were removed; a 12% flat on a €200k order is €24k of platform take, where buyers start sourcing directly.
- Supplier stayed at 3% at that point; that's the cut that just moved to 6% (with the buyer side dropping to 3% to keep the total flat).

## Why no caps (decided 2026-05-26)

The original v2 capped the buyer side at €15,000 (binding at €125k GMV) and the supplier side at €5,000 (binding at €166k GMV). Both caps are removed.

- **The 15% flat rate is already competitive on large orders.** Alibaba Trade Assurance lands around 5–8% effective on big deals, but bundles a thinner version of escrow + tracking + insurance and no agent labour. SourcingPick's 15% buys a dedicated agent, full escrow with dispute mediation, and category-specific insurance. The premium is the product, not the cap.
- **Caps add complexity for no benefit at our current order distribution.** The bulk of v1 orders sit in the €5k–€80k range, well below the cap thresholds. The cap math (when does it bind, how is it surfaced on the quote, how does it interact with disputes) was Phase-3 work we'd rather skip.
- **Simpler pricing is easier to defend.** "3% buyer, 6% supplier, on every order" is one sentence. "12%/3% capped at €15k/€5k, binding above €125k/€166k GMV" is a paragraph that invites haggling.
- **If the very-large-order objection comes back,** we re-introduce a cap as a per-customer negotiation, not a global rule. Big-deal supplier defection risk is real, but it's a sales conversation, not a pricing-page promise.

## Memory cross-references

- `feedback_spec_adherence.md` — the rule that forced us to surface this deviation explicitly
- `project_sourcingpick.md` — points to this doc for pricing
