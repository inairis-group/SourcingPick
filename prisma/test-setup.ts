/**
 * One-time setup for the integration-test database.
 *
 * Creates `sourcingpick_test` next to the dev database in the same
 * Postgres instance (the local `docker-compose` postgres or any other
 * cluster pointed at by `DATABASE_URL`), then runs every migration
 * against it via `prisma migrate deploy`. Idempotent — running twice on
 * an already-set-up cluster is a no-op (CREATE DATABASE is skipped if
 * the database exists, migrations are skipped if up-to-date).
 *
 * Usage:
 *
 *   npm run db:test:setup
 *   # then add to .env.local or your shell:
 *   #   TEST_DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/sourcingpick_test?schema=public"
 *
 * After setup, `npm run test:integration` connects to TEST_DATABASE_URL
 * and TRUNCATEs every table before each test.
 */
import { config as loadEnv } from "dotenv";
import { Client } from "pg";
import { execSync } from "node:child_process";

// Pull DATABASE_URL out of .env / .env.local so callers don't have to
// remember to inline it on the command line.
loadEnv({ path: ".env.local", quiet: true });
loadEnv({ quiet: true });

const TEST_DB_NAME = "sourcingpick_test";

function rewriteUrlDb(url: string, db: string): string {
  // postgresql://user:pass@host:port/<db>?...
  return url.replace(/(postgresql:\/\/[^/]+\/)([^?]+)/, `$1${db}`);
}

async function main() {
  const sourceUrl = process.env.DATABASE_URL;
  if (!sourceUrl) {
    throw new Error(
      "DATABASE_URL is required (point it at the dev cluster — we use it to CREATE DATABASE).",
    );
  }

  // Connect to the dev DB to issue CREATE DATABASE. `postgres` is a
  // safer admin target but local docker dev doesn't expose it; the dev
  // user has CREATEDB privilege in the docker-compose setup.
  const adminClient = new Client({ connectionString: sourceUrl });
  await adminClient.connect();
  try {
    const exists = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [TEST_DB_NAME],
    );
    if (exists.rowCount === 0) {
      // Can't parameterise identifiers; safe because TEST_DB_NAME is a
      // compile-time constant.
      await adminClient.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
      console.log(`✓ Created database "${TEST_DB_NAME}"`);
    } else {
      console.log(`= Database "${TEST_DB_NAME}" already exists, skipping`);
    }
  } finally {
    await adminClient.end();
  }

  const testUrl = rewriteUrlDb(sourceUrl, TEST_DB_NAME);
  console.log(`→ Running migrations against ${TEST_DB_NAME}`);
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "inherit",
  });

  console.log(`\n✓ Test database ready.\n`);
  console.log(`Add this to your shell or .env.local:`);
  console.log(`\n  TEST_DATABASE_URL="${testUrl}"\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
