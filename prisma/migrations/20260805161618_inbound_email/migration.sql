-- CreateTable
CREATE TABLE "InboundEmail" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "targetKind" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboundEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InboundEmail_messageId_key" ON "InboundEmail"("messageId");

-- CreateIndex
CREATE INDEX "InboundEmail_targetKind_targetId_idx" ON "InboundEmail"("targetKind", "targetId");
