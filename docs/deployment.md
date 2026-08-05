# Deployment

> **Reality check, 2026-08-05.** Production (`sourcingpick.com`, host
> `srv1104436`) does **not** match the VPS section below. It runs **nginx +
> PM2**, not Caddy + systemd, with Postgres local to the box and the checkout at
> `/var/www/sourcingpick`. Restart with `pm2 restart sourcingpick`. The Caddy
> and systemd material below is the original recommendation, not a description
> of what is deployed — treat it as an alternative, and trust the running box
> over this file.
>
> **Crons do not run.** `vercel.json` declares them, but Vercel's scheduler
> does not exist on a VPS, and `CRON_SECRET` is unset so the endpoints 503
> anyway. Flash sales never expire, shipment reminders never send and auctions
> never settle. See [auctions-plan.md](auctions-plan.md#the-blocker-settlement-never-runs)
> for the fix.
>
> **Payments are PingPong**, not Stripe. Every `STRIPE_*` reference below is
> retired — see [payment-rail-removal-map.md](payment-rail-removal-map.md).

Two supported targets:

1. **VPS** (single-server, dockerised) — closest to dev, full control, cheapest.
2. **Vercel + managed Postgres** (Neon) + Upstash (Redis for SSE fan-out at scale) — zero-ops, scales to nothing on idle.

Pick one and run with it. The codebase is provider-agnostic; the differences live in environment variables and a couple of build-time flags.

---

## 0. Prerequisites (both targets)

- **Domain** with DNS control (e.g. `sourcingpick.com`).
- **Stripe account** in test mode, plus access to switch to live keys when you're ready to charge real cards.
- **SMTP provider** for transactional mail (Postmark, Resend, Amazon SES, OVH, Mailgun, …). Nodemailer talks to anything.
- **Google Cloud project** with an OAuth 2.0 Client ID if you want Google login (the Auth.js callback URL must match).
- Local `.env.example` is the source of truth for what env vars exist. Copy it, fill the values, and never commit the result.

### Required environment variables

| Key | Where it's used | Production value notes |
|---|---|---|
| `DATABASE_URL` | Prisma driver-adapter | `postgresql://user:pass@host:5432/db?schema=public&sslmode=require` |
| `AUTH_SECRET` | Auth.js JWT signing | `openssl rand -base64 32` — rotate by issuing a new one + restarting; sessions invalidate |
| `AUTH_URL` | Auth.js | `https://your-domain.tld` |
| `NEXT_PUBLIC_APP_URL` | Email links | `https://your-domain.tld` |
| `NEXT_PUBLIC_SITE_URL` | Absolute links in email | `https://your-domain.tld` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Nodemailer | See [`mailing.md`](./mailing.md) |
| `EMAIL_FROM` | Outgoing `From:` | `"SourcingPick <hello@your-domain.tld>"` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth login | Optional — first-time Google sign-ins are rejected (role/org collection isn't wired) |

---

## 1. VPS deploy (recommended for v1)

Tested on **Ubuntu 24.04 LTS**, but any modern Debian/Ubuntu works. Assumes a fresh VPS with sudo access and ports 80/443 open.

### 1.1 Provision

```bash
# As root (or sudo)
adduser sourcingpick
usermod -aG sudo,docker sourcingpick   # docker group created in step 1.2
ufw allow OpenSSH
ufw allow http
ufw allow https
ufw enable
```

### 1.2 Install Docker + Node + Caddy

```bash
# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

# Node 20 LTS (via nvm for reproducibility)
sudo -iu sourcingpick bash -c '
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  source ~/.nvm/nvm.sh
  nvm install 20
  nvm alias default 20
'

# Caddy — handles TLS automatically via Let's Encrypt
sudo apt install -y debian-keyring debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

### 1.3 Clone + configure

```bash
sudo -iu sourcingpick
git clone git@github.com:Caleb-Livingstone/sourcingpick.git
cd sourcingpick
cp .env.example .env
# Edit .env with production values (DATABASE_URL, AUTH_SECRET, Stripe, SMTP, …)
nano .env
```

### 1.4 Postgres (dockerised, persistent)

```bash
# docker-compose.yml at repo root already has the dev config.
# For prod, bump credentials and pin the version:
cat > docker-compose.prod.yml <<EOF
services:
  postgres:
    image: postgres:17.2
    restart: unless-stopped
    environment:
      POSTGRES_USER: sourcingpick
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: sourcingpick
    volumes:
      - sp_pg_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"   # bind to loopback only — never expose 5432 to the internet
volumes:
  sp_pg_data:
EOF

# Provide POSTGRES_PASSWORD via env file (don't put it in compose itself).
echo "POSTGRES_PASSWORD=$(openssl rand -hex 24)" >> .env

# Bring it up
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Set `DATABASE_URL=postgresql://sourcingpick:${POSTGRES_PASSWORD}@localhost:5432/sourcingpick?schema=public` in `.env`.

### 1.5 Build + migrate

```bash
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
```

### 1.6 Process manager (systemd)

```ini
# /etc/systemd/system/sourcingpick.service
[Unit]
Description=SourcingPick Next.js app
After=network.target docker.service

[Service]
Type=simple
User=sourcingpick
WorkingDirectory=/home/sourcingpick/sourcingpick
EnvironmentFile=/home/sourcingpick/sourcingpick/.env
ExecStart=/home/sourcingpick/.nvm/versions/node/v20.20.2/bin/node node_modules/next/dist/bin/next start --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now sourcingpick
sudo systemctl status sourcingpick
```

### 1.7 Caddy reverse proxy + TLS

```caddy
# /etc/caddy/Caddyfile
sourcingpick.com, www.sourcingpick.com {
    encode gzip zstd

    # Don't buffer SSE responses — messaging stream needs them flushed
    @sse path /api/messaging/stream/*
    handle @sse {
        reverse_proxy localhost:3000 {
            flush_interval -1
        }
    }

    reverse_proxy localhost:3000

    log {
        output file /var/log/caddy/sourcingpick.log
        format json
    }
}
```

```bash
sudo systemctl reload caddy
```

Caddy provisions a Let's Encrypt cert automatically the first time you load `https://sourcingpick.com`.

### 1.8 PingPong webhook endpoint

In the PingPong partner console, register:
- URL: `https://sourcingpick.com/api/pingpong/webhook`
- Header: `x-pingpong-signature` — HMAC-SHA256 of the **raw** body
- Copy the signing secret into `PINGPONG_WEBHOOK_SECRET`, restart the app.

The route verifies the signature against the raw body *before* parsing JSON;
signing a re-serialised payload is how a signature check ends up validating
something other than what was sent.

Buyer payments call the rail-neutral `finalizeBuyerOrderPayment()` in
`lib/payments/finalize.ts`, which is idempotent on `providerRef` — a replayed
delivery does not double-charge.

### 1.9 Backups

The single most important post-deploy task. **Do this on day one.**

```bash
# Daily Postgres dump → off-host (S3, Backblaze, OVH cold storage, …)
cat > /home/sourcingpick/backup.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
TS=$(date +%Y%m%d-%H%M%S)
docker exec sourcingpick-postgres-1 \
  pg_dump -U sourcingpick sourcingpick \
  | gzip > /home/sourcingpick/backups/db-$TS.sql.gz
# Then rclone/aws s3 cp /home/sourcingpick/backups/ s3://your-bucket/sourcingpick/
EOF
chmod +x /home/sourcingpick/backup.sh

# Cron daily at 03:00 UTC
echo "0 3 * * * /home/sourcingpick/backup.sh" | crontab -u sourcingpick -
```

Also back up `./uploads/` (KYC docs, marketplace images). Swap that directory for S3/R2 ASAP — see `lib/storage/local.ts`.

### 1.10 Logs + monitoring

```bash
# App logs
journalctl -u sourcingpick -f

# Caddy logs
tail -f /var/log/caddy/sourcingpick.log

# Postgres logs (inside the container)
docker logs -f sourcingpick-postgres-1
```

For production-grade observability, add Sentry (server + client) and a log shipper (Vector → Loki/Logflare).

### 1.11 Deploy a new version

```bash
sudo -iu sourcingpick
cd sourcingpick
git pull
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
sudo systemctl restart sourcingpick
```

Wrap this in a `deploy.sh` and you're done.

---

## 2. Vercel + Neon (zero-ops)

Faster to ship, scales to zero on idle, more expensive past a certain traffic level. The trade-off is loss of SSH access — debugging happens through Vercel logs + Neon's console.

### 2.1 Database — Neon

1. Create a Neon project: <https://console.neon.tech>.
2. Create a `production` branch off `main`; keep `main` as the staging branch.
3. Copy the connection string ending with `?sslmode=require` — **important**, Vercel-side Postgres requires SSL.
4. Add it to Vercel as `DATABASE_URL` (per-environment: one value for Preview = `main` branch, one for Production = `production` branch).

> Neon's pooler endpoint (port `5432`, hostname suffix `-pooler`) is what you want for serverless workloads. The direct endpoint is only for migrations.
>
> Migrations run from local: `DATABASE_URL=<neon-direct-url> npx prisma migrate deploy`. Use the *non-pooled* URL for migrations — pgbouncer doesn't support some Prisma queries.

### 2.2 Email — Resend or Postmark

Nodemailer-over-SMTP works fine on Vercel; just point `SMTP_HOST` at your provider. Resend's SMTP relay is `smtp.resend.com:465`. See [`mailing.md`](./mailing.md).

### 2.3 Optional: Upstash Redis for SSE fan-out

The messaging SSE stream (`/api/messaging/stream/[threadId]`) currently uses Postgres `LISTEN/NOTIFY` with a dedicated `pg.Client` connection per subscriber. **Vercel's serverless functions don't keep long-lived connections** — every request times out at 30s (or 900s on Pro plans), and Postgres `LISTEN` doesn't survive function suspension anyway.

Options on Vercel:
- **Disable SSE in production**: clients poll the `/api/messaging/threads/[threadId]/messages?after=` endpoint every 10s. Cheap, slightly less snappy. Set `NEXT_PUBLIC_MESSAGING_TRANSPORT=poll` (you'd need to add this flag; today the client always opens an EventSource).
- **Swap LISTEN/NOTIFY for Upstash Redis pub/sub**: build a `pubsub-upstash.ts` adapter that mirrors `src/lib/messaging/pubsub.ts`. Upstash's REST API works in edge runtimes.
- **Run the messaging route on a long-running platform** (Fly.io, Railway, your own VPS) and proxy to it from Vercel.

For v1 traffic, polling is fine. Plan for Upstash if message-volume becomes meaningful.

### 2.4 Deploy

```bash
# One-time
npm i -g vercel
vercel link
# Set env vars via dashboard or CLI:
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
# … rinse and repeat for the list above

# Per-deploy: just push to main (auto-deploys via the Git integration)
git push origin main
```

`vercel.json` isn't required — Next.js is detected automatically. The build runs `next build`, which generates the static + dynamic routes. Prisma client generation runs as part of `postinstall` (already wired in `package.json`).

#### Vercel-specific gotchas

- **Prisma postinstall**: Vercel caches `node_modules` aggressively. If the schema changes and you don't bump a package version, the Prisma client may not regenerate. Workaround: add `"postinstall": "prisma generate"` to `package.json` (already there).
- **Cold starts**: serverless functions take ~500ms to spin up cold. The Stripe webhook handler must finish processing within the function timeout — `finalizeStripePayment` is fast (single transaction), so this is fine.
- **Image uploads**: `lib/storage/local.ts` writes to `./uploads/`, which doesn't persist on Vercel. **You must swap to R2/S3 before deploying to Vercel.** This is a code change, not a config change.

### 2.5 Stripe webhook on Vercel

Same as VPS — point PingPong at `https://your-vercel-domain.com/api/pingpong/webhook`. The `PINGPONG_WEBHOOK_SECRET` is the only thing that differs per environment.

---

## 3. Post-deploy checklist

After either deployment path:

- [ ] Run `npx prisma migrate deploy` against production DB.
- [ ] Seed an initial admin user (don't ship `npm run db:seed` to prod — it creates fake orgs). Create a one-off script that inserts only the platform org + your admin user.
- [ ] Verify the `/api/auth/csrf` endpoint returns JSON.
- [ ] Sign up as a test client, place a sandbox Stripe order (card `4242 4242 4242 4242`), check the webhook fires and the order advances.
- [ ] Send a test email — sign up, click "forgot password", confirm the reset email lands.
- [ ] Configure DKIM/SPF for your sending domain (per your SMTP provider's instructions).
- [ ] Set `CRON_SECRET` **and install the cron entries** — nothing schedules
      itself on a VPS. Without this, flash sales never expire, shipment
      reminders never send and auctions never settle.
- [ ] Set `PINGPONG_*` and register the webhook, or payouts fail (retryably)
      and buyers cannot pay in.
- [ ] Optional: `INBOUND_EMAIL_DOMAIN` + `INBOUND_EMAIL_SECRET` and an inbound
      route at your mail provider, so customers can answer support mail by
      replying. Left unset, the mails point people back to the app instead.
- [ ] Schedule daily DB backups + verify a restore works *before* you need it.
- [ ] Set up uptime monitoring (Better Uptime, OneUptime, or a single Healthchecks.io check pinged by a cron job hitting `/api/auth/csrf`).

## 4. Rollback

VPS:
```bash
git log --oneline -10        # find the last-good commit
git reset --hard <sha>
npm ci && npm run build && sudo systemctl restart sourcingpick
```

Vercel: in the dashboard, click the previous deployment → "Promote to production". Instant rollback, no rebuild.

For DB migrations, **Prisma 7 doesn't support automatic down-migrations**. If a migration goes bad, restore from the most recent backup. This is why daily backups are non-negotiable.
