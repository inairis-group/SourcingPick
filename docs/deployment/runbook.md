# SourcingPick — Deployment Runbook

A first-deploy procedure intended for the engineer cutting over from
dev to a live environment. Companion to `.env.example` (which documents
every variable) and `docs/deployment/checklist.md` (the pre-flight
checks).

This is a v1 launch playbook. It assumes Postgres, a Node.js runtime
(20+), and outbound network access to Wise and your email provider.

---

## 1. Choose a deployment target

| Target            | When it fits                                                    |
|-------------------|------------------------------------------------------------------|
| Vercel            | Default. Best for the v1 launch — handles SSR + cron natively.  |
| Render / Railway  | If you want a managed Postgres + Node host in one console.      |
| Bare-metal VPS    | When data-sovereignty drives EU-only hosting and you've staffed |
|                   | the ops side.                                                    |

The rest of this runbook is platform-agnostic; specifics only matter
for the `Authorization` headers on cron jobs and how secrets are stored.

## 2. Provision the primary database

1. Create a PostgreSQL 17+ cluster. Minimum vCPU=2, RAM=4 GB for v1
   launch volumes; scale by observation.
2. Create the user + database:

   ```sql
   CREATE USER sourcingpick WITH PASSWORD '...';
   CREATE DATABASE sourcingpick OWNER sourcingpick;
   GRANT ALL PRIVILEGES ON DATABASE sourcingpick TO sourcingpick;
   ```
3. Capture the connection string. Format:

   ```
   postgresql://sourcingpick:<password>@<host>:5432/sourcingpick?schema=public&sslmode=require
   ```
4. If you're going through PgBouncer (recommended for serverless),
   append `&pgbouncer=true&connection_limit=1` to prevent prepared-
   statement collisions.
5. Apply the schema:

   ```bash
   DATABASE_URL='...' npx prisma migrate deploy
   ```

   Prisma keeps the migration list in `_prisma_migrations`; rerunning
   the command on an up-to-date DB is a no-op.

## 3. Configure environment variables

Set every variable in `.env.example` whose section is **not** marked
"retired" or "optional". The audit order:

1. `DATABASE_URL` — production cluster.
2. `AUTH_SECRET` — `openssl rand -base64 32`, fresh per environment.
3. `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL` — your
   public origin. **No trailing slash.**
4. `SMTP_*` + `EMAIL_FROM` — your transactional email provider.
5. `WISE_API_HOST`, `WISE_API_TOKEN`, `WISE_PROFILE_ID`,
   `WISE_WEBHOOK_PUBLIC_KEY` — see "Wise setup" below.
6. `PLATFORM_WIRE_IBAN`, `PLATFORM_WIRE_BIC`, `PLATFORM_WIRE_BENEFICIARY`
   — the bank details the buyer panel renders.
7. `CRON_SECRET` — `openssl rand -hex 32`. Vercel auto-includes it on
   cron requests; for self-hosted, set on your scheduler.
8. `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional. Leave blank
   to ship password-only auth at launch.
9. `BUILD_SHA` — your CI / build pipeline should set this so `/api/healthz`
   reports which build is live.

## 4. Wise setup

The `WISE_WEBHOOK_PUBLIC_KEY` is the only fail-closed piece. Without it
the webhook receiver rejects every event and reconciliation never runs.

1. Create the Wise Business account; enable API access.
2. Generate an API token with the **Members → Manage transactions**
   scope (covers balance reads, transfers, recipient creation).
3. Subscribe to webhooks at `<your origin>/api/wise/webhook`. The
   minimum set:
   - `balances#credit` (buyer wires landing — drives reconciliation).
   - `transfers#state-change` (factory payouts — read by the admin
     webhook dashboard).
4. Wise publishes a per-event-family RSA public key. Fetch the
   `notification` family key and paste the full PEM into
   `WISE_WEBHOOK_PUBLIC_KEY`, including the
   `-----BEGIN PUBLIC KEY-----` / `-----END PUBLIC KEY-----` lines.
5. Capture the **platform IBAN** Wise issues for your business
   profile. That's the IBAN the buyer wire panel displays —
   `PLATFORM_WIRE_IBAN` + `PLATFORM_WIRE_BIC`.

## 5. Smoke test before opening traffic

Run this sequence against the new origin before pointing DNS at it:

```bash
# 1. Healthz returns 200 with db.ok=true and the BUILD_SHA echoed back.
curl -fsS https://<origin>/api/healthz | jq .

# 2. The marketing pages render in every locale.
for lang in fr en zh ar; do
  curl -fsS -o /dev/null -w "%{http_code}\\n" "https://<origin>/$lang"
done

# 3. Wise webhook signature gate is fail-closed.
curl -fsS -X POST -d '{}' https://<origin>/api/wise/webhook
# expect: HTTP 401 with "Signature verification failed."

# 4. Create the platform admin via the seed (or a one-off SQL insert)
#    and log in as them. Verify the admin dashboard renders.
```

## 6. Schedule cron jobs

Production cron endpoints (auth: `Authorization: Bearer ${CRON_SECRET}`):

| Path                                          | Cadence | What it does                                |
|-----------------------------------------------|---------|---------------------------------------------|
| `/api/cron/auctions-settle`                   | `*/5 * * * *` | Settles auctions whose `endsAt` has passed. |
| `/api/cron/marketplace-expire-flash-sales`    | `0 * * * *`   | Clears expired flash-sale flags.            |

On Vercel: add to `vercel.json` cron config (header is set
automatically). On VPS: systemd timer or cron with
`curl -H "Authorization: Bearer $CRON_SECRET" https://<origin>/api/cron/...`.

## 7. Open traffic

1. Lower the TTL on the production DNS record 24 hours ahead.
2. Cut DNS over.
3. Watch `/api/healthz` from your uptime monitor for the first 30
   minutes; watch the admin webhook dashboard for the first few real
   payments.

## 8. Day-2 ops

- **Database backups**: configure your managed provider for PITR
  (point-in-time recovery), 7+ days of retention. Test a restore once
  per quarter.
- **Webhook stuck queue**: the admin webhook page shows any Wise event
  that failed reconciliation. Investigate, fix the underlying order
  reference, and hit the **Replay** button.
- **Audit log**: write-only by design. Don't prune; archive cold
  rows to long-term storage if size becomes a problem.
- **Migrations**: run `npx prisma migrate deploy` as part of every
  release script. Migrations are forward-only.
- **Secret rotation**: rotate `AUTH_SECRET` and `CRON_SECRET` annually.
  `AUTH_SECRET` rotation logs every user out — schedule a maintenance
  window.

## 9. Rollback

The deploy is rollback-safe **if** you don't apply schema migrations
that drop columns / types. Most of our migrations are additive; the
CTO-audit follow-up (`drop_deprecated_enum_values`) is the exception.
Don't roll back through that boundary without coordinating with the
team — re-introducing dropped enum values requires another migration.

For a same-build rollback:

1. Re-deploy the previous build.
2. Don't roll back the database unless absolutely necessary; the audit
   log + escrow tables don't tolerate time travel.
