# Landing v2 — design direction

**Status:** awaiting Caystone sign-off. Nothing in here is built yet.

**Reference:** [midddleman.com](https://midddleman.com/) — a China-sourcing procurement app for the
Nigerian / West African market. Adjacent problem space, very different brand posture.

**Decision already taken (2026-07-31):** borrow the **structure and motion only**. The palette stays
SourcingPick blue. Their cream / forest-green / acid-lime scheme is not adopted, so
[docs/design-tokens.md](design-tokens.md) keeps its two anchors (`#155DFC`, `#162456`) and everything
derived from them. This document only proposes amendments to the **radii**, **motion**, and
**typography** sections of that doc.

---

## 0. Build status — 2026-07-31

Sections 1–8 below are the original plan. It changed while being built, on your direction. What's
actually on the page now:

| Piece | State | Note |
| --- | --- | --- |
| Token amendments (§5.1, §5.2) | **Built** | radii `2xl`/`3xl`, `--font-display`, `--container-8xl`, `.reveal`, `.panel-stack-item`, `z-intro` |
| Below-fold animation bug (§5.2) | **Fixed** | `<Reveal>` now drives every below-fold section |
| Home intro overlay | **Built** | Not in the original plan — added on your request |
| Hero | **Built, diverged** | See below |
| Product panels (§4.3) | **Built** | Replaced `pillars.tsx`, which is deleted |
| How it works (§4.4) | **Built, diverged** | See below |
| Trust (§4.6) | **Deleted** | See below |
| Marquee (§4.2), bento (§4.5), FAQ preview (§4.7) | Not started | |
| Social proof (§6) | Still blocked | No real content — unchanged |

**Three deliberate departures from the plan above:**

1. **Hero** — §4.1 argued for keeping the right-hand "live platform" composition. It's gone, and so
   is the photographic version that briefly replaced it. The hero is now centred type on an inset,
   rounded `bg-subtle` card with a brand-tinted bloom, and the headline lockup carries it alone. Kept
   light rather than dark on three structural grounds: the next section is three fixed-dark panels
   and two dark blocks in a row merge; `ink-deep` (#0a1330) nearly matches the dark page background
   (#0b1220) so a dark card vanishes in dark mode; and the floating `bg-page/85` navbar pill reads as
   misplaced over a dark surface. It also preserves the dark-box-on-light emphasis, which is the
   distinctive half of the reference's lockup. The mock-UI idiom didn't disappear — it lives on in
   the product panels, where it has room to be legible.
2. **How it works** — §4.4 proposed a sticky-column sequence. It's a photographic bento instead: four
   steps, steps 1 and 4 on wide side-by-side cards, 2 and 3 stacked.
3. **Trust deleted, not merged.** §4.6 planned to keep and restyle it. It was first merged into How
   it works (each guarantee folded into the step it backs), then dropped outright. The copy in
   `marketing.trust.*` is now unused — including the cert-body pills (Bureau Veritas / AFNOR / SGS /
   LNE). Those keys are still in all four dictionaries, so nothing is lost if you want the roster
   back; say the word and it's a small addition to the How-it-works section.

**Q2 (display font) — RESOLVED 2026-08-01: keep Geist.** `--font-display` stays aliased to Geist.
The slot is real, so every marketing headline resolves to an actual family and a distinctive face
remains a one-line swap if that changes. The trade-off stands as written in §5.3: we have the
reference's layout with our own typographic voice, which was the decision.

**Before launch:** the four How-it-works step photos are hotlinked from the Unsplash CDN. Worth
pulling them into `/public` so a third-party origin isn't in the loading path. Less urgent now that
the hero is type-only — nothing above the fold depends on a remote image.

---

## 1. What we're taking, and what we're leaving

| Pattern | Verdict | Why |
| --- | --- | --- |
| Floating pill navbar | **Already have it** | [navbar.tsx](../src/components/marketing/navbar.tsx) already ships this, credited to the Kuiper / AIK reference. No work. |
| Hero highlight-box on a keyword | **Take** | Cheap, distinctive, turns a headline into a lockup. |
| Alternating full-bleed panels that stack on scroll | **Take** | The single biggest structural idea on that page. |
| Oversized horizontal marquee | **Take, once** | Good as a section *transition*. Used twice it becomes noise. |
| Bento grid of product surfaces | **Take** | We have real product UI to put in it. They do too — that's why theirs works. |
| Pill-tag cloud | **Take** | Perfect fit for our cert bodies + sourcing categories. |
| FAQ as a horizontal carousel | **Take, modified** | Carousel hides content from crawlers and keyboard users. See §4.7. |
| Grain / noise texture on illustration | **Leave** | Presupposes an illustration system we don't have and aren't commissioning. |
| Their palette + display font | **Leave** | Per the decision above. |
| App Store / Google Play buttons | **N/A** | We're a PWA, not a native app. Nothing to link. |
| Press-logo marquee, community stats, testimonials, podcast | **Blocked** | See §6 — we do not have the content, and inventing it is out. |

### The one structural idea

Their page reads as a **stack of full-bleed panels that slide over one another**, not as a scroll of
centred `max-w-6xl` sections. Our current landing is five stacked `max-w-6xl` blocks with the same
rhythm each time: eyebrow → h2 → grid. It's competent and completely flat — every section announces
itself identically, so nothing lands harder than anything else.

That's the thing worth stealing. Not the lime green.

---

## 2. Section map

| # | Today | v2 | Component |
| --- | --- | --- | --- |
| 1 | `Hero` | Hero + highlight-box headline, unchanged right-hand composition | `hero.tsx` *(edit)* |
| 2 | — | Marquee band | `marquee-band.tsx` *(new)* |
| 3 | `Pillars` (3-up grid) | Three stacking full-bleed panels | `product-panels.tsx` *(new, replaces)* |
| 4 | `HowItWorks` (4-up grid) | Sticky-column numbered sequence | `how-it-works.tsx` *(rewrite)* |
| 5 | — | Bento grid of real product surfaces | `product-bento.tsx` *(new)* |
| 6 | `Trust` | Trust, restyled + pill-tag cloud for cert bodies | `trust.tsx` *(edit)* |
| 7 | — | FAQ preview | `faq-preview.tsx` *(new)* |
| 8 | `CtaSection` | Unchanged structurally, inherits new radii | `cta-section.tsx` *(edit)* |
| 9 | `MarketingFooter` | Unchanged + `font-display` fix (§5.3) | `footer.tsx` *(edit)* |

Net: three components rewritten, four new, three touched. `pillars.tsx` is deleted — its three
entries become the three panels in §4.3, so no copy is lost.

---

## 3. Non-negotiable constraints

These are the things a design-direction doc for *this* repo has to respect, and which the reference
site never had to solve:

1. **Four locales, one of them RTL.** `fr` (default), `en`, `zh`, `ar` —
   [config.ts](../src/lib/i18n/config.ts). Every horizontal-motion pattern (marquee, carousel,
   slide-in) needs a direction-aware variant. Logical properties (`inset-s`, `ms-*`, `pe-*`) are
   already the house style; keyframes that hardcode `translateX(-100%)` are not.
2. **Dark mode shipped.** Every panel needs both values. The reference is light-only, so its
   "dark forest panel on cream page" trick has to become "surface panel that inverts sensibly" —
   `bg-ink-deep` is already the fixed-dark escape hatch used by
   [cta-section.tsx](../src/components/marketing/cta-section.tsx#L18-L20) for exactly this reason.
3. **`prefers-reduced-motion` is honoured globally** at
   [globals.css:632](../src/styles/globals.css#L632). Scroll-driven effects must degrade to a static
   layout, not to a broken one. A `position: sticky` stack degrades gracefully. A JS-driven
   scroll-scrubbed transform does not.
4. **Copy lives in dictionaries.** Every new string is four JSON edits. Budget for it — §4 marks
   which sections need new keys.
5. **No invented product details** — see §6.

---

## 4. Section-by-section

### 4.1 Hero

Keep the right-hand "live platform" composition. The comment at
[hero.tsx:26-27](../src/components/marketing/hero.tsx#L26-L27) makes the right call — real UI beats
"a vector man holding a box", and it's the one place we're better than the reference already.

One change: wrap a keyword in the headline in a filled rounded box, the way they do with
*"Source Goods"*.

```
Source internationally, without [ opaque middlemen ].
                                └─ bg-ink-deep, text-white, rounded-lg, px-3
```

Implementation note: the headline comes from `marketing.hero.title` as a single string, and the
emphasised span differs per locale — in Arabic and Chinese it won't be the last two words. So this
needs the dictionary split into `title.lead` / `title.emphasis` / `title.trail` (any of which may be
empty), **not** a `.split()` in the component.

**New keys:** `marketing.hero.title` becomes an object. ×4 locales.

### 4.2 Marquee band

A single full-bleed strip between hero and panels. Oversized text, low contrast, continuous
horizontal drift. It exists to break the page rhythm — content should be categories we actually
serve, not a slogan.

- CSS-only: duplicated track + `transform: translateX` loop, no JS.
- RTL: `[dir="rtl"] .marquee-track { animation-direction: reverse; }`.
- `aria-hidden` on the duplicate; the first copy stays readable to screen readers.
- Reduced motion: the global rule already collapses the duration, which parks it at frame 0. Fine —
  it reads as a static oversized strip.

**New keys:** `marketing.marquee.items` (array). ×4 locales.

### 4.3 Product panels — the core of the redesign

Replaces the `Pillars` 3-up grid. Three full-bleed panels — Sourcing, Marketplace, Certification —
each `position: sticky; top: 0`, so each one slides up and parks over the previous. The reference
shows the parked edges of earlier panels peeking out at the bottom; that's what makes it feel
physical rather than just "sections scrolling".

```
┌──────────────────────────────────────┐
│  Sourcing on demand                  │  ← parks, stays
│  [copy]              [real UI card]  │
└──────────────────────────────────────┘
 ┌─────────────────────────────────────┐ ← slides over, 8px inset
 │  Marketplace                        │
 └─────────────────────────────────────┘
  ┌────────────────────────────────────┐
  │  Certification programme           │
  └────────────────────────────────────┘
```

- Pure CSS `position: sticky` — **no scroll listener, no IntersectionObserver, no transform
  scrubbing.** This is the whole reason to prefer it: it costs nothing, never jank, and under
  reduced motion it degrades to three stacked panels, which is exactly the current design.
- Alternating surface: `bg-ink-deep` / `bg-subtle` / `bg-ink-deep`, so the dark ones are fixed-dark
  in both themes (same trick as the CTA banner).
- Each panel's right side gets a real UI composition in the hero's idiom, not an illustration.
- Requires `--radius-3xl` (§5.1).

**Copy:** reuses `marketing.pillars.*` verbatim. No new keys, but the key namespace should be
renamed `marketing.panels.*` for honesty.

### 4.4 How it works

Keep the four steps. Restyle from a 4-up grid to a sticky-left-column sequence: the section heading
pins while the four steps scroll past it. Same sticky primitive as §4.3 — no new machinery.

**Copy:** unchanged.

### 4.5 Product bento

Mixed-size cards, each carrying a real product surface. The reference's bento works because every
cell shows their actual app. We can match that — these routes all exist today:

| Cell | Surface | Route |
| --- | --- | --- |
| Large | Request wizard (3-step form) | `client/requests` |
| Large | Side-by-side quote compare | `client/quotes` |
| Wide | **Delivery calculator — live, embedded, actually usable** | `(marketing)/delivery-calculator` |
| Small | Escrow / milestone timeline | `client/orders` |
| Small | Marketplace catalogue | `(marketing)/marketplace` |

The delivery calculator cell is the one to lead with. The reference fakes interactivity with a
screenshot of a chat; ours can be the real component, inline on the landing page, no signup. That's
a straight win over the thing we're copying.

**Open question:** auctions (`client/auctions`, `(marketing)/auctions`) exist as routes but I don't
know if they're launch-ready or whether the 10–15% commission curve is settled. Left out of the
bento pending your call — see §8 Q4.

**New keys:** `marketing.bento.*` — ~5 title/body pairs. ×4 locales.

### 4.6 Trust

Structurally fine. Two changes:

- The four cert bodies (`Bureau Veritas`, `AFNOR`, `SGS`, `LNE`) become a pill-tag cloud in the
  reference's style rather than a bare wrapped text row.
- Extend the cloud with sourcing categories/capabilities, which is what makes their version look
  substantial rather than sparse.

**New keys:** category pills, if we add them. ×4 locales.

### 4.7 FAQ preview

The reference runs FAQs as a horizontal drag-carousel. **I'd modify this.** A carousel of Q&A is bad
for SEO (content off-screen and clipped), bad for keyboard users, and FAQ is exactly the content you
want crawled — it's what feeds rich results.

Proposal: take the *visual* treatment (large cards, generous type, soft tinted gradients) but lay it
out as a responsive grid of the top 4–6 questions, linking to the full
`src/app/[lang]/(marketing)/faq/page.tsx` page. Same visual weight, none of the cost.

Flagging it because it's the one place I'm deliberately not copying the reference — say the word if
you want the carousel as-is.

**Copy:** reuses existing FAQ dictionary entries.

---

## 5. Token amendments required

### 5.1 Radii — amends [design-tokens.md:187](design-tokens.md#L187)

That doc says, in bold: *"No `2xl` / `3xl` radii. Anything that wants to look 'bigger' earns it
through whitespace and weight, not corner radius."* The stacking panels and bento need bigger radii
to read correctly at full-bleed width — a 12px corner on a 1400px panel looks like a rendering
mistake.

```diff
  --radius-xl:   12px    modals, large containers, feature cards
+ --radius-2xl:  20px    bento cells, panel corners            (marketing only)
+ --radius-3xl:  28px    full-bleed stacking panels            (marketing only)
```

**Scoped to marketing surfaces.** The app UI — admin tables, agent queues, dashboards — stays capped
at 12px. The rule was written for a data-dense B2B tool and it's right for that; it just shouldn't
govern a full-bleed landing page. Worth writing that scoping into design-tokens.md explicitly rather
than leaving the contradiction.

### 5.2 Motion — amends [design-tokens.md:211](design-tokens.md#L211)

That doc says: *"No spring physics, no parallax, no scroll-triggered showcase animations."* Two of
those three survive intact. We need scroll-triggered reveals, and the sticky panels are technically
scroll-driven.

Proposed replacement rule:

> No spring physics. No parallax. No scroll-scrubbed transforms. Scroll-*triggered* reveals are
> allowed on marketing surfaces only, one-shot, never looping, never re-triggering.

**Also fixes a live bug.** `.animate-fade-up`
([globals.css:419](../src/styles/globals.css#L419)) is a plain CSS animation, so it fires the moment
the element renders — regardless of whether it's on screen. Everything below the fold on the current
landing page finishes its entrance animation before the user has scrolled to it. `Trust` and
`CtaSection` are animating to an empty viewport right now.

Fix: an IntersectionObserver-driven `.reveal` that adds the class on entry, with the pre-animation
state applied only when JS is available, so no-JS renders fully visible content.

New primitives, all reusing existing duration/easing tokens — no new easing curves, no new
durations:

| Utility | Purpose | Reduced-motion behaviour |
| --- | --- | --- |
| `.reveal` | Viewport-triggered `fade-up` | Renders visible, no animation |
| `.marquee-track` | Infinite horizontal drift | Parks at frame 0 (static strip) |
| `.panel-stack` | `position: sticky` wrapper | Degrades to normal stacked flow |

Per your rule that motion is part of the brand identity, these get defined once here and reused across every
surface — they are not landing-page one-offs.

### 5.3 Display font — the actual gap

[footer.tsx:80](../src/components/marketing/footer.tsx#L80) applies `font-display` to the giant
`SOURCINGPICK` wordmark. **`--font-display` is not defined anywhere.** Only `--font-sans` and
`--font-mono` exist ([globals.css:71-72](../src/styles/globals.css#L71-L72)), and
[layout.tsx:17-18](../src/app/[lang]/layout.tsx#L17-L18) loads only Geist + Geist Mono. So that class
is a no-op and the wordmark is currently rendering in Geist Black.

This matters more than any other single item in this document. The reference site's entire
personality comes from its chunky display face — remove it and swap in a neutral grotesque and most
of the character evaporates. If we take their structure and keep rendering headlines in Geist Bold,
we get their layout with none of their voice.

Three options, needs your call (§8 Q2):

1. **Add a display face** for h1/h2 on marketing only. Highest impact. Costs a font payload and a
   licensing decision.
2. **Keep Geist, push the weight** — Geist Black + tighter tracking at display sizes. Free, honest,
   noticeably less distinctive.
3. **Delete the dead class** and stop pretending. Free, and at least the code stops lying.

I'd take (1) for marketing surfaces only, app UI stays Geist. But it's a brand decision, not a
technical one, and it's the one thing here I don't think I should just pick.

---

## 6. Content we do not have

Roughly a third of the reference page is social proof:

> `14,000+ businesses` · `1,000+ African agents` · press logos (Google, Techpoint, Disrupt Africa,
> Technext…) · `3.34K` WhatsApp community · `8.1k` Learning Hub · named testimonials with dates and
> star ratings · `5,045` Spotify listeners

**None of this transfers.** Per your strict-spec rule I'm not inventing numbers,
logos, or testimonials, and placeholder social proof on a B2B procurement platform is worse than
none — buyers moving five figures through escrow will check.

Structurally these are the strongest sections on their page, so it's worth knowing what we'd need:

| Section | Needs |
| --- | --- |
| Press logos | Any real coverage. Even 2–3 works as a marquee. |
| Customer count | A number you're willing to stand behind publicly. |
| Testimonials | 2–3 real quotes, attributed, with permission. |
| Community stats | Only if a community actually exists. |

Until then those sections are **omitted, not stubbed**. Tell me what exists and I'll design them in
(§8 Q3).

---

## 7. Build order

Each step is independently shippable and reviewable.

1. **Token amendments** — radii, `.reveal` / `.marquee-track` / `.panel-stack`, display-font
   decision. Fixes the below-fold animation bug on its own.
2. **Hero highlight box** — small, visible, validates the direction cheaply.
3. **Product panels** — the core. Deletes `pillars.tsx`.
4. **Marquee band** — trivial once the primitive exists.
5. **Bento grid** — largest single piece; the delivery-calculator embed is the hard part.
6. **How-it-works sticky rewrite**, **Trust pill cloud**, **FAQ preview**.
7. **Dictionary backfill** — fr/en/zh/ar for every new key.
8. **RTL + dark + reduced-motion pass** across all of it. Not optional, not last-minute.

Steps 1–3 are enough to judge whether the direction works. I'd stop there for a look before
continuing.

---

## 8. Sign-off questions

1. **Radii scoping** — `2xl`/`3xl` for marketing only, app UI stays capped at 12px. Agreed, or keep
   the hard 12px ceiling everywhere and accept flatter panels?
2. **Display font** — §5.3. Add a display face for marketing headlines, push Geist Black, or drop
   the dead class? This is the highest-leverage decision in the document.
3. **Social proof** — do we have *any* real press mentions, customer numbers, or attributable
   testimonials? If yes I'll design those sections; if no they stay out.
4. **Auctions** — launch-ready enough to feature in the bento, or still internal?
5. **FAQ** — accept my grid instead of their carousel (§4.7), or do you want the carousel?
6. **Scope** — steps 1–3 then review, or build the whole thing before you look at it?
