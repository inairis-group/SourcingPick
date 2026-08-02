-- CreateTable
CREATE TABLE "GuestConversation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'fr',
    "handledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "fromTeam" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestConversation_token_key" ON "GuestConversation"("token");

-- CreateIndex
CREATE INDEX "GuestConversation_handledAt_updatedAt_idx" ON "GuestConversation"("handledAt", "updatedAt");

-- CreateIndex
CREATE INDEX "GuestMessage_conversationId_createdAt_idx" ON "GuestMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "GuestMessage" ADD CONSTRAINT "GuestMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "GuestConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
