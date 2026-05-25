# Design tokens proposal — SourcingPick v1

**Status:** awaiting Caystone sign-off. Once approved, I'll write them into [src/styles/globals.css](../src/styles/globals.css) and [src/lib/tokens.ts](../src/lib/tokens.ts), and that becomes the visual law for the whole app.

## Source of truth

Both anchor colors come straight from [public/logo.svg](../public/logo.svg):

| Role          | Hex       | Source                              |
| ------------- | --------- | ----------------------------------- |
| Action blue   | `#155DFC` | SVG mark (geometric SP symbol)      |
| Deep navy     | `#162456` | SVG wordmark ("SourcingPick" text)  |

Everything else (the full palette, neutrals, semantic colors) is derived to harmonise with these two.

## Design principles applied

These tokens are shaped by the rules in `feedback_design_quality.md`:

- **No AI-slop** → restrained shadows, modest radii, no decorative gradients
- **B2B operational tool** → 14px UI base (not 16) so admin tables breathe; tight line heights on data
- **Mobile-first** → spacing and tap targets scale up at small viewports, not down
- **Dark-mode ready** → semantic tokens defined with both light/dark values from day one, even though we ship **light-only in v1**. Flipping the switch in Phase 6 will be a config change, not a refactor.

## Color palette

### Brand — derived from `#155DFC`

```
brand-50   #EFF4FF   subtle tinted surfaces
brand-100  #DCE6FF   selected backgrounds
brand-200  #B9CDFF   hover-emphasis on tints
brand-300  #8AABFF   disabled active states
brand-400  #5582FF   secondary actions
brand-500  #155DFC   ← ANCHOR, default action
brand-600  #0A48D6   action hover
brand-700  #0738AB   action active / pressed
brand-800  #0A2F86   strong emphasis text on light
brand-900  #0C2A6A   max emphasis
brand-950  #061846   on inverted surfaces
```

### Ink — derived from `#162456` (the wordmark navy)

Used for headlines on light surfaces, and as the foundation for the dark theme's surface color in Phase 6.

```
ink         #162456   ← ANCHOR, headline text
ink-deep    #0A1330   maximum-weight text (rare; almost-black)
```

### Neutral — slate-leaning gray (cool, harmonises with brand-blue)

```
neutral-0    #FFFFFF   page background
neutral-50   #F8FAFC   subtle surface
neutral-100  #F1F5F9   card/raised surface
neutral-200  #E2E8F0   border default, divider
neutral-300  #CBD5E1   border emphasis, input border
neutral-400  #94A3B8   muted text, placeholder
neutral-500  #64748B   secondary text
neutral-600  #475569   body text
neutral-700  #334155   strong body, table headers
neutral-800  #1E293B   high-emphasis text
neutral-900  #0F172A   absolute max contrast (rare)
```

### Semantic — restrained, single-shade hierarchy

```
success-bg    #DCFCE7    success-fg #166534    success-border #86EFAC
warning-bg    #FEF3C7    warning-fg #92400E    warning-border #FCD34D
danger-bg     #FEE2E2    danger-fg  #991B1B    danger-border  #FCA5A5
info-bg       brand-50   info-fg    brand-700  info-border    brand-200
```

Info reuses brand — one less color to coordinate, no risk of cyan-vs-blue confusion.

### Semantic tokens (the layer components actually consume)

Components reference these names, **not** raw palette values. This is what makes dark mode a flip-the-switch operation later.

```
--color-bg-page          neutral-0
--color-bg-subtle        neutral-50
--color-bg-raised        neutral-0       (with shadow-sm)
--color-bg-sunken        neutral-100
--color-bg-overlay       rgba(15, 23, 42, 0.40)

--color-text-primary     neutral-800
--color-text-secondary   neutral-600
--color-text-muted       neutral-500
--color-text-disabled    neutral-400
--color-text-inverse     neutral-0
--color-text-headline    ink             ← uses the wordmark navy
--color-text-link        brand-600
--color-text-link-hover  brand-700

--color-border-subtle    neutral-200
--color-border-default   neutral-300
--color-border-strong    neutral-400
--color-border-focus     brand-500

--color-action-bg        brand-500
--color-action-bg-hover  brand-600
--color-action-bg-active brand-700
--color-action-text      neutral-0

--color-action-ghost-bg-hover    brand-50
--color-action-ghost-text        brand-700
```

## Typography

Single family: **Geist Sans** for everything, **Geist Mono** for code, IBANs, references, and tabular numeric data.

### Scale (font-size / line-height)

```
text-xs     11 / 16    micro labels, captions, badges
text-sm     13 / 18    secondary UI text, table cells (dense)
text-base   14 / 20    ← DEFAULT body & UI text
text-md     16 / 24    long-form reading (marketing, terms)
text-lg     18 / 28    emphasised body, intro paragraphs
text-xl     20 / 28    small section headings (h4)
text-2xl    24 / 32    h3
text-3xl    30 / 36    h2
text-4xl    36 / 40    h1 (in-app)
text-5xl    48 / 56    marketing h1
text-6xl    60 / 64    marketing display
```

