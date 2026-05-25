-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "allowedSourcingRegions" "SourcingRegion"[] DEFAULT ARRAY[]::"SourcingRegion"[],
    "allowedSourcingCountries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton with the launch defaults: Asia + Middle East regions,
-- and China / Vietnam / UAE on the country side.
INSERT INTO "PlatformSettings" ("id", "allowedSourcingRegions", "allowedSourcingCountries", "updatedAt")
VALUES (
    'default',
    ARRAY['ASIA', 'MIDDLE_EAST']::"SourcingRegion"[],
    ARRAY['CN', 'VN', 'AE']::TEXT[],
    NOW()
);
