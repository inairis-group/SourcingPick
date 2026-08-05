# Auctions — state of play and plan

**Status:** built, unreviewed, and **cannot complete in production**. Written
2026-08-05 after auditing the code against the database and the live server.

The earlier note that auctions were "planned, not built" was wrong. Schema,
server actions, settlement engine, the commission curve and four UI surfaces
all exist. What does not exist is the thing that makes an auction an auction:
**nothing ends them.**

---

## What is already built

| Piece | Where |
| --- | --- |
| `Auction`, `Bid`, `AuctionStatus`, `BidStatus` | `prisma/schema.prisma` |
| Reserve, buy-now, starting bid, quantity, MOQ, lead time, incoterm | `Auction` |
| Create / submit / moderate | `lib/auctions/actions.ts` |
| Bid placement, €1 minimum increment, outbid transition + notification | `lib/auctions/bid-actions.ts` |
| Settlement + order materialisation (idempotent on `materializedOrderId`) | `lib/auctions/settle.ts` |
| Commission curve 10 / 12 / 14 / 15 % with tests | `lib/pricing/auctions.ts`, `tests/auction-pricing.test.ts` |
| Factory, admin, client and public surfaces | `app/[lang]/{factory,admin,client,(marketing)}/auctions/` |
| Settlement cron endpoint | `app/api/cron/auctions-settle/route.ts` |

Bidding is race-protected: the highest bid is re-read inside the transaction,
which is sufficient at Read Committed for the contention shape auctions have.

---

## The blocker: settlement never runs

`/api/cron/auctions-settle` exists and is correct. Nothing calls it.

1. **`vercel.json` declares the crons** — but production is **nginx + PM2 on a
   VPS** (`srv1104436`), where Vercel's scheduler does not exist. The file is
   inert.
2. **`auctions-settle` is not even in `vercel.json`** — only
   `marketplace-expire-flash-sales` and `shipments-reminders` are. So it would
   not fire even on Vercel.
3. **`CRON_SECRET` is not set in the production `.env`** — so every cron route
   answers `503` regardless of who calls it.
4. No system crontab entry and no systemd timer on the box.

The consequence: an auction reaches `endsAt` and stays `ACTIVE` forever. The
winner is never chosen, the order is never materialised, the factory is never
told. Flash sales never expire and shipment reminders never send either — same
root cause, wider blast radius.

**This is the only thing standing between auctions and working.** Everything
downstream of settlement is already implemented and idempotent.

### Fix

```
# /etc/cron.d/sourcingpick
*/5 * * * * root curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://sourcingpick.com/api/cron/auctions-settle
0   * * * * root curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://sourcingpick.com/api/cron/marketplace-expire-flash-sales
0 */6 * * * root curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://sourcingpick.com/api/cron/shipments-reminders
```

Five minutes is the right cadence for settlement: it bounds how long a winner
waits, and the endpoint is idempotent so an overlapping run is harmless. Set
`CRON_SECRET` first or every call 503s.

---

## Phase 1 — Make auctions finish · blocks everything else

1. Set `CRON_SECRET` in the production `.env`.
2. Install the cron entries above.
3. Add `auctions-settle` to `vercel.json` too, so a future move to Vercel
   doesn't silently regress it.
4. Verify end to end on a real auction with a 10-minute window: bid, wait,
   confirm `SOLD` + `materializedOrderId` + both notifications.

Nothing below is worth doing until an auction can complete.

## Phase 2 — The gaps bidders will notice first

- **No anti-sniping.** A bid one second before `endsAt` wins with no chance to
  respond. Standard remedy: if a bid lands within the last N minutes, push
  `endsAt` out by N. Needs a decision on N (2 or 5 minutes) and a hard cap so
  an auction can't be extended indefinitely.
- **Flat €1 minimum increment** (`MIN_INCREMENT_CENTS = 100`). Fine at €50,
  meaningless at €50,000 — a bidder can win a €40k lot by a euro. Should scale
  with the current price, in bands like the commission curve.
- **No proxy bidding.** Bidders must watch the clock rather than set a maximum.
  This is the single biggest driver of final price in real auction platforms,
  and its absence is felt as "the site made me sit there".
- **Outbid notification only.** No "auction ending soon" and no "you won" to
  watchers. There is no watch/follow concept at all.

## Phase 3 — Commercial correctness

- **The commission curve is interim.** `tests/auction-pricing.test.ts` records
  it as *"Partner-supplied curve (interim, 2026-06-02)"* — 10 % ≤ €10k,
  12 % ≤ €50k, 14 % ≤ €100k, 15 % above. It has never been locked the way
  `docs/pricing-v2.md` locks the sourcing and marketplace splits. **Lock it or
  change it before a real auction settles**, because the rate is charged at
  settlement and arguing about it afterwards is arguing about someone's money.
- **No buyer-side deposit at bid time.** Anyone can bid without commitment, so
  a non-paying winner costs the factory the whole auction window. Consider a
  card hold or a credit requirement above a threshold.
- **Reserve is invisible.** Buyers cannot see that a reserve exists, only that
  they lost. "Reserve not met" should be shown while bidding.

## Phase 4 — Operational

- Auction detail page has no live updating — a bidder must reload to see
  they've been outbid. The public-chat inbox now has a working poll-and-pause
  pattern that transfers directly.
- No admin view of a running auction's bid history for dispute handling.
- Cancellation policy after bids exist is undefined: `CANCELLED` is in the
  enum, but nothing says what happens to bidders.

---

## Order of work

Phase 1 alone, first, and verify it. It is the difference between a feature
that exists and one that works. Phases 2 and 3 are independent of each other;
Phase 3's commission lock should happen before the first real settlement
regardless of where it sits in the queue.
