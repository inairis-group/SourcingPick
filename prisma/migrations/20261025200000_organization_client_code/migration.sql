-- A reception code per client organisation: suppliers write it on every
-- carton delivered to the warehouse. "SP-" and six digits, unique; existing
-- clients get one here, new ones at sign-up (src/lib/org/client-code.ts).

ALTER TABLE "Organization" ADD COLUMN "clientCode" TEXT;
CREATE UNIQUE INDEX "Organization_clientCode_key" ON "Organization"("clientCode");

DO $$
DECLARE
  r RECORD;
  c TEXT;
BEGIN
  FOR r IN SELECT id FROM "Organization" WHERE type = 'CLIENT' AND "clientCode" IS NULL LOOP
    LOOP
      c := 'SP-' || (100000 + floor(random() * 900000))::int::text;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "Organization" WHERE "clientCode" = c);
    END LOOP;
    UPDATE "Organization" SET "clientCode" = c WHERE id = r.id;
  END LOOP;
END $$;
