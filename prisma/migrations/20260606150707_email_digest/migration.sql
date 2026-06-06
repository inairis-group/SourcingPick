-- CreateEnum
CREATE TYPE "EmailDigestMode" AS ENUM ('IMMEDIATE', 'DAILY', 'OFF');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "digestedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailDigestMode" "EmailDigestMode" NOT NULL DEFAULT 'IMMEDIATE';

-- CreateIndex
CREATE INDEX "Notification_recipientUserId_digestedAt_createdAt_idx" ON "Notification"("recipientUserId", "digestedAt", "createdAt");
