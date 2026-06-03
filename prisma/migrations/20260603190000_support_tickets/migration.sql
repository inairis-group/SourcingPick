-- Support ticketing — standalone threads between a requester
-- (client/factory/agent) and the admin support team. Reuses the existing
-- Thread + Message infrastructure via the new ThreadContextType.SUPPORT
-- value; the SupportTicket row carries lifecycle + polymorphic topic.

ALTER TYPE "ThreadContextType" ADD VALUE 'SUPPORT';

CREATE TYPE "SupportTicketStatus" AS ENUM ('PENDING', 'OPEN', 'RESOLVED');

CREATE TYPE "SupportTopicKind" AS ENUM (
  'ORDER',
  'SOURCING_REQUEST',
  'MARKETPLACE_PRODUCT',
  'AUCTION',
  'CLIENT_ORG',
  'FACTORY_ORG',
  'AGENT'
);

CREATE TABLE "SupportTicket" (
  "id"              TEXT NOT NULL,
  "reference"       TEXT NOT NULL,
  "subject"         TEXT NOT NULL,
  "status"          "SupportTicketStatus" NOT NULL DEFAULT 'PENDING',
  "requesterUserId" TEXT NOT NULL,
  "requesterOrgId"  TEXT,
  "topicKind"       "SupportTopicKind",
  "topicId"         TEXT,
  "openedAt"        TIMESTAMP(3),
  "resolvedAt"      TIMESTAMP(3),
  "resolvedById"    TEXT,
  "deletedAt"       TIMESTAMP(3),
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupportTicket_reference_key"
  ON "SupportTicket" ("reference");
CREATE INDEX "SupportTicket_status_createdAt_idx"
  ON "SupportTicket" ("status", "createdAt");
CREATE INDEX "SupportTicket_requesterUserId_status_idx"
  ON "SupportTicket" ("requesterUserId", "status");
CREATE INDEX "SupportTicket_topicKind_topicId_idx"
  ON "SupportTicket" ("topicKind", "topicId");

ALTER TABLE "SupportTicket"
  ADD CONSTRAINT "SupportTicket_requesterUserId_fkey"
  FOREIGN KEY ("requesterUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupportTicket"
  ADD CONSTRAINT "SupportTicket_requesterOrgId_fkey"
  FOREIGN KEY ("requesterOrgId") REFERENCES "Organization"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SupportTicket"
  ADD CONSTRAINT "SupportTicket_resolvedById_fkey"
  FOREIGN KEY ("resolvedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
