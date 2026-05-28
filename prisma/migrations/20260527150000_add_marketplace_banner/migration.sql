-- Admin-managed marketplace campaign banners (editorial promo surface).
-- Text + CTA + tone only — no image storage in v1.

CREATE TYPE "BannerTone" AS ENUM ('BRAND', 'DARK', 'SALE');

CREATE TABLE "MarketplaceBanner" (
  "id"              TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "subtitle"        TEXT,
  "ctaLabel"        TEXT,
  "ctaHref"         TEXT,
  "tone"            "BannerTone" NOT NULL DEFAULT 'BRAND',
  "active"          BOOLEAN NOT NULL DEFAULT true,
  "sortOrder"       INTEGER NOT NULL DEFAULT 0,
  "startsAt"        TIMESTAMP(3),
  "endsAt"          TIMESTAMP(3),
  "createdByUserId" TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceBanner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MarketplaceBanner_active_sortOrder_idx"
  ON "MarketplaceBanner" ("active", "sortOrder");
