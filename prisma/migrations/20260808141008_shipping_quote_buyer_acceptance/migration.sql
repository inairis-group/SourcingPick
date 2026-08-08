
-- AlterEnum
ALTER TYPE "InvoiceType" ADD VALUE 'SHIPPING';

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "billedAmountCentsEur" INTEGER,
ADD COLUMN     "buyerAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "buyerAcceptedQuoteId" TEXT,
ADD COLUMN     "buyerDeclineReason" TEXT,
ADD COLUMN     "buyerDeclinedAt" TIMESTAMP(3),
ADD COLUMN     "fxRateBps" INTEGER,
ADD COLUMN     "quotedAmountCents" INTEGER,
ADD COLUMN     "quotedCurrency" TEXT,
ADD COLUMN     "shippingInvoiceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_buyerAcceptedQuoteId_key" ON "Shipment"("buyerAcceptedQuoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shippingInvoiceId_key" ON "Shipment"("shippingInvoiceId");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_buyerAcceptedQuoteId_fkey" FOREIGN KEY ("buyerAcceptedQuoteId") REFERENCES "ShipmentQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

