# SourcingPick

International sourcing platform — buyers post needs, agents qualify and orchestrate quotes from vetted factories, escrow-secured payments, in-app messaging, and a French-led certification programme.

For the product spec, see [docs/spec-v1.pdf](docs/spec-v1.pdf). For architectural decisions, see [docs/](docs/).

## Stack

- **Framework:** Next.js 16 (App Router, RSC) · React 19 · TypeScript 5
- **Styling:** Tailwind v4 · Geist (sans + mono) · Headless UI primitives · HugeIcons
- **DB / ORM:** PostgreSQL 17 (Docker) · Prisma 7 with the `@prisma/adapter-pg` driver
- **Auth:** Auth.js v5 (credentials + Google OAuth) · email-OTP 2FA
- **Realtime:** Server-Sent Events (Postgres LISTEN/NOTIFY for fan-out) — no WebSockets
- **Email:** Nodemailer + React Email templates (Phase 0 dev uses Mailpit at `localhost:1025`)
- **i18n:** Subpath routing (`/fr`, `/en`, `/zh`) — auto-detect via cookie → `Accept-Language` → French fallback

## First-time setup

Prerequisites: Node 20+, npm, Docker.

```bash
# 1. Install deps (postinstall runs prisma generate)
npm install

# 2. Copy the env template — defaults match docker-compose
cp .env.example .env
# Then edit AUTH_SECRET — generate with: openssl rand -base64 32

# 3. Start Postgres
npm run db:up

# 4. Apply migrations
npm run db:migrate

# 5. Seed demo data (orgs, users, marketplace products)
npm run db:seed

# 6. Run the dev server
npm run dev
```

Open <http://localhost:3000> — you'll be redirected to your detected locale (`/fr`, `/en`, or `/zh`).

## Demo logins (after seeding)

Default password for all seeded accounts: `password123!`

| Email                              | Role · Sub-role  | Notes                       |
| ---------------------------------- | ---------------- | --------------------------- |
| `super@sourcingpick.dev`           | Admin · Super    | Full platform access        |
| `ops@sourcingpick.dev`             | Admin · Member   | Ops without super perms     |
| `senior-agent@sourcingpick.dev`    | Agent · Senior   | Supervises up to 15 reqs    |
| `agent@sourcingpick.dev`           | Agent            | Standard agent              |
| `owner@maison-lumiere.example`     | Client · Owner   | FR · Growth plan            |
| `owner@casabossa.example`          | Client · Owner   | BR · Starter plan           |
| `owner@tokyokura.example`          | Client · Owner   | JP · Pro plan               |
| `owner@textil-norte.example`       | Factory · Owner  | PT · KYC verified           |
| `owner@atlas-cuir.example`         | Factory · Owner  | MA · KYC verified           |
| `owner@saigon-stationery.example`  | Factory · Owner  | VN · KYC verified           |
| `owner@jaipur-cosmetics.example`   | Factory · Owner  | IN · KYC **pending**        |
| `owner@anadolu-metal.example`      | Factory · Owner  | TR · **flagged**            |

## Project layout

