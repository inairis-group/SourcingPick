# Payment provider comparison — SourcingPick v1

Comparison of marketplace-payment providers for SourcingPick's escrow + payout model. Drafted as talking points for the team before locking a provider for Phase 3 of the build.

## Context & requirements

What we actually need the provider to do:

1. **Hold client funds in escrow** — collected at quote acceptance (30% deposit + 70% balance), held by the provider on SourcingPick's behalf, released to the factory only on delivery confirmation (or admin override, or 14-day auto-timeout). **SourcingPick never holds the funds itself** — this keeps us out of DSP2 payment-institution licensing.
2. **Onboard factories as connected accounts / sub-wallets**, including KYB. Factories sit in Europe, Maghreb, and Asia.
3. **Split / route funds at payout** — factory receives `order_total − SourcingPick commission`, commission lands in our operating account.
4. **Multi-currency collection acceptable**, but v1 settles in **EUR only** (no FX management on our side).
5. **Bank-grade reliability + auditable webhooks** — every state change must be reflected in our `EscrowTransaction` and `AuditLog`.
6. **Decent DX** — REST/SDK, sandbox, idempotency keys, clear webhook contracts.
7. **Programmatic payouts** — admin must be able to trigger / hold / release individual payouts from our UI, not the provider's dashboard.

## Shortlist

Four providers worth a real look. Skipping Mollie Connect (escrow story too thin), PayPal (B2B UX poor, fees), and BaaS-style players like Treezor / Swan (powerful but too heavy a build for v1).

| Criterion | Stripe Connect Custom | Mangopay | Lemonway | Adyen for Platforms |
|---|---|---|---|---|
| Regulatory model | Stripe Payments Europe Ltd (Irish e-money inst., passported into FR) | French payment institution (ACPR) | French payment institution (ACPR) | Dutch bank licence + EU passport |
| Marketplace track record | Massive global (Shopify, Substack, Lyft) | Strong in EU marketplaces (Vinted, La Ruche, ManoMano) | French marketplace specialist (Carrefour, Cdiscount tier) | Enterprise (eBay, Etsy) |
| Escrow / hold model | "Separate Charges & Transfers" — charge to platform balance, transfer on release | Per-user e-wallets, transfer between wallets on release | Per-user e-wallets, escrow account, transfer on release | Hold funds in a balance account, payout on instruction |
| KYB for factories | Full Custom flow, branded; supports most countries | Built-in marketplace KYC tooling, tuned for EU | Strong KYC toolkit, EU-tuned | Enterprise KYC, requires more integration work |
| EU payouts | ✅ All EEA via SEPA | ✅ Native SEPA | ✅ Native SEPA | ✅ Native SEPA |
| Maghreb payouts | ⚠️ Morocco supported; Tunisia / Algeria not natively — needs SWIFT fallback | ❌ Limited; SWIFT only | ❌ Limited | ⚠️ Better coverage but expensive |
| Asia payouts | ✅ Most major countries (CN, IN, JP, KR, SG, etc.) | ❌ Very limited outside EU | ❌ Very limited outside EU | ✅ Broad coverage |
| Card acceptance | Best-in-class (Apple/Google Pay, Klarna, SEPA DD, all schemes) | Good (cards + SEPA DD, Apple Pay since 2022) | Cards + SEPA, fewer alt methods | Best-in-class |
| Pricing (EU cards) | ~1.5% + €0.25 + Connect fees (~0.25%/active acct or ~2% volume) | ~1.8% + €0.18 + €0.18/payout | ~1.8% + €0.18 + monthly platform fee | Interchange++ pricing; only viable at scale |
| Dev experience | Excellent — best SDKs, best docs, biggest community | Good, French-first docs, smaller community | Decent, more enterprise-style integration | Steep learning curve, enterprise sales required |
| Time to first payout | Days (self-serve) | Weeks (sales conversation, contract) | Weeks (sales conversation, contract) | Months (enterprise sales) |
| Hidden complexity | Manual SWIFT fallback to build for non-Stripe countries | Restricted geographic payout reach | Restricted geographic payout reach | Heavy integration cost |

## Deep dives

### Stripe Connect Custom

**Model.** SourcingPick is the platform. Each factory is a "Custom" connected account, fully white-labelled — the factory never sees Stripe branding. Client pays SourcingPick; funds land in our platform balance; we trigger a transfer to the factory's connected account on delivery confirmation; Stripe then payouts the connected account to the factory's bank.

**Escrow fit.** "Separate charges and transfers" is the Stripe-idiomatic way to do escrow: charge held in platform balance, no `transfer_data` on the charge, then we call `transfers.create` with `source_transaction` when ready. The 70%/30% split is handled by calling the same flow twice on the same order.

**Pros.**
- Best DX bar none. We get going in days, not weeks.
- Webhook contracts are stable and well-documented — fits our `AuditLog` model cleanly.
- Single provider for cards, SEPA, Apple/Google Pay, payouts, and merchant onboarding.
- Geographic reach is the broadest of the four — covers most factory countries we'll see.
- Test mode is excellent.

