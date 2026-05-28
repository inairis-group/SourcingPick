-- Rich banner backgrounds: custom linear gradient / image / video, with a
-- dark overlay for legibility. Media is stored as a MARKETPLACE_BANNER
-- attachment and served via /api/attachments/<id>.

ALTER TYPE "AttachmentContext" ADD VALUE 'MARKETPLACE_BANNER';

CREATE TYPE "BannerBackground" AS ENUM ('PRESET', 'GRADIENT', 'IMAGE', 'VIDEO');

ALTER TABLE "MarketplaceBanner"
  ADD COLUMN "background"     "BannerBackground" NOT NULL DEFAULT 'PRESET',
  ADD COLUMN "gradientFrom"   TEXT,
  ADD COLUMN "gradientVia"    TEXT,
  ADD COLUMN "gradientTo"     TEXT,
  ADD COLUMN "gradientAngle"  INTEGER,
  ADD COLUMN "mediaUrl"       TEXT,
  ADD COLUMN "overlayOpacity" INTEGER NOT NULL DEFAULT 40;
