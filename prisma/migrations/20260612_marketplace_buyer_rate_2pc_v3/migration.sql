-- Pricing v3: marketplace buyer-side commission cut from 3% to 2% (and
-- supplier-side moved from 6% to 1%, but the supplier fee is applied at
-- payout time so existing rows don't need re-derivation).
--
-- Existing MarketplaceProduct rows still carry priceCentsClient values
-- derived from the v2.1 1.03× markup. Recompute them from
-- priceCentsFactory (the source of truth — the factory net target hasn't
-- changed) using the new 1.02× rate so buyers see the lowered sticker
-- price.
--
-- Idempotent on a fresh DB: if no listings exist, this is a no-op.
-- ARCHIVED rows are excluded — they're retired and won't be served.
--
-- Quotes are intentionally NOT touched: they're short-lived (≤14d
-- validity), already-shown numbers shouldn't shift under the buyer's
-- feet mid-decision, and new quotes pick up the new rate from
-- src/lib/orders/pricing.ts.
--
-- `compareAtCents` (flash-sale "was" price) is left as-is. It's a
-- marketing label and the rate-change drift (≈1%) is invisible.
UPDATE "MarketplaceProduct"
SET "priceCentsClient" = ROUND("priceCentsFactory" * 1.02)::INT
WHERE "status" <> 'ARCHIVED';
