-- Extend the lead-time unit pattern to Quote (#3a extension). Same shape
-- as MarketplaceProduct.leadTimeUnit: column stays canonical days, this
-- enum drives display + form pre-fill.

ALTER TABLE "Quote"
  ADD COLUMN "leadTimeUnit" "LeadTimeUnit" NOT NULL DEFAULT 'DAY';
