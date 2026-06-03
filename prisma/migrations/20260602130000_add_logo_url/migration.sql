-- Org logo / profile photo. Nullable: UI falls back to a clean initials
-- avatar (same pattern as the founders cards on the about page).

ALTER TABLE "Organization" ADD COLUMN "logoUrl" TEXT;
