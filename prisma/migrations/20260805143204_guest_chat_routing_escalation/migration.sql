-- CreateEnum
CREATE TYPE "GuestChatTeam" AS ENUM ('SALES', 'SUPPORT', 'ENGINEERING', 'BILLING', 'PARTNERSHIPS', 'KYC', 'LOGISTICS');

-- CreateEnum
CREATE TYPE "GuestConversationStatus" AS ENUM ('OPEN', 'ESCALATED', 'CLOSED');

-- AlterTable
ALTER TABLE "GuestConversation" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "escalatedAt" TIMESTAMP(3),
ADD COLUMN     "escalatedDisputeId" TEXT,
ADD COLUMN     "escalatedTicketId" TEXT,
ADD COLUMN     "linkedUserId" TEXT,
ADD COLUMN     "status" "GuestConversationStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "team" "GuestChatTeam";

-- CreateIndex
CREATE INDEX "GuestConversation_status_team_updatedAt_idx" ON "GuestConversation"("status", "team", "updatedAt");

-- AddForeignKey
ALTER TABLE "GuestConversation" ADD CONSTRAINT "GuestConversation_linkedUserId_fkey" FOREIGN KEY ("linkedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestConversation" ADD CONSTRAINT "GuestConversation_escalatedTicketId_fkey" FOREIGN KEY ("escalatedTicketId") REFERENCES "SupportTicket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestConversation" ADD CONSTRAINT "GuestConversation_escalatedDisputeId_fkey" FOREIGN KEY ("escalatedDisputeId") REFERENCES "Dispute"("id") ON DELETE SET NULL ON UPDATE CASCADE;
