-- Add a unit (DAY | MONTH) so factories can enter production lead times in
-- months for longer-running runs, not just days. Existing rows keep their
-- semantics: the `leadTimeDays` column was previously days, default stays DAY.

CREATE TYPE "LeadTimeUnit" AS ENUM ('DAY', 'MONTH');

ALTER TABLE "MarketplaceProduct"
  ADD COLUMN "leadTimeUnit" "LeadTimeUnit" NOT NULL DEFAULT 'DAY';
