-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "marketplaceVariantId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_marketplaceVariantId_fkey" FOREIGN KEY ("marketplaceVariantId") REFERENCES "MarketplaceVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
