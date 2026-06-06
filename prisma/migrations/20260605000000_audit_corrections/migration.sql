-- CTO audit corrections — F1b, F3, F4, F7.
-- F1a/c/2 + F5/F6/F8 are code-only (no DB shape changes); F6/F8 enum drops
-- are deferred until we coordinate the enum-recreate dance.

-- F1b: separate "balance settled" from "delivery confirmed". COMPLETED
-- now requires both; the buyer-initiated path can no longer close the
-- order without the balance landing first.
ALTER TABLE "Order"
  ADD COLUMN "balancePaidAt" TIMESTAMP(3);

-- F3: rename Payout.commissionCents → Payout.supplierFeeCents so the
-- column name reflects the supplier-side 3 % fee and stops colliding
-- semantically with Order.commissionCents (which is the full buyer-side
-- platform margin). Pure rename, data preserved.
ALTER TABLE "Payout"
  RENAME COLUMN "commissionCents" TO "supplierFeeCents";

-- F4: unify acompte policy across channels. Marketplace previously
-- hardcoded 30 %; now every listing carries its own bps so the factory
-- can pick 30–50 % like the sourcing flow does.
ALTER TABLE "MarketplaceProduct"
  ADD COLUMN "depositPercentageBps" INTEGER NOT NULL DEFAULT 3000;

-- F7: drop the dead `deletedAt` column. Marketplace soft-delete has
-- always been driven by the ARCHIVED status; the column was never
-- written. Removing it avoids the ambiguity between two soft-delete
-- mechanisms.
ALTER TABLE "MarketplaceProduct"
  DROP COLUMN "deletedAt";