**Cons.**
- Stripe is *technically* an Irish e-money institution, not a French PI. Some clients (large French ETIs) may prefer a French-licensed provider. Talking point for the team.
- Maghreb coverage incomplete — Tunisia and Algeria need a SWIFT fallback (spec §6.4 already anticipates this).
- Connect Custom requires platform-level approval from Stripe (KYB on SourcingPick legal entity). Not instant.
- Pricing on volume gets meaningful — at scale, Mangopay or a negotiated Adyen contract would be cheaper.

### Mangopay

**Model.** Wallet-based. Each user (client and factory) has a Mangopay wallet. Client pays via card / SEPA → funds land in their wallet → instant transfer to a "hold" wallet (escrow) → on release, transfer to factory's wallet → factory payout to bank.

**Pros.**
- French ACPR-licensed payment institution — strongest narrative for French-market clients who care about that.
- Marketplace-native from day one — APIs are designed for our exact pattern.
- Strong KYC tooling tuned to EU regulatory expectations.
- Wallet model gives us very clean escrow primitives (we don't have to invent "hold" semantics on top of charges).

**Cons.**
- Geographic payout reach is the weak point. Outside EU, you're paying for international SWIFT, and some factory countries aren't supported at all — we'd still need a SWIFT fallback for many Maghreb/Asia factories.
- DX is good but the docs are smaller and less polished than Stripe's. Community / Stack Overflow surface is thinner.
- Sales-led onboarding — contract, account manager, weeks before we can transact.
- Apple/Google Pay support came late and is less mature than Stripe.

### Lemonway

**Model.** Very similar to Mangopay — French PI, wallet-based marketplace flow, escrow account, KYC tooling.

**Pros.**
- French roots, French support team, French clients trust it.
- Built specifically for marketplaces.
- Good KYC toolkit including doc analysis.

**Cons.**
- Same geographic limitation as Mangopay — weak outside EU.
- Fewer payment methods than Stripe.
- Smaller integrator community than either Stripe or Mangopay.
- Pricing typically includes a fixed monthly platform fee on top of transaction fees — penalises early stages.

### Adyen for Platforms

**Model.** Adyen MarketPay — balance accounts per merchant, platform orchestrates collection and payout.

**Pros.**
- Geographic reach is the broadest of all four (rivals Stripe).
- Dutch bank licence; very strong regulatory standing.
- Best-in-class fraud tooling.
- Pricing at scale (interchange++) is the cheapest of the four.

**Cons.**
- Enterprise-only sales motion. No self-serve. Realistically a 2–3 month conversation before we can integrate.
- Heavy integration — not a v1 stack choice unless we already have someone on the team who's shipped Adyen.
- Minimum volume commitments typical.

## Recommendation

**Primary: Stripe Connect Custom**, with **manual SWIFT payout via the admin UI** as a fallback for factories in countries Stripe doesn't payout to (Tunisia, Algeria, a few Asia/Africa edge cases). This is exactly the pattern the spec already anticipates in §6.4 ("Repli SEPA : virement manuel via interface admin").

**Why Stripe wins for v1:**
1. Time-to-launch — days, not weeks of contract back-and-forth.
2. DX — fastest path to a robust integration with strong webhook hygiene.
3. Geographic coverage — covers the most factory countries natively, minimising our SWIFT-fallback workload.
4. Single provider for cards + SEPA + payouts + KYB — fewer moving parts.

**Where this falls down:** If SourcingPick's commercial team finds that French-market clients require a French-licensed provider as a trust signal, **Mangopay is the right pivot**. The architectural cost is moderate — both providers fit the same `EscrowTransaction` state machine.

**Where Adyen wins:** When SourcingPick is past €5M/yr in GMV. Not before.

## Discussion points for the team

- **Regulatory positioning.** Does our French target market care that Stripe is Irish-passported vs. a French PI? Worth a customer-discovery call before committing.
- **Stripe Connect Custom approval.** Needs KYB on SourcingPick's legal entity. **Start the application early** — even if we end up with Mangopay, the parallel paperwork doesn't hurt.
- **SWIFT fallback ops.** Whoever we pick, we need an admin UI to record manual bank transfers, attach proof, and mark a payout `SENT` outside the provider flow. This is a real piece of build work — not free.
- **Dispute / chargeback handling.** Stripe disputes are well-tooled; Mangopay/Lemonway disputes go through the same flow but with more manual back-office work. Spec §6.3 (litiges) is more aligned with the Stripe flow.
- **PCI scope.** All four providers let us use hosted payment elements (Stripe Elements / Mangopay Hosted, etc.) — we never touch raw card data. Confirm we're using the hosted flow regardless of choice.
- **Factory onboarding UX.** With Stripe Custom we control 100% of the UI; with Mangopay/Lemonway we control most of it but some doc upload flows are hosted by them. Worth a UX comparison before locking.
- **Pricing modelling.** None of the headline rates above include the actual Connect / platform fees. Before locking, get sandbox-tier and target-volume quotes from Stripe and Mangopay in parallel.

## What this does not decide

- Subscription billing (Starter / Growth / Pro). That's a separate concern — Stripe Billing is the obvious pick whether or not we use Stripe for escrow. Mangopay does not do subscriptions.
- Invoicing & accounting export. We generate our own invoice PDFs and export for accounting; the payment provider only handles the money movement.
- Currency conversion. Out of scope for v1 (EUR only).
