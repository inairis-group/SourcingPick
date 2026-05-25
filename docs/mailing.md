# Mailing setup

SourcingPick sends transactional email via **Nodemailer over SMTP**, with React-Email templates rendered server-side. Provider-agnostic on purpose: dev runs against [Mailpit](https://mailpit.axllent.org/) so nothing escapes the dev machine, prod plugs into Postmark / Resend / SES / Mailgun / OVH / Scaleway / your-relay-of-choice with three env vars.

## The pieces

- **`src/lib/email/transport.ts`** — Nodemailer transport singleton. Reads `SMTP_HOST/PORT/USER/PASS` from env, caches one transport per process. `secure: true` is set automatically when `SMTP_PORT === 465`.
- **`src/lib/email/send.ts`** — `sendEmail({ to, subject, react })` wrapper. Renders the React tree to HTML + plain-text via `react-email`, then hands off to the transport. One call site for every transactional email.
- **`src/lib/email/templates/`** — `otp.tsx`, `password-reset.tsx`, `notification.tsx`. Each template takes a `locale` prop and ships fr/en/zh copy inline.
- **`src/lib/notifications/emit.ts`** — fires the email side-effect from `emitNotification(...)` when the type is in `EMAIL_TYPES` (currently `QUOTE_RECEIVED`, `QUOTE_ACCEPTED`, `KYC_DECISION`, `SHIPMENT`).

The whole pipeline is fire-and-forget: the in-app notification row is the source of truth, the email is a best-effort overlay. SMTP failures never roll back the action that triggered them.

## Dev setup (Mailpit)

```bash
# Run alongside Postgres in docker-compose
cat >> docker-compose.yml <<'EOF'
  mailpit:
    image: axllent/mailpit:latest
    restart: unless-stopped
    ports:
      - "1025:1025"    # SMTP
      - "8025:8025"    # web UI
EOF
docker compose up -d mailpit
```

Add to `.env`:
```
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="SourcingPick <no-reply@sourcingpick.local>"
```

Open `http://localhost:8025` — every email the app sends shows up there with full headers, HTML preview, raw source, and a "test this in N clients" view. **Don't skip this**: the OTP-based 2FA flow needs an inbox in dev or you can't log in as the super-admin.

## Provider configs (prod)

Pick one. Drop into `.env`. All else stays the same.

### Postmark

```env
SMTP_HOST="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_USER="<your-postmark-server-token>"   # same value for user and pass
SMTP_PASS="<your-postmark-server-token>"
EMAIL_FROM="SourcingPick <hello@your-domain.tld>"
```
Notes: Postmark requires the From address to belong to a verified sender signature or signed domain. Use the **transactional** server stream — not broadcast.

### Resend

```env
SMTP_HOST="smtp.resend.com"
SMTP_PORT="465"
SMTP_USER="resend"
SMTP_PASS="<your-resend-api-key>"
EMAIL_FROM="SourcingPick <hello@your-domain.tld>"
```
Notes: domain must be verified in the Resend dashboard. Port 465 → `secure: true` automatically.

### Amazon SES

```env
SMTP_HOST="email-smtp.eu-west-3.amazonaws.com"  # match your AWS region
SMTP_PORT="587"
SMTP_USER="<SMTP IAM user — Access Key>"
SMTP_PASS="<SMTP IAM user — Secret Access Key, hashed for SMTP>"
EMAIL_FROM="SourcingPick <hello@your-domain.tld>"
```
Notes: new accounts are sandboxed (can only send to verified addresses). Request production access before launch.

### Mailgun

```env
SMTP_HOST="smtp.eu.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@mg.your-domain.tld"
SMTP_PASS="<mailgun-smtp-password>"
EMAIL_FROM="SourcingPick <hello@your-domain.tld>"
```

### OVH (FR)

```env
SMTP_HOST="ssl0.ovh.net"
SMTP_PORT="465"
SMTP_USER="hello@your-domain.tld"
SMTP_PASS="<the-mailbox-password>"
EMAIL_FROM="SourcingPick <hello@your-domain.tld>"
```
Notes: low daily quota (~500/day on shared plans). Fine to start, upgrade or switch to Postmark/SES once you ship.

## DNS hygiene (do this on day one)

Without these your emails go to spam, fast:

- **SPF**: TXT record at your domain root. Example for Postmark:
  `"v=spf1 include:spf.mtasv.net ~all"`
- **DKIM**: each provider gives you a CNAME or TXT to add. Wire it before sending.
- **DMARC**: TXT at `_dmarc.your-domain.tld`:
  `"v=DMARC1; p=quarantine; rua=mailto:postmaster@your-domain.tld; pct=100"`
  Start with `p=none` for two weeks to monitor reports, then ratchet to `quarantine` then `reject`.

Test the lot at <https://www.mail-tester.com/> — aim for 10/10 before launch.

## Adding a new email

1. **Drop a template** under `src/lib/email/templates/`. Take a `locale` prop, render the same component shape as `otp.tsx` (Geist font, Body/Container/Section, brand-tinted heading).
2. **Call `sendEmail`** with `subject`, `to`, and the React element.
3. **Or — for notification-driven emails** — extend `src/lib/notifications/copy.ts` with a renderer for the new `NotificationType`, then add the type to `EMAIL_TYPES`. The emit pipeline picks it up automatically.

Example notification email:
```ts
import { sendEmail } from "@/lib/email/send";
import NotificationEmail from "@/lib/email/templates/notification";

await sendEmail({
  to: user.email,
  subject: copy.title,
  react: NotificationEmail({
    title: copy.title,
    description: copy.description,
    ctaLabel: "Open in app",
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/fr/client/orders/${order.id}`,
    locale: user.locale,
  }),
});
```

## Testing without provider creds

`getTransport()` throws if `SMTP_HOST` / `SMTP_PORT` aren't set. Locally, Mailpit covers this. In CI / unit tests, mock `@/lib/email/send` so action tests don't try to actually transport.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Error: SMTP_HOST and SMTP_PORT must be set` | `.env` not loaded or vars not set in deploy environment |
| Mail goes to spam | SPF / DKIM / DMARC not configured for the From domain |
| `EAUTH` from provider | Wrong creds, or the IP isn't whitelisted (some shared SES / OVH plans gate by IP) |
| Mail sent but never arrives | Check provider dashboard for bounce / suppression list entries — Stripe and some inboxes auto-suppress addresses that bounced once |
| OTP email never lands in dev | Mailpit container isn't running — `docker compose ps mailpit` and `docker logs mailpit` |
| Cold-start delays on Vercel | First request after idle pays ~500ms to bring up the function; not Nodemailer's fault. Consider Resend's HTTP API + an edge-runtime variant if it matters. |

## Migrating off Nodemailer

If you outgrow SMTP (volume, deliverability features, batch sends, scheduled emails), the swap point is `src/lib/email/transport.ts` + `src/lib/email/send.ts`. Replace the transport with a provider SDK (Resend / Postmark / SES), keep the React Email templates untouched, and `sendEmail()`'s signature stays the same. The notification + auth callers don't change.
