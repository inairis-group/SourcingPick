-- Multi-provider payouts. Factories + agents pick one provider during
-- KYC; the choice is locked once the provider returns ACTIVE so we don't
-- break audit references on already-paid orders.
--
-- The existing `stripeConnectAccountId` column stays for backwards
-- compatibility with the v1 Stripe-only flow — new code should read
-- `payoutAccountId` instead, with `payoutProvider` driving which
-- adapter (lib/payouts/<provider>.ts) interprets it.

CREATE TYPE "PayoutProvider" AS ENUM (
  'STRIPE_CONNECT',
  'LIANLIAN',
  'ALIPAY'
);

CREATE TYPE "PayoutAccountStatus" AS ENUM (
  'NONE',
  'PENDING',
  'ACTIVE',
  'RESTRICTED',
  'REJECTED'
);

ALTER TABLE "Organization"
  ADD COLUMN "payoutProvider"    "PayoutProvider",
  ADD COLUMN "payoutAccountId"   TEXT,
  ADD COLUMN "payoutStatus"      "PayoutAccountStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "payoutOnboardedAt" TIMESTAMP(3);

-- Backfill existing Stripe Connect onboardings into the new columns so
-- the dispatcher reads from one place. Factory orgs that completed Stripe
-- Connect get marked ACTIVE; the rest stay NONE.
UPDATE "Organization"
SET "payoutProvider"    = 'STRIPE_CONNECT',
    "payoutAccountId"   = "stripeConnectAccountId",
    "payoutStatus"      = 'ACTIVE',
    "payoutOnboardedAt" = COALESCE("updatedAt", NOW())
WHERE "stripeConnectAccountId" IS NOT NULL
  AND "deletedAt" IS NULL;
