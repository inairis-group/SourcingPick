# Expéditeur Sourcing Pick — phased plan

Spec: *Documentation officielle – Rôle Expéditeur Sourcing Pick (version finale validée)*.

Decisions already taken with Caystone (2026-07-31):

- **Language** — shipper accounts default to Mandarin, locale switcher stays available.
- **Client visibility** — physical-progress statuses auto-relay under SourcingPick branding;
  quote steps, incidents and cancellations wait for a human. Encoded in
  [status.ts](../src/lib/shipments/status.ts).
- **Scope** — foundation first, automation after.

---

## Already built

| Piece | Where |
| --- | --- |
| `Role.SHIPPER`, `OrgType.SHIPPER`, `ShipmentStatus` (10), 3 notification types | migration `20260731132822` |
| `Shipment` / `ShipmentItem` / `ShipmentQuote` / `ShipmentEvent` | `prisma/schema.prisma` |
| Role plumbing — redirects, nav, notification deep links, admin tone maps | various |
| Shipper list + detail (quote submit/revise, status updates, history) | `app/[lang]/shipper/` |
| Internal queue + hand-off form | `app/[lang]/admin/shipments/` |
| `SHP` reference prefix | `lib/sourcing/reference.ts` |
| fr/en/zh/ar copy for the whole surface | `lib/i18n/dictionaries/` |

Verified by build, typecheck, lint and `check-use-server`. **Not** verified against real data —
which is exactly what Phase 1 unblocks.

---

## Phase 1 — Provisioning · **DONE 2026-07-31**

Nothing can create a shipper account today. There is no admin UI to create an `Organization` or a
`User` anywhere in the app — `prisma/seed.ts` is the only path, and it early-returns when a
`PLATFORM` org already exists, so it can't help an existing database either.

Until this lands, `/admin/shipments/new` shows its "no shipper registered" empty state forever and
the role cannot be exercised end to end.

1. **Admin — create shipper partner.** Org (`type: SHIPPER`) plus its first `SHIPPER` user, in one
   form. Password set by the admin and flagged for rotation; no self-signup, because §1.2 makes
   these vetted partners rather than open registrations.
2. **Seed fixtures** — one shipper org + user for fresh `db:reset` runs.
3. **Verify end to end** — done against the live dev database:
   `SHP-71108` handed to 联运物流 Lianyun from `ORD-40390`, two items, opening event
   `QUOTE_REQUESTED(clientVisible=false)`. Login: `shipper@sourcingpick.dev` / `password123!`.

Also fixed while wiring the login path (both found by inspection, not by the spec):

- `/shipper` was missing from `PROTECTED_PREFIXES` in `proxy.ts`.
- `app/[lang]/(onboarding)/onboarding/page.tsx` ends in a catch-all
  `redirect(/onboarding/factory)`, so any unmatched role — including SHIPPER — was sent into the
  **factory** wizard. Handled explicitly now, like ADMIN.

## Phase 2 — Close the §2 data gaps · **PARTIAL — invoice done, item images NOT done**

`AttachmentContext.SHIPMENT_INVOICE` and `SHIPMENT_ITEM_IMAGE` added (migration
`20260731154018`), served by `attachShipmentDocuments`. Reuses the existing `storeAttachments`
pipeline rather than a bespoke column.

Upload is a separate step from `createShipmentForOrder` on purpose: files can't round-trip through
a validation-and-retry path, so a rejected brief would silently discard whatever the admin had
picked.

**§2.1.1 product images are still not implemented.** `AttachmentContext.SHIPMENT_ITEM_IMAGE` exists
and `canManage` covers it, but nothing writes to it: `attachShipmentDocuments` only reads the
`invoice` field, and `ShipmentItem.imageUrl` is read by the queries and rendered on the shipper's
detail page while never being set. Every item therefore shows the grey placeholder. Marking this
phase DONE was wrong.

Remaining work: accept per-item files on the hand-off form (or the admin detail page), store them
under `SHIPMENT_ITEM_IMAGE`, and write the resulting path back to `ShipmentItem.imageUrl`.