```
sourcingpick/
├── docs/                  # spec, ADRs, design decision docs
├── prisma/                # schema, migrations, seed
├── public/                # logo, favicon, static assets
├── src/
│   ├── app/               # App Router — all routes nested under [lang]/
│   │   ├── [lang]/(marketing)/  # public site (landing, pricing, legal)
│   │   ├── [lang]/(auth)/       # login, signup, OTP
│   │   ├── [lang]/(onboarding)/ # post-signup wizards
│   │   ├── [lang]/client/       # CLIENT role surface
│   │   ├── [lang]/factory/      # FACTORY role surface
│   │   ├── [lang]/agent/        # AGENT role surface
│   │   ├── [lang]/admin/        # ADMIN role surface
│   │   └── api/                 # Auth.js handler, webhooks, SSE
│   ├── components/        # framework-level primitives only
│   │   ├── ui/            # Button, Input, PinInput, Card, Dialog, ...
│   │   └── layout/        # LocaleSwitcher, future shells
│   ├── lib/
│   │   ├── auth/          # password, OTP, session, role guards
│   │   ├── db/            # Prisma client singleton (pg driver adapter)
│   │   ├── email/         # Nodemailer transport + React Email templates
│   │   ├── i18n/          # config, matcher, dictionaries, formatters, provider
│   │   ├── audit/         # writeAuditLog primitive
│   │   ├── permissions/   # guards (matrix encoded in Phase 1)
│   │   └── tokens.ts      # design tokens as TS constants
│   ├── styles/globals.css # Tailwind v4 entry + design tokens
│   └── types/             # module augmentations (Auth.js session shape)
├── proxy.ts               # locale detection (Next.js 16 renamed middleware → proxy)
├── prisma.config.ts       # Prisma 7 config (DATABASE_URL lives here, not in schema)
└── docker-compose.yml     # Postgres for dev
```

Feature-specific code (components, server actions) is colocated under each route using Next 16's `_components`, `_actions`, `_lib` private-folder convention.

## Useful commands

```bash
npm run dev              # dev server (Turbopack)
npm run build            # production build
npm run start            # serve a built app
npm run typecheck        # tsc --noEmit
npm run lint             # eslint
npm run lint:fix         # eslint --fix
npm run format           # prettier --write
npm run format:check     # prettier --check

npm run db:up            # start Postgres in Docker
npm run db:down          # stop Postgres
npm run db:logs          # tail Postgres logs
npm run db:generate      # regenerate Prisma client
npm run db:migrate       # prisma migrate dev (create + apply migration)
npm run db:reset         # ⚠ destructive — drop & recreate
npm run db:studio        # open Prisma Studio (data browser)
npm run db:seed          # run prisma/seed.ts

npm run email:dev        # preview React Email templates locally
```

## Architectural notes

A few decisions that diverge from defaults you might expect:

- **`proxy.ts`, not `middleware.ts`** — Next.js 16 renamed the file convention.
- **Prisma 7** stores the connection URL in [prisma.config.ts](prisma.config.ts), not in the schema's `datasource` block. The Prisma client uses the `@prisma/adapter-pg` driver adapter; see [src/lib/db/client.ts](src/lib/db/client.ts).
- **Money is integer cents** (`*Cents` fields), never `Decimal`. Matches Stripe API patterns and avoids floating-point math.
- **Public IDs are separate `reference` strings** (`REQ-XXXXXX`, `INV-YYYY-NNNN`, etc.). Internal IDs are cuid2 and never appear in URLs/emails/PDFs.
- **Auth.js sessions are JWT** (required when using the Credentials provider with Prisma). 2FA via email-OTP, code stored bcrypt-hashed with 10-min TTL and 5-attempt cap.
- **Realtime is SSE, not WebSockets** — host-portable (Vercel-compatible), polling fallback for clients that can't keep an SSE stream open.
- **Design tokens are split into raw palette + semantic layer** in [src/styles/globals.css](src/styles/globals.css). Components reference semantic names (`bg-action`, `text-fg`, `border-line`) so the Phase 6 dark theme is a one-block override, not a refactor.

## Documentation

- [docs/spec-v1.pdf](docs/spec-v1.pdf) — full product spec (FR)
- [docs/folder-structure.md](docs/folder-structure.md) — URL design and folder layout
- [docs/design-tokens.md](docs/design-tokens.md) — palette, typography, spacing, motion
- [docs/schema-design.md](docs/schema-design.md) — Prisma schema decisions
- [docs/payment-providers.md](docs/payment-providers.md) — Stripe vs Mangopay vs Lemonway vs Adyen
- [AGENTS.md](AGENTS.md) — instructions for AI coding assistants on this repo
