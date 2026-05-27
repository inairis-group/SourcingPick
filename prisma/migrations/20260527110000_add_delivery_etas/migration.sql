-- Per-continent estimated delivery windows on PlatformSettings. Stored as
-- free text so admins can express ranges, qualifiers, or hold off on a
-- continent entirely (null) without us baking units into the schema.

ALTER TABLE "PlatformSettings"
  ADD COLUMN "deliveryEtaAfrica"   TEXT,
  ADD COLUMN "deliveryEtaEurope"   TEXT,
  ADD COLUMN "deliveryEtaAmericas" TEXT,
  ADD COLUMN "deliveryEtaAsia"     TEXT;
