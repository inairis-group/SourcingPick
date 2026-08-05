# Folder structure proposal — SourcingPick v1

**Status:** shipped, and since diverged. The tree below was the starting skeleton; the repo has grown past it. Useful for the conventions it states, not as an inventory.

## Principles

1. **One Next.js app, no monorepo.** Single build, all four roles + public site.
2. **`src/` directory** to keep the repo root for config only.
3. **i18n via subpath routing** — every route nests under `app/[lang]/...`. Per Next 16 docs.
4. **Route groups segment by purpose**: marketing, auth, app, admin. Each group can have its own root-ish layout so the public site and the SaaS shell never bleed into each other.
5. **Role-prefixed URLs** for authenticated areas (`/client/...`, `/factory/...`, `/agent/...`, `/admin/...`). Clean RBAC matching in `proxy.ts`, stable bookmarks, easy to reason about.
6. **Domain code colocated** inside route segments using Next 16's `_folder` private-folder convention (`_components`, `_actions`, `_lib`).
7. **Cross-cutting code lives in `src/lib/`** (db, auth, i18n, email, realtime, audit, permissions, validation, utils).
8. **Components in `src/components/`** are framework-level primitives only — anything domain-specific belongs inside its route segment.

## URL design

```
/                              → redirects to /<detected-locale>
/fr                            → public landing (French)
/en                            → public landing (English)
/zh                            → public landing (Chinese Simplified)
/fr/pricing
/fr/about
/fr/legal/terms
/fr/legal/privacy
/fr/legal/cookies
/fr/login
/fr/signup/client              → client signup flow
/fr/signup/factory             → factory signup flow
/fr/verify-otp                 → email-OTP entry (pin-input)
/fr/forgot-password
/fr/onboarding                 → post-signup onboarding wizard
/fr/client/dashboard           → CLIENT role
/fr/client/requests
/fr/client/requests/new
/fr/client/requests/[id]
/fr/client/marketplace
/fr/client/marketplace/[id]
/fr/client/orders
/fr/client/orders/[id]
/fr/client/invoices
/fr/client/certifications
/fr/client/settings
/fr/factory/dashboard          → FACTORY role
/fr/factory/tenders
/fr/factory/tenders/[id]
/fr/factory/orders
/fr/factory/orders/[id]
/fr/factory/catalogue
/fr/factory/payouts
/fr/factory/certification
/fr/factory/settings
/fr/agent/dashboard            → AGENT role
/fr/agent/requests
/fr/agent/requests/[id]
/fr/agent/quotes
/fr/agent/factories            → factory pool browser
/fr/agent/tasks
/fr/admin                      → ADMIN role (root = dashboard)
/fr/admin/requests             → all platform requests
/fr/admin/kyc                  → KYC review queue
/fr/admin/users
/fr/admin/organizations
/fr/admin/agents               → agent management + load
/fr/admin/marketplace          → product CRUD
/fr/admin/escrow               → escrow positions, releases, disputes
/fr/admin/payouts              → review + trigger
/fr/admin/finance              → invoices, exports, commissions
/fr/admin/webhooks             → webhook log + retry
/fr/admin/audit                → audit log viewer
/fr/admin/logins               → login analytics
/fr/admin/support              → user lookup + impersonation
/fr/admin/settings             → super-admin only (commissions, plans)
```

`/fr/` segment for all examples — same tree exists at `/en/` and `/zh/`.

## Tree

