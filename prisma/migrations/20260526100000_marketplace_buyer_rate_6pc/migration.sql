-- Buyer-side commission lowered from 12% to 6% (partner decision, 2026-05-26).
-- Existing MarketplaceProduct rows still carry priceCentsClient values derived
-- from the old 1.12× markup. Recompute them from priceCentsFactory (the source
-- of truth — the factory net target hasn't changed) using the new 1.06× rate
-- so buyers see the lowered sticker price.
--
-- Idempotent on a fresh DB: if no listings exist, this is a no-op.
-- Quotes are intentionally NOT touched — they're short-lived (≤14d validity),
-- already-shown numbers shouldn't shift under the buyer's feet, and new quotes
-- will use the new rate from src/lib/orders/pricing.ts.
UPDATE "MarketplaceProduct"
SET "priceCentsClient" = ROUND("priceCentsFactory" * 1.06)::INT
WHERE "deletedAt" IS NULL;
