-- Admin permission hierarchy.
--
-- Adds AdminScope enum + User.adminScopes column, and backfills every
-- existing admin to [SUPER] so no current admin loses access at
-- deploy time. The application reads `adminScopes` via
-- `requireAdminScope(scope)` in src/lib/permissions/admin-scopes.ts;
-- non-admin roles never enter that code path.

-- CreateEnum
CREATE TYPE "AdminScope" AS ENUM ('SUPER', 'KYC', 'MARKETPLACE', 'FINANCE', 'SUPPORT', 'DISPUTES', 'REQUESTS', 'USERS', 'WEBHOOKS', 'SETTINGS', 'AGENTS', 'AUDIT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminScopes" "AdminScope"[] DEFAULT ARRAY[]::"AdminScope"[];

-- Backfill: every existing admin keeps the keys to the kingdom.
-- Operators add curated subsets to new staff via /admin/users.
UPDATE "User" SET "adminScopes" = ARRAY['SUPER']::"AdminScope"[] WHERE "role" = 'ADMIN';
