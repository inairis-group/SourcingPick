-- CreateEnum
CREATE TYPE "SourcingRequestOrigin" AS ENUM ('SOURCING_FLOW', 'MARKETPLACE');

-- AlterTable
ALTER TABLE "SourcingRequest" ADD COLUMN "origin" "SourcingRequestOrigin" NOT NULL DEFAULT 'SOURCING_FLOW';
