-- CTO audit follow-up — drop the deprecated enum values that were
-- left in place by 20260605000000_audit_corrections (PostgreSQL doesn't
-- support ALTER TYPE ... DROP VALUE; the workaround is to create a new
-- enum, swap dependent columns onto it, drop the old, and rename).
--
-- F6 — SourcingStatus.PAYMENT_PENDING was never written; the cast is
-- a guaranteed identity transform.
--
-- F8 — PayoutProvider.{STRIPE_CONNECT, LIANLIAN, ALIPAY} were retired
-- by the Wise migration. Any Organization rows still pointing at the
-- legacy rails are back-migrated to NULL — those factories need to
-- onboard Wise before payouts resume. PayoutMethod retains every value
-- so historical Payout audit rows keep their semantics.

-- =============================================================
-- SourcingStatus — drop PAYMENT_PENDING
-- =============================================================

CREATE TYPE "SourcingStatus_new" AS ENUM (
  'DRAFT',
  'REQUEST_RECEIVED',
  'ASSIGNED',
  'QUOTE_SENT',
  'QUOTE_ACCEPTED',
  'QUOTE_REJECTED',
  'PREPARATION',
  'SHIPPED',
  'IN_TRANSIT',
  'COMPLETED',
  'CANCELLED'
);

-- Defensive fence: should be a no-op (the value was never written) but
-- a stray seed could have landed one. Coerce to REQUEST_RECEIVED so the
-- type cast below can't trip on an unknown value.
UPDATE "SourcingRequest"
   SET "status" = 'REQUEST_RECEIVED'
 WHERE "status" = 'PAYMENT_PENDING';

ALTER TABLE "SourcingRequest"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "SourcingStatus_new"
    USING ("status"::text::"SourcingStatus_new"),
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

DROP TYPE "SourcingStatus";
ALTER TYPE "SourcingStatus_new" RENAME TO "SourcingStatus";

-- =============================================================
-- PayoutProvider — drop STRIPE_CONNECT / LIANLIAN / ALIPAY
-- =============================================================

-- Back-migrate any factory rows still holding a legacy rail. They need
-- to onboard Wise before payouts can resume, so we also nuke the
-- provider-account id and reset the onboarding status.
UPDATE "Organization"
   SET "payoutProvider"    = NULL,
       "payoutAccountId"   = NULL,
       "payoutStatus"      = 'NONE',
       "payoutOnboardedAt" = NULL
 WHERE "payoutProvider" IN ('STRIPE_CONNECT', 'LIANLIAN', 'ALIPAY');

CREATE TYPE "PayoutProvider_new" AS ENUM ('WISE');

ALTER TABLE "Organization"
  ALTER COLUMN "payoutProvider" TYPE "PayoutProvider_new"
    USING ("payoutProvider"::text::"PayoutProvider_new");

DROP TYPE "PayoutProvider";
ALTER TYPE "PayoutProvider_new" RENAME TO "PayoutProvider";
