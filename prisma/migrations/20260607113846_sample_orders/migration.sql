-- AlterTable
ALTER TABLE "MarketplaceProduct" ADD COLUMN     "sampleAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "samplePriceCentsClient" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isSample" BOOLEAN NOT NULL DEFAULT false;
