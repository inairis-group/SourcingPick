-- AlterEnum
ALTER TYPE "InvoiceType" ADD VALUE 'ADMIN_CUSTOM';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "issuedByUserId" TEXT,
ADD COLUMN     "lineDescription" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
