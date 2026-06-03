-- Auction settlement plumbing:
--   - AUCTION origin so the synthetic SourcingRequest materialised from a
--     winning bid is distinguishable from real sourcing flow rows.
--   - materializedOrderId on Auction for idempotency — the settler refuses
--     to materialise an order twice for the same auction.

ALTER TYPE "SourcingRequestOrigin" ADD VALUE 'AUCTION';

ALTER TABLE "Auction"
  ADD COLUMN "materializedOrderId" TEXT;

CREATE UNIQUE INDEX "Auction_materializedOrderId_key"
  ON "Auction" ("materializedOrderId");
