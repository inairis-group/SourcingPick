-- Research fee: agent quotes a per-day/week fee on a qualified sourcing
-- request; the buyer pays it before agent work begins. Credit-back (return
-- as platform credit on order within 30 days) is a later phase.

CREATE TYPE "ResearchFeeUnit" AS ENUM ('DAY', 'WEEK');
CREATE TYPE "ResearchFeeStatus" AS ENUM ('NONE', 'QUOTED', 'PAID', 'CREDITED', 'WAIVED');

ALTER TABLE "SourcingRequest"
  ADD COLUMN "researchFeeUnit"      "ResearchFeeUnit",
  ADD COLUMN "researchFeeQuantity"  INTEGER,
  ADD COLUMN "researchFeeCents"     INTEGER,
  ADD COLUMN "researchFeeStatus"    "ResearchFeeStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "researchFeeInvoiceId" TEXT;
