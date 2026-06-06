-- Agent tooling — per-agent rate overrides + profile fields.
--
-- Adds nullable agentResearchFee{Day,Week}Cents so senior agents can
-- bill above the platform's published floor, plus profile fields
-- (bio, timezone, categories) and an onboardedAt marker so the agent
-- onboarding wizard knows when to gate.
--
-- Existing agents are marked already-onboarded so they don't bounce to
-- the wizard on next login. New agents the admin creates will land
-- there until they complete it.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agentBio" TEXT,
ADD COLUMN     "agentCategories" "Category"[] DEFAULT ARRAY[]::"Category"[],
ADD COLUMN     "agentOnboardedAt" TIMESTAMP(3),
ADD COLUMN     "agentResearchFeeDayCents" INTEGER,
ADD COLUMN     "agentResearchFeeWeekCents" INTEGER,
ADD COLUMN     "agentTimezone" TEXT;

-- Backfill: every existing agent skips the new onboarding wizard.
UPDATE "User"
   SET "agentOnboardedAt" = NOW()
 WHERE "role" = 'AGENT'
   AND "hasOnboarded" = TRUE;