```
sourcingpick/
├── docs/                              # spec PDF, decision docs, this file
│   ├── spec-v1.pdf                    # (Caystone to drop in)
│   ├── payment-providers.md
│   └── folder-structure.md
├── prisma/
│   ├── schema.prisma                  # all 17 entities + enums
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── logo.svg                       # (Caystone to drop in)
│   ├── favicon.ico
│   └── opengraph-image.png
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # html/body shell, fonts, theme provider
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── stripe/webhook/route.ts        # (or chosen provider)
│   │   │   ├── carriers/webhook/route.ts
│   │   │   └── sse/[channel]/route.ts         # SSE endpoint
│   │   └── [lang]/
│   │       ├── layout.tsx             # locale, dict provider, cookie consent
│   │       ├── (marketing)/
│   │       │   ├── layout.tsx         # public navbar + footer
│   │       │   ├── page.tsx           # landing
│   │       │   ├── pricing/page.tsx
│   │       │   ├── about/page.tsx
│   │       │   ├── legal/
│   │       │   │   ├── terms/page.tsx
│   │       │   │   ├── privacy/page.tsx
│   │       │   │   └── cookies/page.tsx
│   │       │   └── _components/
│   │       │       ├── hero.tsx
│   │       │       ├── pillars.tsx
│   │       │       └── footer.tsx
│   │       ├── (auth)/
│   │       │   ├── layout.tsx         # minimal centered shell
│   │       │   ├── login/page.tsx
│   │       │   ├── signup/
│   │       │   │   ├── page.tsx       # picker: client vs factory
│   │       │   │   ├── client/page.tsx
│   │       │   │   └── factory/page.tsx
│   │       │   ├── verify-otp/page.tsx
│   │       │   ├── forgot-password/page.tsx
│   │       │   ├── reset-password/page.tsx
│   │       │   └── _actions/
│   │       │       └── auth.ts        # signup/login server actions
│   │       ├── (onboarding)/
│   │       │   ├── layout.tsx         # wizard shell
│   │       │   └── onboarding/
│   │       │       ├── page.tsx
│   │       │       ├── client/        # SIREN/VIES check, address
│   │       │       └── factory/       # KYC docs upload
│   │       ├── client/
│   │       │   ├── layout.tsx         # CLIENT app shell (sidebar, nav, role guard)
│   │       │   ├── dashboard/page.tsx
│   │       │   ├── requests/
│   │       │   │   ├── page.tsx
│   │       │   │   ├── new/page.tsx
│   │       │   │   ├── [id]/
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   └── _components/
│   │       │   │   └── _actions/
│   │       │   ├── marketplace/
│   │       │   ├── orders/
│   │       │   ├── invoices/
│   │       │   ├── certifications/
│   │       │   └── settings/
│   │       ├── factory/
│   │       │   ├── layout.tsx
│   │       │   ├── dashboard/page.tsx
│   │       │   ├── tenders/
│   │       │   ├── orders/
│   │       │   ├── catalogue/
│   │       │   ├── payouts/
│   │       │   ├── certification/
│   │       │   └── settings/
│   │       ├── agent/
│   │       │   ├── layout.tsx
│   │       │   ├── dashboard/page.tsx
│   │       │   ├── requests/
│   │       │   ├── quotes/
│   │       │   ├── factories/
│   │       │   └── tasks/
│   │       └── admin/
│   │           ├── layout.tsx         # admin shell (denser, more data-oriented)
│   │           ├── page.tsx           # admin dashboard
│   │           ├── requests/
│   │           ├── kyc/
│   │           ├── users/
│   │           ├── organizations/
│   │           ├── agents/
│   │           ├── marketplace/
│   │           ├── escrow/
│   │           ├── payouts/
│   │           ├── finance/
│   │           ├── webhooks/          # webhook log + retry
│   │           ├── audit/             # audit log viewer
│   │           ├── logins/            # login analytics
│   │           ├── support/           # user lookup, impersonation
│   │           └── settings/          # super-admin only
│   ├── components/
│   │   ├── ui/                        # base headless primitives (custom-styled)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── pin-input.tsx          # for email OTP
│   │   │   ├── select.tsx
│   │   │   ├── combobox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── file-upload.tsx
│   │   │   └── skeleton.tsx
│   │   ├── layout/
│   │   │   ├── app-shell.tsx          # generic auth-shell skeleton
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── locale-switcher.tsx
│   │   │   └── cookie-banner.tsx
│   │   ├── auth/
│   │   │   ├── auth-guard.tsx
│   │   │   └── otp-form.tsx
│   │   ├── forms/
│   │   │   ├── form.tsx               # form wrapper w/ useActionState
│   │   │   ├── field.tsx
│   │   │   └── form-error.tsx
│   │   └── data/
│   │       ├── data-table.tsx
│   │       ├── pagination.tsx
│   │       ├── empty-state.tsx
│   │       └── stat-card.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts              # Prisma client singleton
│   │   │   └── transactions.ts        # helpers for tx patterns
│   │   ├── auth/
│   │   │   ├── config.ts              # Auth.js config
│   │   │   ├── session.ts             # getSession() helper
│   │   │   ├── otp.ts                 # OTP generation/validation
│   │   │   └── password.ts            # bcrypt wrapper
│   │   ├── permissions/
│   │   │   ├── matrix.ts              # spec §2.2 encoded as a typed matrix
│   │   │   ├── check.ts               # can(user, action, target) function
│   │   │   └── guards.ts              # requireRole(), requireOwnership()
│   │   ├── i18n/
│   │   │   ├── config.ts              # locales, default, detection priority
│   │   │   ├── dictionaries/
│   │   │   │   ├── fr.json
│   │   │   │   ├── en.json
│   │   │   │   └── zh.json
│   │   │   ├── get-dictionary.ts      # server-only dictionary loader
│   │   │   ├── client-provider.tsx    # React context for client comps
│   │   │   └── formatters.ts          # number/currency/date helpers per locale
│   │   ├── email/
│   │   │   ├── transport.ts           # Nodemailer transport
│   │   │   ├── send.ts                # typed send() with template registry
│   │   │   └── templates/             # React Email templates
│   │   │       ├── otp.tsx
│   │   │       ├── welcome.tsx
│   │   │       └── invoice.tsx
│   │   ├── realtime/
│   │   │   ├── sse.ts                 # SSE channel manager (in-memory + LISTEN/NOTIFY)
│   │   │   └── client.ts              # browser-side SSE client w/ polling fallback
│   │   ├── audit/
│   │   │   └── log.ts                 # writeAuditLog(actor, action, target, payload, level)
│   │   ├── validation/
│   │   │   └── schemas/               # Zod schemas grouped by domain
│   │   │       ├── auth.ts
│   │   │       ├── request.ts
│   │   │       └── ...
│   │   ├── currency.ts                # cents-based money helpers (no FP math)
│   │   ├── dates.ts                   # date helpers, business-day math
│   │   ├── tokens.ts                  # design tokens as TS const (palette, spacing, etc.)
│   │   └── utils.ts                   # cn(), invariant(), etc.
│   └── styles/
│       └── globals.css                # Tailwind v4 entry + design tokens as CSS vars
├── proxy.ts                           # locale detection + role-based route guards
├── instrumentation.ts                 # OTel hook (placeholder)
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── package.json
├── docker-compose.yml                 # Postgres for dev (lift-and-shift to Neon later)
├── .env.example
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## How the pieces fit together

- **`proxy.ts`** does two jobs: (a) locale detection + redirect to `/[lang]/...` if absent; (b) optimistic auth-cookie check for protected paths (full role enforcement happens in layouts/actions per Next docs' guidance — don't rely on proxy for authz). Per-role URL prefixes make this clean: `if pathname starts with /admin → require role === ADMIN`.
- **Role-based layouts** (`client/layout.tsx`, etc.) call a server-side `requireRole(...)` that hits the DB session and either renders the shell or redirects to login / 403.
- **i18n dictionaries** loaded server-side in `[lang]/layout.tsx`, passed down via React context to client components that need translation strings. Server components use `getDictionary(lang)` directly.
- **Permissions matrix** in `src/lib/permissions/matrix.ts` mirrors spec §2.2 exactly. Every Server Action calls `can(session, "action", target)` as its first line — UI hiding is a courtesy, the server is the gate.
- **Realtime**: SSE endpoint at `/api/sse/[channel]` streams events; channels are scoped (`thread:<id>`, `user:<id>:notifications`). Fan-out via Postgres LISTEN/NOTIFY so we don't need Redis in v1. Client connects with auto-reconnect + polling fallback.
- **Domain code** stays close to its routes via `_components`, `_actions`, `_lib` colocated folders, so a feature's surface is browsable in one place. Cross-cutting only goes to `src/lib/` or `src/components/`.

## Things I'm explicitly NOT doing in v1

- No monorepo, no shared packages, no Turborepo.
- No separate API project — Server Actions + Route Handlers cover it.
- No Storybook (consider in Phase 6 if the component library grows enough to warrant).
- No `src/features/<feature>/` separate from routes — colocation is simpler for a single-app project.
- No GraphQL.
- No tRPC (Server Actions cover the same ground type-safely).

## Open questions before I create the skeleton

1. Approve **role-prefixed URLs** (Option A above)? Alternative is a unified `/dashboard` with role-aware content.
2. Approve **`src/`**? (vs everything at root)
3. Approve the **`/admin/...` URL structure** as the substance surface — does it cover the operations you want, or should I add a section?
4. Any URL slug you'd rather change (`/tenders` vs `/appels-d-offres`, `/dashboard` vs `/accueil`, etc.)? My instinct: keep URL segments in **English** for stability across locales; only the rendered content translates.
