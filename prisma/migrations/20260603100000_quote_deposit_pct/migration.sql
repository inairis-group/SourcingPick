-- Partial deposit on custom / sourcing orders (partner feedback #7b).
-- The factory now sets the deposit percentage in their quote (30–50%);
-- on acceptance the order's depositCents is computed from this rather
-- than a hardcoded 30%. Default 3000 keeps existing flows + marketplace
-- direct-buy at 30%.

ALTER TABLE "Quote"
  ADD COLUMN "depositPercentageBps" INTEGER NOT NULL DEFAULT 3000;
