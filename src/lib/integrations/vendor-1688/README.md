# 1688 integration — removable stub

Proxies the 1688 wholesale catalogue into SourcingPick, applies a markup, and
keeps a record of orders placed through it.

## Status

**Not live.** There is no data feed yet. Everything runs against
`fixture-provider.ts`, which serves three sample listings and refuses to submit
orders. `getVendor1688Provider()` is the seam where a real client goes.

## Why there's no feed

The official 1688 Open Platform gates product search/detail/trade behind
partner approval and effectively a Chinese business entity. The practical route
is a reseller — OTAPI, Onebound, Sprwork — which resells access over REST for a
subscription plus per-call fees, with no Chinese entity required.

Scraping is deliberately not implemented: 1688 runs aggressive anti-bot, it
breaks constantly, and it is against their terms.

## Design decisions

**Nothing from the catalogue is stored.** Listings are proxied live. There is
no cache table, so prices can't go stale and we hold no copy of their data. The
cost is a provider call per search.

**Orders are stored, and snapshot the offer.** Because the catalogue isn't
cached, `Vendor1688Order.offerSnapshot` is the only surviving record of what a
buyer bought at what price. It must stay self-contained.

**No foreign keys into core models.** `clientOrgId` and `placedByUserId` are
plain strings. This costs referential integrity and buys excisability: a
relation would add back-reference fields to `Organization` and `User`, so
removal would mean editing core models rather than dropping two tables.

**Markup is stored as both rate and amount.** Rate alone would silently restate
historical orders when it changes; amount alone would make them unauditable.

**The stub never fakes success.** `submitOrder` returns
`provider_not_configured` rather than a plausible order id. A stub that appears
to work would let a buyer believe an order had been placed.

## Configuration

| Variable | Meaning |
| --- | --- |
| `VENDOR_1688_ENABLED` | `true` turns the feature on. Absent/anything else = off. |
| `VENDOR_1688_MARKUP_BPS` | Markup in basis points. Defaults to `1500` (15%). |

## Adding a real provider

1. Write `<name>-provider.ts` implementing `Vendor1688Provider`.
2. Return it from `getVendor1688Provider()` when its key is present.
3. Nothing else changes — no caller imports a provider directly.

## Removing the integration

1. Delete `src/lib/integrations/vendor-1688/`.
2. Delete any route under `app/**` that imports from it (grep `vendor-1688`).
3. Drop `Vendor1688Order` and `Vendor1688OrderStatus` from
   `prisma/schema.prisma`, then migrate.
4. Remove the two env vars.

No core model, shared component or existing route references it, so there is
nothing else to unpick.