> **Why 14px base instead of 16?** This is a data-dense B2B platform — admin tables, agent queues, factory tender lists. 14px base keeps dashboards readable without pagination. Marketing content explicitly overrides to `text-md` (16) for comfortable reading.

### Weights

```
font-normal     400   body
font-medium     500   labels, table headers, small UI emphasis
font-semibold   600   buttons, h4-h6, navigation
font-bold       700   h1-h3 in-app, marketing display
```

No 800/900. Geist is sturdy enough at 700.

### Letter spacing

```
tracking-tight    -0.01em    display sizes (3xl+)
tracking-normal    0          body, UI
tracking-wide      0.04em     small uppercase labels (table headers, badges)
```

## Spacing

Standard 4px grid (Tailwind default). One addition at the fine end:

```
spacing-0.5  2px    hairline gaps in dense rows
spacing-1    4px    minimum padding
spacing-2    8px    icon-to-text gap, tight padding
spacing-3   12px    field padding, dense card padding
spacing-4   16px    standard padding, list gap
spacing-5   20px
spacing-6   24px    card padding (comfortable)
spacing-8   32px    section gap
spacing-10  40px
spacing-12  48px    page padding (desktop)
spacing-16  64px
spacing-20  80px    marketing block gap
spacing-24  96px    marketing section gap
```

## Radii

Deliberately small — your "no overly rounded corners" rule.

```
radius-none   0
radius-sm     3px    inputs, badges
radius-md     5px    buttons, tags
radius-lg     8px    cards, panels
radius-xl    12px    modals, large containers, feature cards
radius-full  9999px  avatars, pills, status dots
```

**No `2xl` / `3xl` radii.** Anything that wants to look "bigger" earns it through whitespace and weight, not corner radius.

## Shadows

Three levels, all neutral-tinted (slight blue undertone to harmonise with the brand), all flat by modern-UI standards.

```
shadow-xs    0 1px 2px rgba(15, 23, 42, 0.05)
shadow-sm    0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)
shadow-md    0 4px 12px rgba(15, 23, 42, 0.10), 0 2px 4px rgba(15, 23, 42, 0.04)
shadow-lg    0 12px 32px rgba(15, 23, 42, 0.14), 0 4px 8px rgba(15, 23, 42, 0.05)
```

No `xl` / `2xl` shadows. No coloured shadows. No inner shadows except for inputs (handled inline as `inset 0 1px 2px rgba(...)`).

Focus rings are NOT shadows — they're outlines for accessibility:

```
focus-ring  outline: 2px solid var(--color-border-focus);
            outline-offset: 2px;
```

## Motion

Tight, intentional. No spring physics, no parallax, no scroll-triggered showcase animations.

```
duration-fast   120ms   focus rings, hover state colour shifts
duration-base   200ms   menu open, toast in/out, button press
duration-slow   320ms   modal in/out, drawer open
duration-pageish 480ms   route transition (used sparingly)

ease-default     cubic-bezier(0.4, 0, 0.2, 1)    standard ease-out
ease-emphasize   cubic-bezier(0.2, 0, 0, 1)      entry animations (more snap)
ease-decelerate  cubic-bezier(0, 0, 0.2, 1)      exit animations
```

`prefers-reduced-motion` zeroes all durations — handled once at the CSS layer.

## Breakpoints

Mobile-first, default Tailwind, plus one for the densest admin tables.

```
sm    640px    larger phones, small tablets portrait
md    768px    tablets
lg   1024px    laptops, default desktop
xl   1280px    standard desktop
2xl  1536px    large desktop
3xl  1920px    admin operator stations
```

Designs are drafted at `sm` (393px iPhone-ish) and scaled up.

## Tap targets

44×44px minimum on touch (iOS HIG / Material guideline). Inputs target 40px on desktop, 44px on mobile.

## Z-index scale

Discrete steps so we never play whack-a-mole.

```
z-base       0
z-dropdown   10
z-sticky     20    sticky table headers, sticky nav
z-overlay    30    backdrop
z-modal      40
z-popover    50    tooltips, popovers above modals
z-toast      60    notifications, always on top
```

## What this proposal does NOT include

- A dark theme palette. Tokens are structured so adding it is a config change, but the values aren't drawn here. Phase 6.
- Component-level styles (buttons, inputs, etc.). Tokens come first; components consume them in step 7.
- Chart palette. Will derive from these in Phase 6 when dashboards land.
- Iconography sizing — handled at component level (typically `1em` for inline, fixed sizes for stat icons).

## Sign-off questions

1. **Two brand anchors** (`#155DFC` action blue, `#162456` headline navy) — confirm these are correct and shouldn't be tweaked before I derive everything from them.
2. **14px base UI font** — agree (data-dense), or push to 16?
3. **Radii floor of 3px / max 12px** — comfortable, or do you want them even tighter (e.g. 2 / 8)?
4. **Dark mode tokens in v1, ship light-only** — OK?
5. Anything you want to remove or add?
