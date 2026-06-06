# Pre-flight checklist

A 30-minute pass before every production deploy.

## Code

- [ ] `npm run typecheck:fast` clean
- [ ] `npm test` clean (currently 45 unit tests)
- [ ] `npm run test:integration` clean — needs a local test DB; see
      `docs/deployment/runbook.md` step 2 for setup
- [ ] `npm run lint` no new warnings
- [ ] No `console.log` / `console.error` in code paths touched this release
- [ ] No new `// TODO` markers without an issue or owner
- [ ] No new environment variables that aren't documented in `.env.example`

## Database

- [ ] Every new migration has a one-paragraph comment header explaining
      why it exists (see existing migrations for the style)
- [ ] If a migration drops columns or types, the rollback plan is
      written in the PR description
- [ ] `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma`
      matches what the latest migration produces — no schema drift
- [ ] The migration ordering is monotonic (timestamps strictly increasing)

## Security

- [ ] No secrets committed (run `git diff --cached -- .env*` if unsure)
- [ ] New `requireRole()` / `requireAuth()` calls cover every new
      protected page or server action
- [ ] New webhook receivers are fail-closed when the signature env var
      isn't set
- [ ] Forwarder magic-link tokens still expire by default (don't drop
      the TTL guard in your reroll)
- [ ] Attachments still enforce per-context caps; no new `storeAttachment()`
      caller bypasses the validator

## Operational

- [ ] `/api/healthz` returns 200 with `db.ok=true` on the staging
      environment
- [ ] Cron endpoints respond 200 to a manual `curl` with the right
      `Authorization` header, and 401/403 without
- [ ] `BUILD_SHA` is being injected by CI so `/api/healthz` reports
      the deploy actually in flight
- [ ] Wise webhook target URL hasn't changed in their dashboard
- [ ] No new outbound network calls without a timeout

## Communication

- [ ] Release notes drafted for the partner channel (what shipped,
      what's still pending sign-off)
- [ ] If schema changes might affect partner integrations, notify
      ahead of the deploy window
- [ ] On-call rotation confirmed for the 24h after a non-trivial deploy
