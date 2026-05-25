# Pricing model v2 — overrides spec §1.1

**Status:** locked 2026-05-24 (Caystone + partner alignment).
**Supersedes:** spec §1.1 ("Modèle de revenus"). The spec's SaaS subscription tiers (Starter / Growth / Pro) and per-plan commission rates (8% / 6% / 4%) are **dropped**.

This doc is the source of truth for pricing in the v1 build. When the schema enforces commission calculation (Phase 3, payments), the values here are what get seeded into the `PricingRule` table.

## Model

**No subscription.** SourcingPick is paid 100% on successful transactions plus a per-request research fee for sourcing.

### Sourcing flow (agent-orchestrated, custom build)

| Side | Rate | Cap | Trigger | Notes |
|------|------|-----|---------|-------|
| **Buyer** (client) | **12%** of order value | **€15,000** (binds at €125k GMV) | Order completion (escrow released) | Built into the quote shown to the buyer |
| **Buyer** (client) | Research fee at **€125/day or €500/week** | quoted per request | Per qualified sourcing request, before agent work starts | **Credited back** as platform credit if the buyer places an order within 30 days. Applies to every request — including small orders below €1,000. |
| **Supplier** (factory) | **3%** of order value | **€5,000** (binds at €166k GMV) | Order completion (escrow released) | Deducted from the payout to the factory |

Total platform take on a typical sourcing transaction: **15% of GMV** below caps, decreasing as a percentage above caps. With agents based in China (loaded cost ~€80–€120/day), even orders down to €5k GMV are profitable per-request once you add the research fee.

### Marketplace flow (pre-negotiated catalogue, one-click buy)

| Side | Rate | Cap | Trigger | Notes |
|------|------|-----|---------|-------|
| **Buyer** | **12%** of listed price | **€15,000** (binds at €125k GMV) | Order completion | Baked into the listed price — buyer pays sticker price, no add-on at checkout |
| **Buyer** | no research fee | — | — | One-click purchase, no agent labor to pay for |
| **Supplier** (factory listing) | **3%** of listed price | **€5,000** (binds at €166k GMV) | Order completion | Deducted from the payout to the factory |

Marketplace listed price = factory net target ÷ (1 − 12% − 3%) = factory net ÷ 0.85. The 12% is invisible to the buyer (they see only the all-in price); the 3% is invisible to the buyer for the same reason.

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
- Whether the 12% is shown to buyers as a separate line on the quote, or baked into the displayed unit price (spec §1.1 "Règle de gold" said invisible; with the new model and lower commission, transparent may be defensible)

## Why this model, not the spec's SaaS-tier model

- **Sourcing is episodic.** A buyer who runs one campaign per quarter resents a monthly fee that runs whether they use the platform or not. Subscription would create churn that pure commission doesn't.
- **Caps prevent supplier defection.** A €60k commission on a €500k order (uncapped 12%) would push the supplier to route around the platform on big deals. The €15k cap puts SourcingPick in the same price range as Alibaba Trade Assurance (~5-8% effective) and direct sourcing brokers (~5%) on large orders, while still capturing strong margin on the typical €10–125k order.
- **Research fee filters speculative requests AND covers agent time.** Charged per day or week of agent work (quoted upfront per request based on scope). SourcingPick's sourcing agents are based in China — loaded cost ~€80–€120/day in tier-1 Chinese cities — so €125/day sits slightly above labor cost while remaining well within reach of small buyers. The fee carries its own margin; the order commission is upside on top.
- **Why per-day/per-week instead of a flat token fee:** a flat fee disconnects revenue from actual scope. Per-day lets the agent quote in proportion to the work involved — a half-day catalogue scan and a two-week multi-region factory hunt are paid differently. With the credit-back on order placement, serious buyers net to zero on the research fee; speculative buyers self-select on whether the proposed scope is worth their order value.

## Memory cross-references

- `feedback_spec_adherence.md` — the rule that forced us to surface this deviation explicitly
- `project_sourcingpick.md` — points to this doc for pricing
