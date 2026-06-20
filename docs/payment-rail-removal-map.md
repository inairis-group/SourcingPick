# Payment rail removal — blast-radius map

**Status:** planning only. No code removed yet. Decision (2026-06-19): move
away from **both Stripe and Wise**; a new rail will be provided later. Goal of
this map: remove Stripe + Wise cleanly while **preserving** the provider-
agnostic seam so the new rail drops in.

**Two things to preserve at all costs:**

1. The `PayoutAdapter` interface (`src/lib/payouts/types.ts`) — the new rail
   implements `isConfigured / requiredEnvVars / healthCheck / startOnboarding /
   fetchAccountStatus / dispatch`.
2. The escrow/invoice state machine in `finalizeBuyerOrderPayment()`
   (`src/lib/stripe/finalize.ts`) — this is provider-agnostic and must survive.

---

## 1. Delete outright

- `src/lib/stripe/` — `client.ts`, `connect.ts`, `connect-actions.ts`,
  `checkout-actions.ts`, `customer.ts`. (`finalize.ts` is the exception — see §6.)
- `src/lib/wise/` — `client.ts`, `platform-account.ts`, `recipient-actions.ts`,
  `recipients.ts`, `webhook-signature.ts`, `reconcile.ts`.
- `src/lib/payouts/wise.ts` (and any `stripe.ts` / `alipay.ts` / `lianlian.ts`).
- `src/app/api/stripe/webhook/route.ts`, `src/app/api/wise/webhook/route.ts`.
- Factory bank-detail UI: `factory/payouts/_components/wise-recipient-card.tsx`,
  `wise-recipient-form.tsx`.

## 2. Edit (keep — strip rail references)

- `src/lib/payouts/dispatch.ts` — trim `ADAPTERS` map + `ALL_PROVIDERS` +
  `adapterFor()` to the new rail; keep the dispatch loop.
- `src/lib/payouts/types.ts` — keep `PayoutAdapter` / `PayoutInput` /
  `PayoutDispatchResult`; comments only.
- `src/lib/payouts/actions.ts` — `startPayoutOnboardingAction()` loses the
  provider picker; keep audit + org lookup.
- `src/lib/orders/actions.ts` — dynamic `import("@/lib/stripe/finalize")` path.
- `src/lib/admin/webhook-actions.ts` — `replayWebhookEventAction()` is hardwired
  to `WebhookSource.WISE`; repoint to the new rail.
- `src/lib/orders/dispute-actions.ts` — refund path (currently manual for Wise).
- Buyer payment UI: `client/orders/[id]/_components/wise-wire-panel.tsx`,
  `order-actions.tsx`, `client/orders/[id]/page.tsx` (imports
  `platformWireAccount`), `client/requests/[id]/_components/research-fee-panel.tsx`.
- Factory: `factory/payouts/page.tsx` (`fetchConnectStatus` + `wiseIsConfigured`),
  `factory/payouts/_components/onboarding-button.tsx`, `factory/dashboard/page.tsx`
  (status chips).
- Admin: `admin/settings/payments/page.tsx` (provider labels),
  `admin/webhooks/page.tsx` (source filters/labels).

## 3. Schema (one migration, mostly additive/keep-for-audit)

- `PayoutProvider` enum — currently effectively `WISE`; add the new rail value.
- `PayoutMethod` enum — keep `SEPA`/`SWIFT`/`WISE` + legacy values on existing
  rows (audit trail); drop `@deprecated` comments.
- `WebhookSource` enum — add new rail value; drop `STRIPE`/`WISE` once no live
  webhooks reference them.
- `Organization` — `stripeCustomerId`, `stripeConnectAccountId`, `wiseRecipientId`
  become dead → backfill `payoutProvider`/`payoutAccountId`, then drop in a
  follow-up migration.
- Keep all `Payout` / `EscrowTransaction` / `Invoice` rows + their provider
  string columns forever (immutable financial audit records).

## 4. Env vars that go dead

`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
`WISE_ENV`, `WISE_API_TOKEN`, `WISE_PROFILE_ID`, `WISE_WEBHOOK_PUBLIC_KEY`,
`WISE_PLATFORM_IBAN`, `WISE_PLATFORM_BIC`, `WISE_PLATFORM_HOLDER_NAME`
(plus the already-commented `LIANLIAN_*` / `ALIPAY_*`).

## 5. Tests

- `tests/wise-memo.test.ts` references Wise memo normalisation → delete/move.

## 6. Escrow coupling — the critical seam

`finalizeBuyerOrderPayment()` (`src/lib/stripe/finalize.ts`) is the provider-
agnostic core: creates the `Invoice` (PAID), records the `EscrowTransaction`
(HELD) keyed on `providerRef` for **idempotent** reconciliation, advances the
`Order` state machine, emits notifications, and (on balance-paid + delivery-
confirmed) calls `releaseFactoryPayout()`.

**Keep** all of that. **Remove** only the Stripe-specific entry points
(`finalizeStripePayment`, `getStripe` import, `PROVIDER_TO_METHOD`).

The new rail's webhook handler MUST call `finalizeBuyerOrderPayment()` with the
same shape: `{ orderId, type, amountCents, provider, providerRef }`, where
`providerRef` is a unique transaction id (the idempotency key). Everything else
is the new rail's implementation detail.

> Suggested: move `finalizeBuyerOrderPayment()` + the escrow core out of
> `src/lib/stripe/finalize.ts` into a rail-neutral home (e.g.
> `src/lib/payments/finalize.ts`) as part of the removal, so the surviving
> escrow logic no longer lives under a `stripe/` path.

## Suggested removal order

1. Stand up the new rail behind the `PayoutAdapter` + a new webhook route that
   calls `finalizeBuyerOrderPayment()`; wire onboarding + UI labels.
2. Delete Stripe (lib + api + UI), updating `finalize.ts` to drop Stripe entry
   points.
3. Delete Wise (lib + api + UI), repoint webhook replay.
4. Schema cleanup migration (backfill → drop dead columns, prune enums).
5. Validation: webhook → escrow HELD → payout dispatch; grep for residual
   `stripe`/`wise` imports.
