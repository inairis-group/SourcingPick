-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceType_new" AS ENUM ('DEPOSIT', 'BALANCE', 'RESEARCH_FEE', 'SOURCING_FEE', 'CERT_FEE');
ALTER TABLE "Invoice" ALTER COLUMN "type" TYPE "InvoiceType_new" USING ("type"::text::"InvoiceType_new");
ALTER TYPE "InvoiceType" RENAME TO "InvoiceType_old";
ALTER TYPE "InvoiceType_new" RENAME TO "InvoiceType";
DROP TYPE "public"."InvoiceType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "plan";

-- DropEnum
DROP TYPE "Plan";

