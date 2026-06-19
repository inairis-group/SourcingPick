-- AlterEnum
ALTER TYPE "AttachmentContext" ADD VALUE 'MARKETPLACE_TEST_VIDEO';

-- AlterTable
ALTER TABLE "MarketplaceProduct" ADD COLUMN     "testedAndApprovedAt" TIMESTAMP(3),
ADD COLUMN     "testedAndApprovedById" TEXT;

-- AddForeignKey
ALTER TABLE "MarketplaceProduct" ADD CONSTRAINT "MarketplaceProduct_testedAndApprovedById_fkey" FOREIGN KEY ("testedAndApprovedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
