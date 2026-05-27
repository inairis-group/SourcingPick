-- Marketplace expansion: condition + permanent discount + flash-sale window.
-- All three are listing-level promo metadata; nothing in payment or escrow
-- changes — the buyer still pays priceCentsClient at checkout.

-- Condition enum: NEW (default — current behaviour) / USED / REFURBISHED.
CREATE TYPE "MarketplaceCondition" AS ENUM ('NEW', 'USED', 'REFURBISHED');

-- New columns on MarketplaceProduct.
--   compareAtCents  — optional "was" price for strikethrough display
--   flashSaleEndsAt — optional flash-sale expiry, renders countdown badge
--   condition       — defaults to NEW so existing listings keep working
ALTER TABLE "MarketplaceProduct"
  ADD COLUMN "compareAtCents"  INTEGER,
  ADD COLUMN "flashSaleEndsAt" TIMESTAMP(3),
  ADD COLUMN "condition" "MarketplaceCondition" NOT NULL DEFAULT 'NEW';

-- Helps the storefront's "ending soon" rail and any future flash-sale
-- sweep job cheaply find listings whose window is about to close.
CREATE INDEX "MarketplaceProduct_flashSaleEndsAt_idx"
  ON "MarketplaceProduct" ("flashSaleEndsAt");