`canManage` in `lib/attachments/actions.ts` is exhaustive over `AttachmentContext`, so the two new
values broke it — resolved deliberately rather than by a fallthrough: shipment documents are part of
the §2 brief the shipper quotes against, so neither shipper nor agent may prune them. Only ADMIN and
the original uploader can.

## Phase 3 — Client relay (§7.1) · **DONE 2026-07-31**

`getClientVisibleShipmentEvents` + `ClientShipmentProgress`, rendered on the buyer's order page
above the existing `OrderTimeline` (left untouched — it is driven by `OrderStatus` and used
elsewhere). The query selects no shipper identity, no quote and no price, and is scoped by
`clientOrgId`. Renders nothing when an order has no shipper leg.

Verified against live data: with events `QUOTE_REQUESTED`, `PREPARATION` and `INCIDENT` on one
shipment, the client-facing query returns **only `PREPARATION`**.

## Phase 4 — Automation · **DONE 2026-07-31**

1. **§3.2 auto-reprice** — `Shipment.quoteStale` plus `reviseShipmentBrief`, which is the only way
   to edit the five fields §3.2 names. Editing them flips the flag, logs an event, and notifies the
   shipper; submitting a fresh quote clears it. The shipper sees the obligation stated above the
   quote form, the internal queue shows a badge.
2. **§5 24h SLA** — `isReportOverdue` + `SHIPMENT_AWAITING_SHIPPER`, shared by the queue badge and
   the cron so "pending action" means one thing. Measured from the **last event**, not creation: the
   duty is to report within 24h of the event, so a shipment updated an hour ago is compliant however
   old it is.
3. **§6.3 repeating reminders** — `/api/cron/shipments-reminders`, every 6h in `vercel.json`.
   Deliberately keeps no reminded-once flag: §6.3 says reminders repeat until the status resolves,
   so cadence comes from the cron schedule rather than per-row state.

Verified live: overdue true at 30h/48h on shipper-pending statuses, false at 2h, and false for
`IN_TRANSIT`/`DELIVERED` however old. `quoteStale` set/clear round-trips on `SHP-71108`.

## Phase 5 — Operational polish · **mostly DONE 2026-07-31**

- **Admin shipment detail** · DONE — `/admin/shipments/[id]`, linked from the queue. Shows what the
  shipper cannot see: their identity, the quoted prices, and **every** event including internal-only
  ones, since this is what the team decides from when relaying. Carries the two forms that had no UI
  until now (`reviseShipmentBrief`, `attachShipmentDocuments`) — both were callable but unreachable.
- **Shipper settings** · DONE — renders the shared `SettingsView`, same as every other role. The
  earlier reasoning ("no shipper-specific config, so a redirect is honest") was wrong: that shared
  surface carries profile, password and **locale**, and locale matters more here than anywhere else,
  since accounts are created in Mandarin (§1.3) and the language is switchable by decision. This is
  where a partner changes it.
- ~~§1.2 messaging~~ · **DONE 2026-07-31 — this was a real breach, not a theoretical one.**

  Two open paths existed:

  1. `openOrCreateDirectThreadAction` took a raw `otherUserId` and checked only that the user existed
     and wasn't deleted. **No role-pair check**, so a shipper and a client could open a DIRECT thread
     with each other.
  2. `getOrCreateThread` always adds the joining user to a context thread, even when the participant
     resolver didn't return them — so a shipper opening an ORDER or REQUEST thread would have landed
     in the buyer's conversation.

  Both now refuse. Verified live: shipper↔client blocked both directions, shipper↔admin still
  allowed, and an audit of existing threads found **0** that already pair a shipper with a client.

---

## Order of work

Phase 1 first and alone — it is the only item that blocks the others, and it converts every later
phase from "believed correct" to "observed working". Phases 2 and 3 are independent of each other.
Phase 4 should not start until a real shipment has moved through the full lifecycle at least once.
