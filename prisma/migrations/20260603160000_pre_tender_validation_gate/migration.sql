-- Partner item #14 — admin pre-tender validation gate.
-- Agents cannot dispatch TenderInvitations until an admin has approved the
-- request, confirming the brief is clear, the budget is sane, and the
-- sourcing region is allowed.
ALTER TABLE "SourcingRequest"
  ADD COLUMN "preTenderApprovedAt" TIMESTAMP(3),
  ADD COLUMN "preTenderApprovedById" TEXT,
  ADD COLUMN "preTenderRejectedAt" TIMESTAMP(3),
  ADD COLUMN "preTenderRejectionReason" TEXT;

ALTER TABLE "SourcingRequest"
  ADD CONSTRAINT "SourcingRequest_preTenderApprovedById_fkey"
  FOREIGN KEY ("preTenderApprovedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexed for the admin pre-tender queue: assigned, awaiting validation.
CREATE INDEX "SourcingRequest_preTenderApprovedAt_idx"
  ON "SourcingRequest" ("preTenderApprovedAt");
