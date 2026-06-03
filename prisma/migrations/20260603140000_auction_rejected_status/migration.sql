-- Admin moderation needs a REJECTED state for auctions a factory has
-- submitted but didn't meet the bar. The factory can edit + resubmit, at
-- which point status flips back to DRAFT. Forgotten in the initial
-- auctions migration.

ALTER TYPE "AuctionStatus" ADD VALUE 'REJECTED';
