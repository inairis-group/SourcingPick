-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VehicleFuel" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'PLUGIN_HYBRID', 'ELECTRIC', 'LPG', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleTransmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "VehicleDrivetrain" AS ENUM ('FWD', 'RWD', 'AWD');

-- AlterTable
ALTER TABLE "MarketplaceProduct" ADD COLUMN     "isUniqueItem" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ratingSum" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MarketplaceVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "label" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "priceCentsClient" INTEGER,
    "priceCentsFactory" INTEGER,
    "stockAvailable" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "authorOrgId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "orderId" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedById" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderationNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleDetail" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "vin" TEXT,
    "makeName" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileageKm" INTEGER,
    "fuel" "VehicleFuel" NOT NULL,
    "transmission" "VehicleTransmission" NOT NULL,
    "drivetrain" "VehicleDrivetrain",
    "colour" TEXT,
    "engineCc" INTEGER,
    "powerKw" INTEGER,
    "hasCoc" BOOLEAN NOT NULL DEFAULT false,
    "cocReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketplaceVariant_productId_position_idx" ON "MarketplaceVariant"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceVariant_productId_sku_key" ON "MarketplaceVariant"("productId", "sku");

-- CreateIndex
CREATE INDEX "MarketplaceReview_productId_status_createdAt_idx" ON "MarketplaceReview"("productId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "MarketplaceReview_status_createdAt_idx" ON "MarketplaceReview"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceReview_productId_authorOrgId_key" ON "MarketplaceReview"("productId", "authorOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleDetail_productId_key" ON "VehicleDetail"("productId");

-- CreateIndex
CREATE INDEX "VehicleDetail_makeName_modelName_year_idx" ON "VehicleDetail"("makeName", "modelName", "year");

-- CreateIndex
CREATE INDEX "VehicleDetail_vin_idx" ON "VehicleDetail"("vin");

-- AddForeignKey
ALTER TABLE "MarketplaceVariant" ADD CONSTRAINT "MarketplaceVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MarketplaceProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MarketplaceProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_authorOrgId_fkey" FOREIGN KEY ("authorOrgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceReview" ADD CONSTRAINT "MarketplaceReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleDetail" ADD CONSTRAINT "VehicleDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "MarketplaceProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;
