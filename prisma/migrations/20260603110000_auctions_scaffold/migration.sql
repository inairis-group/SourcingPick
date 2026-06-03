-- Auction product type scaffold (partner feedback #1 + #2). Tables ready
-- so future builds can land without schema friction. No UI yet — see
-- docs/auctions.md (TBD) for the rollout plan + commission curve.

CREATE TYPE "AuctionStatus" AS ENUM (
  'DRAFT',
  'PENDING_REVIEW',
  'ACTIVE',
  'ENDED',
  'SOLD',
  'CANCELLED'
);

CREATE TYPE "BidStatus" AS ENUM (
  'ACTIVE',
  'OUTBID',
  'WINNING',
  'REJECTED'
);

CREATE TABLE "Auction" (
  "id"                TEXT NOT NULL,
  "reference"         TEXT NOT NULL,
  "factoryOrgId"      TEXT NOT NULL,
  "title"             TEXT NOT NULL,
  "description"       TEXT NOT NULL,
  "category"          "Category" NOT NULL,
  "images"            TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "startingBidCents"  INTEGER NOT NULL,
  "reserveCents"      INTEGER,
  "buyNowCents"       INTEGER,
  "quantity"          INTEGER NOT NULL,
  "moq"               INTEGER NOT NULL DEFAULT 1,
  "leadTimeDays"      INTEGER NOT NULL,
  "leadTimeUnit"      "LeadTimeUnit" NOT NULL DEFAULT 'DAY',
  "incoterm"          "Incoterm" NOT NULL,
  "startsAt"          TIMESTAMP(3) NOT NULL,
  "endsAt"            TIMESTAMP(3) NOT NULL,
  "status"            "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
  "winnerBidId"       TEXT,
  "publishedAt"       TIMESTAMP(3),
  "rejectionReason"   TEXT,
  "rejectedAt"        TIMESTAMP(3),
  "deletedAt"         TIMESTAMP(3),
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Auction_reference_key" ON "Auction" ("reference");
CREATE UNIQUE INDEX "Auction_winnerBidId_key" ON "Auction" ("winnerBidId");
CREATE INDEX "Auction_status_endsAt_idx" ON "Auction" ("status", "endsAt");
CREATE INDEX "Auction_factoryOrgId_status_idx"
  ON "Auction" ("factoryOrgId", "status");

CREATE TABLE "Bid" (
  "id"            TEXT NOT NULL,
  "auctionId"     TEXT NOT NULL,
  "bidderOrgId"   TEXT NOT NULL,
  "bidderUserId"  TEXT NOT NULL,
  "amountCents"   INTEGER NOT NULL,
  "status"        "BidStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Bid_auctionId_amountCents_idx"
  ON "Bid" ("auctionId", "amountCents");
CREATE INDEX "Bid_bidderOrgId_createdAt_idx"
  ON "Bid" ("bidderOrgId", "createdAt");

ALTER TABLE "Auction"
  ADD CONSTRAINT "Auction_factoryOrgId_fkey"
  FOREIGN KEY ("factoryOrgId") REFERENCES "Organization" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Auction"
  ADD CONSTRAINT "Auction_winnerBidId_fkey"
  FOREIGN KEY ("winnerBidId") REFERENCES "Bid" ("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Bid"
  ADD CONSTRAINT "Bid_auctionId_fkey"
  FOREIGN KEY ("auctionId") REFERENCES "Auction" ("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Bid"
  ADD CONSTRAINT "Bid_bidderOrgId_fkey"
  FOREIGN KEY ("bidderOrgId") REFERENCES "Organization" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Bid"
  ADD CONSTRAINT "Bid_bidderUserId_fkey"
  FOREIGN KEY ("bidderUserId") REFERENCES "User" ("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
