#!/usr/bin/env python3
"""Port the approved 2026-09 canvas into the app, artboard by artboard.

Why a generator rather than hand-written components: the canvas exports every
page as HTML with the design's own paddings, radii and hexes inline. Retyping
that by hand is where a redesign turns into an interpretation of a redesign.
Transcribing it cannot drift, and when Adam moves a section we re-run this
instead of hunting for the twelve places it was paraphrased.

Structure comes from the French artboard. The other three locales are the same
document with different strings, which the script proves before it trusts it:
identical tag-and-attribute signatures means the translated strings can be
zipped by position. Each page therefore compiles to one component plus one
table of four string arrays.

Usage:  python3 scripts/design/port.py [page ...]
"""

from __future__ import annotations

import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dcparse import (
    Element,
    L10N_ATTRS,
    find,
    kids,
    parse,
    signature,
    slots,
    text_of,
)
from emit import (
    Emitter,
    css_prop,
    fluid_image,
    needs_content_box,
    responsive,
    split_decls,
)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CANVAS = os.environ.get(
    "SP_CANVAS",
    "/tmp/claude-1000/-home-caystone-dev-jobs-inairis-sourcingpick"
    "/95253e99-b7de-417f-8083-0e8caea5e861/scratchpad/artifact-files"
    "/3c9d3e95-ec5b-48a3-91f1-38be3d6748fb/project",
)
ASSETS = json.load(open(os.path.join(os.path.dirname(__file__), "asset-map.json")))

# The canvas ships twelve. French is its base layer and the one the porter
# reads structure from; the rest follow it.
LOCALES = (
    "fr", "en", "zh", "es", "de", "it", "pt", "nl", "ar", "ru", "tr", "pl",
)

class Page:
    """One artboard and where it lands.

    `key` is the module name (the artboard stem is not always an identifier —
    "404" and "A-propos" are not). `route` is the path under /[lang]; None
    means the page is mounted by hand, as the 404 board is.
    """

    def __init__(self, stem: str, comp: str, key: str, board: str, route: str | None):
        self.stem, self.comp, self.key, self.board, self.route = (
            stem, comp, key, board, route
        )


PAGES = {
    p.stem: p
    for p in [
        Page("Accueil", "HomeBoard", "home", "Main.dc.html", ""),
        Page("Services", "ServicesBoard", "services", "Site-Services.dc.html", "services"),
        Page("Comment-ca-marche", "HowItWorksBoard", "howItWorks",
             "Site-Comment-ca-marche.dc.html", "comment-ca-marche"),
        Page("Entrepot", "WarehouseBoard", "warehouse", "Site-Entrepot.dc.html", "entrepot"),
        # The canvas calls it Tarifs; the route has been /pricing since launch
        # and is linked from outside the site, so the route keeps its name.
        Page("Tarifs", "PricingBoard", "pricing", "Site-Tarifs.dc.html", "pricing"),
        Page("FAQ", "FaqBoard", "faq", "Site-FAQ.dc.html", "faq"),
        Page("Devis", "QuoteBoard", "quote", "Site-Devis.dc.html", "devis"),
        Page("Contact", "ContactBoard", "contact", "Site-Contact.dc.html", "contact"),
        Page("A-propos", "AboutBoard", "about", "Site-A-propos.dc.html", "about"),
        Page("Application", "AppBoard", "app", "Site-Application.dc.html", "application"),
        Page("Mentions-legales", "LegalBoard", "legal", "Site-Mentions-legales.dc.html",
             "legal/mentions-legales"),
        Page("Confidentialite", "PrivacyBoard", "privacy", "Site-Confidentialite.dc.html",
             "legal/privacy"),
        Page("404", "NotFoundBoard", "notFound", "Site-404.dc.html", None),
    ]
}


def locale_file(stem: str, locale: str) -> str:
    """The artboard for one page in one locale.

    French is the canvas's base layer and does not carry a prefix; the home
    page is additionally named `Main` there rather than `Accueil`.
    """
    if locale == "fr":
        return PAGES[stem].board
    return f"{locale}-{stem}.dc.html"


# --- routes ------------------------------------------------------------------

# The canvas wires every link to "#" — it is a picture, not a site. Anchors are
# matched on their French text, which is stable because structure is read from
# the French artboard only. An unmapped anchor raises rather than silently
# shipping a dead link, which is how the first pass ended up with a 404 on the
# hero's primary call to action.
ROUTES: dict[str, str] = {
    "Demander un devis": "/devis",
    "Demander un devis logistique": "/devis",
    "Décrire mon besoin": "/devis",
    "Services": "/services",
    "Comment ça marche": "/comment-ca-marche",
    "Entrepôt": "/entrepot",
    "Notre entrepôt": "/entrepot",
    "Tarifs": "/pricing",
    "Voir la grille de prix": "/pricing",
    "FAQ": "/faq",
    "À propos": "/about",
    "Contact": "/contact",
    "Application": "/application",
    "Sourcing": "/services",
    "Espace client": "/login",
    "Mentions légales": "/legal/mentions-legales",
    "Confidentialité": "/legal/privacy",
    "Politique de confidentialité": "/legal/privacy",
    "politique de confidentialité": "/legal/privacy",
    "Cookies": "/legal/cookies",
    "politique de cookies": "/legal/cookies",
    "Conditions générales": "/legal/terms",
    "Réception": "/services",
    "Vérification": "/services",
    "Consolidation": "/services",
    "Renforcement bois": "/services",
    "Chargement": "/services",
    "Expédition maritime": "/services",
    "Retour à l’accueil": "/",
    "Transparence": "/#verite",
    "Bientôt surApp Store": "/application",
    "Bientôt surGoogle Play": "/application",
}

# Fragments that name a section of the home page. The header carries one of
# these and the header is shared, so they have to resolve absolutely or they
# scroll nowhere from /faq.
HOME_FRAGMENTS = {"#verite", "#etapes"}


def fragment(frag: str):
    if frag in HOME_FRAGMENTS:
        return "{`/${lang}" + frag + "`}", True
    return json.dumps(frag), False


# Anchors that stay on the page they are drawn on.
IN_PAGE = {
    "Voir les 6 étapes": "#etapes",
    "En savoir plus": "#etapes",
    "Général": "#faq-general",
    "Logistique": "#faq-logistique",
    "Contrôle": "#faq-controle",
    "Paiement": "#faq-paiement",
}

# Anchors the canvas draws as links but which submit a form once the page is
# real. They keep the design's appearance and gain a type.
SUBMITS = {"Envoyer", "Envoyer ma demande"}


# Structure is read from one artboard per shape, and for the Turkish shape that
# artboard is Turkish — so its anchors say "Teklif isteyin", not "Demander un
# devis". Routes are therefore carried across by *position*: the nth anchor of a
# page is the nth anchor in every language. Position rather than text, because
# text is ambiguous — in English the FAQ's "Contrôle" tab and the footer's
# "Vérification" link both read "Inspection" and go to different places.


def anchors(nodes: list[Element]) -> list[Element]:
    out: list[Element] = []

    def walk(n):
        if isinstance(n, str):
            return
        if n.tag == "a":
            out.append(n)
        for c in n.children:
            walk(c)

    for n in nodes:
        walk(n)
    return out


def french_route(node: Element, label: str, raw: str) -> str | None:
    """Where a French anchor points, or None when we do not emit it as a link."""
    if node.attr("lang"):
        # One of the twelve language links along the foot of the page. Our own
        # LocaleRow stands in for the whole strip, so these are never emitted.
        return None
    if raw.startswith("mailto:") or raw.startswith("http"):
        return raw
    if not label:
        return "@home"  # the wordmark, the only anchor with no text
    if label in IN_PAGE:
        return IN_PAGE[label]
    if raw.startswith("#") and raw != "#":
        return raw
    if label in SUBMITS:
        return None
    if label in ROUTES:
        return ROUTES[label]
    raise SystemExit(f"unmapped link: {label!r} (href={raw!r})")


def page_routes(stem: str) -> list[str | None]:
    """One destination per anchor of the page, in document order.

    Read from French and checked against every other language: a mismatch in
    link count would mean the positions no longer correspond, and silently
    shifting them is how a footer ends up linking to the wrong page.
    """
    whole_fr = _whole(stem, "fr")
    fr = anchors(whole_fr)
    routes = [french_route(a, text_of(a), a.attr("href") or "") for a in fr]

    # The category chips are a table of contents for this page, not navigation.
    # Resolved by text they went badly wrong: "Sourcing" and "App" matched the
    # site-wide route map and took the reader off the FAQ entirely.
    chips = faq_chip_anchors(whole_fr)
    for n, chip in enumerate(chips, start=1):
        routes[next(i for i, a in enumerate(fr) if a is chip)] = f"#faq-group-{n}"
    for loc in LOCALES:
        n = len(anchors(_whole(stem, loc)))
        if n != len(fr):
            raise SystemExit(
                f"{stem}: the {loc} artboard has {n} links where French has "
                f"{len(fr)}; routes cannot be carried across by position"
            )
    return routes


def element_ids(nodes: list[Element]) -> set[str]:
    found: set[str] = set()

    def walk(n):
        if isinstance(n, str):
            return
        got = n.attr("id")
        if got:
            found.add(got)
        for c in n.children:
            walk(c)

    for n in nodes:
        walk(n)
    return found


def check_fragments(stem: str, routes: list[str | None], page_ids: set[str],
                    home_ids: set[str]) -> None:
    """A link to `#thing` has to have a `thing` to land on.

    The existing guard catches an anchor with no mapping at all. It did not
    catch one mapped to a fragment that exists nowhere, which is how the FAQ
    shipped four chips that did nothing. Ids the porter adds itself count —
    they are collected from the decorated tree, not from the raw artboard.
    """
    for route in routes:
        if not route or not isinstance(route, str):
            continue
        if route in HOME_FRAGMENTS:
            # Mirrors `fragment()`: these name home-page sections and are
            # emitted as `/<lang>#…`, so they are checked against the home
            # page. The header carries one on every page.
            target, scope = route[1:], home_ids
        elif route.startswith("#"):
            target, scope = route[1:], page_ids
        elif route.startswith("/#"):
            target, scope = route[2:], home_ids
        else:
            continue
        if target not in scope:
            raise SystemExit(
                f"{stem}: a link points at #{target}, which nothing on the "
                f"{'home page' if scope is home_ids else 'page'} has as an id. "
                "Give the target an id in DECORATIONS, or change the route."
            )


def _whole(stem: str, loc: str) -> list[Element]:
    a, h, secs, f = board_parts(os.path.join(CANVAS, locale_file(stem, loc)))
    return [a, h, *secs, f]


def resolve_href(path: str | None, raw: str):
    """-> (jsx value, is_internal_route) | None"""
    if path is None:
        return None
    if path.startswith("mailto:") or path.startswith("http"):
        return json.dumps(path), False
    if path in ("@home", "/"):
        return "{`/${lang}`}", True
    if path.startswith("/#"):
        return "{`/${lang}" + path[1:] + "`}", True
    if path.startswith("#"):
        return fragment(path)
    return "{`/${lang}" + path + "`}", True


# --- locale-switching chrome -------------------------------------------------
#
# The canvas ships twelve languages. We ship four. This is the one place the
# port deliberately departs from the drawing, because the alternative is eleven
# links to pages that do not exist. The design's own styling is kept; only the
# list is ours, and the "12 langues" label keeps the designer's wording with
# the number swapped for the real one.


def is_lang_button(node: Element) -> bool:
    return node.tag == "button" and (node.attr("aria-label") or "").startswith(
        ("Changer de langue", "Change language", "切换语言", "تغيير اللغة")
    )


def is_lang_row(node: Element) -> bool:
    if node.tag != "div":
        return False
    langs = [c for c in kids(node) if c.tag == "a" and c.attr("lang")]
    return len(langs) >= 6


def chrome_replacer(node: Element, em: Emitter):
    if is_lang_button(node):
        em.i += em.count_slots(node)
        return ["<LocaleSwitch lang={lang} />"]
    if is_lang_row(node):
        label = em.i  # "12 langues"
        em.i += em.count_slots(node)
        return [f"<LocaleRow lang={{lang}} label={{{em.slot_expr(label)}}} />"]
    return None


# --- locale-varying attributes ----------------------------------------------


def attr_stream(nodes: list[Element]) -> list[tuple[str, str, str | None]]:
    """Every non-translatable attribute, in the emitter's own walk order."""
    out: list[tuple[str, str, str | None]] = []

    def walk(n):
        if isinstance(n, str):
            return
        for k, v in n.attrs:
            if k not in L10N_ATTRS:
                out.append((n.tag, k, v))
        for c in n.children:
            walk(c)

    for n in nodes:
        walk(n)
    return out


def variant_tables(per_locale: dict[str, list[Element]], tokens: set[str]):
    """Split attributes into "same everywhere" and "depends on the locale".

    Arabic mirrors the arrow glyphs and the absolute offsets of the hero's
    floating labels; Chinese and Arabic both retune the display font's size and
    tracking, which is a real typographic decision and not noise. Those values
    travel per locale; everything else is inlined once.
    """
    locales = list(per_locale)
    streams = {loc: attr_stream(per_locale[loc]) for loc in locales}
    n = len(streams[locales[0]])
    variants: dict[int, tuple[str, int]] = {}
    styles: list[dict[str, dict[str, str]]] = []
    values: list[dict[str, str]] = []

    for idx in range(n):
        tag, name, _ = streams[locales[0]][idx]
        vals = {loc: streams[loc][idx][2] for loc in locales}
        if len({v or "" for v in vals.values()}) == 1:
            continue
        if name == "style":
            variants[idx] = ("style", len(styles))
            base = vals["fr"] if "fr" in vals else vals[locales[0]]
            styles.append(
                {loc: dict(css_object(vals[loc] or "", tag, tokens, base)) for loc in locales}
            )
        else:
            variants[idx] = ("attr", len(values))
            values.append({loc: vals[loc] or "" for loc in locales})
    return variants, styles, values


def css_object(
    css: str, tag: str, tokens: set[str], base_css: str | None = None
) -> list[tuple[str, str]]:
    # Same box-model restoration and responsive seams as the inlined styles
    # take — a style that varies by locale is no less subject to Tailwind's
    # preflight, and the Arabic hero heading has to shrink on a phone too.
    css = responsive(needs_content_box(css), tag, tokens, base_css, _SIZES)
    return [(css_prop(k), v) for k, v in split_decls(css)]


# --- responsive tokens ---------------------------------------------------------
#
# The emitter wraps system-level values in `var(--sp-…, <artboard value>)` (see
# emit.responsive). The stylesheet is the one place those properties are
# defined, so it is also the list of values the design is known to use. Every
# token a board reads must be defined there: a re-export that introduces a
# 50px heading would otherwise render at 50px on a phone with nobody noticing.

STYLESHEET = "src/app/[lang]/(marketing)/_design/board.module.css"


def declared_tokens() -> set[str]:
    css = open(os.path.join(ROOT, STYLESHEET), encoding="utf-8").read()
    return set(re.findall(r"(--sp-[\w-]+)\s*:", css))


def declared_sizes() -> set[float]:
    """The type sizes the stylesheet has a phone value for."""
    return {
        float(t.removeprefix("--sp-fs-").replace("_", "."))
        for t in declared_tokens()
        if t.startswith("--sp-fs-")
    }


def check_tokens(used: set[str]) -> None:
    missing = sorted(used - declared_tokens())
    if missing:
        raise SystemExit(
            "the boards read custom properties the stylesheet never defines — "
            "a size, gap or grid the responsive tables do not know about:\n  "
            + "\n  ".join(missing)
            + f"\nDefine each one in {STYLESHEET} (every breakpoint that "
            "changes it) and port again."
        )


# --- fluid images ---------------------------------------------------------------


def _intrinsic(path: str) -> tuple[float, float] | None:
    full = os.path.join(ROOT, "public", path.lstrip("/"))
    if path.endswith(".svg"):
        head = open(full, encoding="utf-8").read(4000)
        m = re.search(r'viewBox="([\d.\s-]+)"', head)
        if m:
            _x, _y, w, h = (float(v) for v in m.group(1).split())
            return w, h
        return None
    if path.endswith(".png"):
        import struct
        with open(full, "rb") as fh:
            head = fh.read(24)
        return struct.unpack(">II", head[16:24])
    return None


_SIZES = declared_sizes()


_DRAWN_W = re.compile(r"(?<![-\w])width:\s*([\d.]+)px")
_DRAWN_H = re.compile(r"(?<![-\w])height:\s*([\d.]+)px")


def image_ratio_matches(src: str, css: str) -> bool:
    """Is the drawn box the image's own shape? See emit.fluid_image.

    Checked against the file we actually serve rather than trusted: the
    canvas draws the container-ship illustration at 360×300 on the pricing
    page and at 220×210 on the home page, and only one of those is its shape.
    """
    if not src.startswith("/_blob/"):
        return False
    w, h = _DRAWN_W.search(css), _DRAWN_H.search(css)
    if not (w and h):
        return False
    size = _intrinsic(ASSETS[src.rsplit("/", 1)[1]])
    if not size:
        return False
    drawn = float(w.group(1)) / float(h.group(1))
    real = size[0] / size[1]
    return abs(drawn - real) / real < 0.01


# --- behaviour attached to transcribed markup ---------------------------------
#
# The boards are a transcription and must stay one, so nothing is hand-edited
# into them. Where a page needs behaviour the canvas cannot draw — a scroll
# interaction, say — the porter adds a class and nothing else. The styling
# lives in globals.css beside the rest of the motion vocabulary.
#
# Each entry is (predicate, class, how many elements it must match). The count
# is checked on every run: if a re-export changes these cards, the port fails
# instead of quietly dropping the behaviour.


def _is_step_card(el: Element) -> bool:
    return el.tag == "article" and "border-radius: 26px" in (el.attr("style") or "")


# Components that stand in for a transcribed element, keeping its attributes
# and its children. The children stay server-rendered, so wrapping the quote
# form in a client component costs nothing in the browser bundle.


def _is_quote_form(el: Element) -> bool:
    return el.tag == "form"


def _is_country_select(el: Element) -> bool:
    return el.tag == "select" and el.attr("id") == "q-country"


def _faq_group_counter():
    """Each FAQ category group, numbered, so a chip has somewhere to land.

    The canvas draws six groups — a heading beside its questions — and six
    chips above them, but gives the groups no ids, so the chips it draws point
    at nothing. The ids are added here rather than invented in the route map,
    which is what shipped four dead anchors.
    """
    n = [0]

    def decorate(el: Element):
        if not _is_faq_group(el):
            return None
        n[0] += 1
        return {"id": f"faq-group-{n[0]}", "className": "sp-faq-group"}

    return decorate


def _is_faq_group(el: Element) -> bool:
    if el.tag != "div" or "grid" not in (el.attr("style") or ""):
        return False
    first = next((c for c in el.children if not isinstance(c, str)), None)
    return first is not None and first.tag == "h2"


def _is_faq_chip_row(el: Element) -> bool:
    """The row of category chips: a wrapping flex of pill-shaped anchors."""
    if el.tag != "section":
        return False
    pills = [
        c
        for c in el.children
        if not isinstance(c, str)
        and c.tag == "a"
        and "border-radius: 999px" in (c.attr("style") or "")
    ]
    return len(pills) >= 6


def faq_chip_anchors(nodes: list[Element]) -> list[Element]:
    rows = []

    def walk(n):
        if isinstance(n, str):
            return
        if _is_faq_chip_row(n):
            rows.append(n)
            return
        for c in n.children:
            walk(c)

    for n in nodes:
        walk(n)
    return [c for r in rows for c in r.children if not isinstance(c, str) and c.tag == "a"]


def _is_file_drop(el: Element) -> bool:
    """The dashed panel the canvas draws for attachments.

    Matched on the dashed border, which is the only one on the page — the
    count check below is what stops that quietly becoming untrue.
    """
    return el.tag == "div" and "dashed" in (el.attr("style") or "")


COMPONENTS: dict[str, list[tuple]] = {
    "Devis": [
        # Owns the action and the pending/error state.
        (_is_quote_form, "QuoteForm", "../../quote-form", 1, True),
        # The canvas draws one placeholder option. A real select needs the
        # list, which is the app's existing ISO 3166 one rather than a new
        # invention; the designer's placeholder text is passed through.
        (_is_country_select, "CountrySelect", "../../form-controls", 1, True),
        # The canvas cannot draw a file having been chosen, so the previews,
        # sizes and remove buttons are added around the box it did draw.
        (_is_file_drop, "FileDrop", "../../file-drop", 1, True),
    ],
    "FAQ": [
        # The chips work as plain anchors with no JavaScript; this adds the
        # moving active state the canvas can only draw one frame of.
        (_is_faq_chip_row, "FaqCategories", "../../faq-categories", 1, False),
    ],
}

# Controls the canvas drew without an id, so the generic "name from id" rule
# has nothing to work from. One entry, and the count is checked: the consent
# tick has to post or the form cannot record that it was given.
FIELD_NAMES: dict[str, list[tuple]] = {
    "Devis": [
        (lambda el: el.tag == "input" and el.attr("type") == "checkbox",
         "consent", 1),
    ],
}


def field_namer(stem: str):
    rules = FIELD_NAMES.get(stem, [])
    seen = [0] * len(rules)

    def name_for(el: Element) -> str | None:
        for i, (pred, name, _n) in enumerate(rules):
            if pred(el):
                seen[i] += 1
                return name
        return None

    def check() -> None:
        for (_p, name, expected), got in zip(rules, seen):
            if got != expected:
                raise SystemExit(
                    f"{stem}: expected {expected} unnamed control(s) for "
                    f'name="{name}", matched {got}. Update FIELD_NAMES.'
                )

    return name_for, check


# Stand-ins produced by generic rules in the emitter rather than by a page
# entry above, so they can turn up on any board.
GENERIC_IMPORTS = {
    # An anchor the route map resolved to nothing is a submit control.
    "SubmitButton": "../../form-controls",
    # An element wrapping a button with aria-expanded is a disclosure.
    "Disclosure": "../../disclosure",
}


def component_for(stem: str):
    rules = COMPONENTS.get(stem, [])
    seen = [0] * len(rules)

    def retag(el: Element):
        """-> (component, extra attributes) for a matching element."""
        for i, (pred, name, _mod, _n, needs_lang) in enumerate(rules):
            if pred(el):
                seen[i] += 1
                # Only the stand-ins that render copy or a localised list are
                # handed the locale; the generic submit button has no use for
                # it and should not be asked to accept one.
                return name, (["lang={lang}"] if needs_lang else [])
        return None

    def check() -> None:
        for (pred, name, _mod, expected, _l), got in zip(rules, seen):
            if got != expected:
                raise SystemExit(
                    f"{stem}: expected {expected} element(s) for <{name}>, "
                    f"matched {got}. The artboard changed — update COMPONENTS."
                )

    return retag, check


def component_imports(stem: str, used: set[str]) -> list[str]:
    """Import lines for whichever stand-ins the emitter actually produced."""
    table = {name: mod for _p, name, mod, _n, _l in COMPONENTS.get(stem, [])}
    table.update(GENERIC_IMPORTS)
    return [
        f'import {{ {name} }} from "{table[name]}";'
        for name in sorted(used)
        if name in table
    ]


# -- the seams the responsive stylesheet hangs on ------------------------------
#
# The artboards are drawn once, at 1440px. The compositions that cannot merely
# shrink — an illustration pinned by a pixel offset, two phones fanned across a
# 700px stage, a closing band with a mascot leaning out of it — are named here
# so `board.module.css` can recompose them by class instead of by guessing at
# their inline styles. Each predicate reads the design's own values; when the
# designer moves something the count fails and this table is updated, which is
# the only way a class here ever changes.


def _style(el: Element) -> str:
    return el.attr("style") or ""


def _has(el: Element, *frags: str) -> bool:
    st = _style(el)
    return all(f in st for f in frags)


def _is_cta_band(el: Element) -> bool:
    """The closing "Parlez-nous…" band: a 32px-radius blue box padded 72px."""
    return el.tag == "div" and _has(el, "border-radius: 32px", "background: #155DFC", "padding: 72px")


def _is_cta_mascot(el: Element) -> bool:
    """The 300px box the mascot and her speech bubble sit in, inside the band."""
    return el.tag == "div" and _has(el, "position: relative; width: 300px; height: 300px; flex-shrink: 0")


def _is_two_track(el: Element) -> bool:
    """A row of two blocks that the artboard never collapses.

    Four drawings share the fault on a phone: a section head with its
    caption beside it (heading column + paragraph, 64px apart), a sub-page
    hero with its figure beside it, the navy sourcing card with its 330px
    image panel, and the FAQ's closing card with its mail button. All are a
    row flex of a text column and one other block, set apart by a wide gap,
    a fixed-width panel or a call to action. Icon rows and button rows are
    not matched: they start with a span, or have small gaps.
    """
    if el.tag not in ("div", "article", "section"):
        return False
    st = _style(el)
    if "display: flex" not in st or "flex-direction: column" in st or "flex-wrap" in st:
        return False
    ch = [c for c in el.children if isinstance(c, Element)]
    if len(ch) != 2 or any(c.tag in ("svg", "span", "button", "input") for c in ch):
        return False
    # The first block is a column of text — an eyebrow, a heading and a
    # paragraph — or an illustration beside one (the app page's download
    # card). Icon-and-label rows start with a span and are not this.
    def is_text_column(c: Element) -> bool:
        return c.tag == "div" and "flex-direction: column" in _style(c)

    first = ch[0]
    if first.tag != "div" or not (
        is_text_column(first)
        or any(is_text_column(c) for c in first.children if isinstance(c, Element))
    ):
        return False
    panel = any(
        re.search(r"(?<![-\w])width: [3-9]\d\dpx", _style(c)) and "flex-shrink: 0" in _style(c)
        for c in ch
    )
    # A call to action beside the text — the FAQ's "Didn't find your answer?"
    # card — is the fourth drawing of the same row.
    cta = ch[1].tag == "a"
    gap = re.search(r"gap: (\d+)px", st)
    return panel or cta or bool(gap and int(gap.group(1)) >= 24)


def _is_hero_figure(el: Element) -> bool:
    """The pale-blue rounded box a sub-page hero draws its illustration in."""
    if el.tag != "div" or not _has(el, "background: #EEF3FF"):
        return False
    st = _style(el)
    return bool(re.search(r"(?<![-\w])width: \d+px; height: \d+px", st)) and (
        "flex-shrink: 0" in st or "position: relative" in st
    )


def _is_phone_stage(el: Element) -> bool:
    return el.tag == "div" and _has(el, "position: relative; height: 700px")


def _is_home_hero(el: Element) -> bool:
    return el.tag == "section" and _has(el, "min-height: 740px")


def _is_home_hero_copy(el: Element) -> bool:
    return el.tag == "div" and _has(el, "width: 580px; padding-top: 92px")


def _is_home_hero_art(el: Element) -> bool:
    return el.tag == "div" and _has(el, "position: absolute; z-index: 1", "width: 800px")


def _is_home_hero_label(el: Element) -> bool:
    """The three floating labels pinned over the hero illustration."""
    return el.tag == "div" and _has(el, "position: absolute", "white-space: nowrap", "box-shadow")


def _is_op_card(el: Element) -> bool:
    """The six operation cards on the home page: an article whose first child
    is the 210px illustration box."""
    if el.tag != "article":
        return False
    first = next((c for c in el.children if isinstance(c, Element)), None)
    return first is not None and first.tag == "div" and _has(first, "height: 210px")


def _is_steps_rail(el: Element) -> bool:
    return el.tag == "svg" and el.attr("width") == "1200"


def _is_steps_grid(el: Element) -> bool:
    return el.tag == "div" and _has(el, "grid-template-columns: repeat(6, minmax(0, 1fr))")


def _is_how_row(el: Element) -> bool:
    return el.tag == "article" and _has(el, "grid-template-columns: 76px")


def _is_contact_aside_art(el: Element) -> bool:
    """The mascot and bubble pinned to the corner of the contact page's aside."""
    return _has(el, "position: absolute", "bottom:") and el.tag in ("img", "div")


def _is_not_found_numeral(el: Element) -> bool:
    return el.tag == "span" and _has(el, "position: absolute", "font-size: 72px")


# Rules that hold on every page, with the pages each is expected on. Checked
# per page shape like the page rules: a page that gains or loses a closing
# band fails the port until this says so.
_CTA_PAGES = {"Accueil": 1, "Services": 1, "Comment-ca-marche": 1, "Entrepot": 1,
              "Tarifs": 1, "A-propos": 1}
_TWO_TRACK_PAGES = {"Accueil": 3, "Services": 2, "Comment-ca-marche": 1, "Tarifs": 1,
                    "FAQ": 2, "A-propos": 1, "Application": 1}


def _is_two_track_tail(el: Element) -> bool:
    """The store badges at the end of the app page's download card: a
    wrapping row pushed to the far end, which under its text on a phone
    should sit at the start."""
    return el.tag == "div" and _has(el, "flex-wrap: wrap; justify-content: flex-end")
_HERO_FIGURE_PAGES = {"Services": 1, "Comment-ca-marche": 1, "Tarifs": 1, "FAQ": 1,
                      "A-propos": 1, "404": 1}
SITE_DECORATIONS: list[tuple] = [
    (_is_cta_band, "sp-cta-band", _CTA_PAGES),
    (_is_cta_mascot, "sp-cta-mascot", _CTA_PAGES),
    (_is_two_track, "sp-two-track", _TWO_TRACK_PAGES),
    (_is_two_track_tail, "sp-two-track-tail", {"Application": 1}),
    (_is_hero_figure, "sp-hero-figure", _HERO_FIGURE_PAGES),
    (_is_phone_stage, "sp-phone-stage", {"Accueil": 1, "Application": 1}),
]

DECORATIONS: dict[str, list[tuple]] = {
    # Six category groups, numbered so the six chips above them have
    # somewhere to land. Count-checked: if the canvas ever draws a
    # seventh category, the port stops rather than orphaning a chip.
    "FAQ": [(_is_faq_group, _faq_group_counter(), 6)],
    # The six operations read as one sequence, so they park and stack as you
    # scroll instead of scrolling past as six separate blocks.
    "Services": [(_is_step_card, "sp-step-card", 6)],
    "Accueil": [
        (_is_home_hero, "sp-hero", 1),
        (_is_home_hero_copy, "sp-hero-copy", 1),
        (_is_home_hero_art, "sp-hero-art", 1),
        (_is_home_hero_label, "sp-hero-label", 3),
        (_is_op_card, "sp-op-card", 6),
        (_is_steps_rail, "sp-steps-rail", 1),
        (_is_steps_grid, "sp-steps", 1),
    ],
    "Comment-ca-marche": [(_is_how_row, "sp-how-row", 6)],
    "Contact": [(_is_contact_aside_art, "sp-contact-art", 2)],
    "404": [(_is_not_found_numeral, "sp-404-numeral", 1)],
}

def decorator_for(stem: str):
    """A decorate hook for one page, plus the tally it must satisfy."""
    rules = [
        *DECORATIONS.get(stem, []),
        *((pred, cls, pages.get(stem, 0)) for pred, cls, pages in SITE_DECORATIONS),
    ]
    seen = [0] * len(rules)

    def decorate(el: Element):
        """-> a class name, or a dict of attributes, or None."""
        for i, (pred, what, _) in enumerate(rules):
            if pred(el):
                seen[i] += 1
                # A callable decoration numbers itself as it goes, which is how
                # six sibling groups get six distinct ids.
                return what(el) if callable(what) else what
        return None

    def check() -> None:
        for (pred, what, expected), got in zip(rules, seen):
            cls = getattr(what, "__name__", what)
            if got != expected:
                raise SystemExit(
                    f"{stem}: expected {expected} element(s) for {cls}, matched "
                    f"{got}. The artboard changed — update DECORATIONS rather "
                    "than shipping the page without its behaviour."
                )

    return decorate, check


# -- chrome ---------------------------------------------------------------------


def _is_announce(el: Element) -> bool:
    return el.tag == "div" and _has(el, "min-height: 44px", "background: #0E1A3D")


def _is_announce_dot(el: Element) -> bool:
    return el.tag == "span" and _has(el, "width: 8px; height: 8px; border-radius: 50%")


def _is_footer_grid(el: Element) -> bool:
    return el.tag == "div" and _has(el, "grid-template-columns: 340px repeat(4, minmax(0, 1fr))")


def _is_footer_meta(el: Element) -> bool:
    return el.tag == "div" and _has(el, "justify-content: space-between", "font-size: 13.5px")


CHROME_DECORATIONS: list[tuple] = [
    (_is_announce, "sp-announce", 1),
    (_is_announce_dot, "sp-announce-dot", 1),
    (_is_footer_grid, "sp-footer-grid", 1),
    (_is_footer_meta, "sp-footer-meta", 1),
]


def chrome_decorator():
    seen = [0] * len(CHROME_DECORATIONS)

    def decorate(el: Element) -> str | None:
        for i, (pred, cls, _) in enumerate(CHROME_DECORATIONS):
            if pred(el):
                seen[i] += 1
                return cls
        return None

    def check() -> None:
        for (pred, cls, expected), got in zip(CHROME_DECORATIONS, seen):
            if got != expected:
                raise SystemExit(
                    f"chrome: expected {expected} element(s) for .{cls}, matched {got}."
                )

    return decorate, check


def header_retag(el: Element):
    """The header becomes a client shell so a phone can have a menu.

    The canvas draws the header once, at 1440px, with five links in a row;
    its phone artboard draws a hamburger and no drawer. `HeaderShell` keeps
    the transcribed header — every attribute and child stays server-rendered
    — and adds the button and the drawer around them. It relies on the
    header's shape (logo, nav, actions) which `port_chrome` asserts.
    """
    if el.tag == "header":
        return "HeaderShell", ["lang={lang}"]
    return None


def assert_header_shape(header: Element) -> None:
    ch = [c for c in header.children if isinstance(c, Element)]
    tags = [c.tag for c in ch]
    if tags != ["a", "nav", "div"]:
        raise SystemExit(f"header is drawn as {tags}; HeaderShell expects [a, nav, div]")
    actions = [c.tag for c in ch[2].children if isinstance(c, Element)]
    if actions != ["button", "a", "a"]:
        raise SystemExit(
            f"header actions are drawn as {actions}; HeaderShell expects "
            "[language button, client-area link, quote link]"
        )


# --- emission ----------------------------------------------------------------

BANNER = """// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: {src}
// Regenerate: npm run design:port
"""

BOARD_DOC = """/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in ../content/{key}.ts as four arrays zipped by
 * position, which is sound because the four artboards were checked to have
 * identical tag-and-attribute structure before anything was written.
 */"""


def js(value) -> str:
    return json.dumps(value, ensure_ascii=False)


def lead_paragraph(strings: list[str]) -> str:
    """The page's own opening sentence, for the meta description.

    The canvas has no meta tags, so the honest substitute is the first piece of
    prose on the page — which is what the designer wrote to introduce it.
    """
    for s in strings:
        if len(s) >= 80:
            return s[:300]
    return strings[1] if len(strings) > 1 else ""


BANNER = """// GENERATED FROM THE 2026-09 CANVAS — DO NOT EDIT BY HAND.
// Source: {src}
// Regenerate: npm run design:port
"""

BOARD_DOC = """/*
 * Markup, spacing and colour are the design's own, transcribed rather than
 * interpreted. Copy lives in {content}, one array per locale, zipped by
 * position — sound because the artboards behind this file were checked to
 * have identical tag-and-attribute structure before anything was written.
 */"""


def write(path: str, body: str) -> None:
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as fh:
        fh.write(body)


def board_parts(path: str):
    """(announce strip, header, page sections, footer) for one artboard."""
    frame = [c for c in kids(find(parse(path), "x-dc")) if c.tag == "div"][0]
    wrapper, footer = kids(frame)[0], kids(frame)[1]
    ch = kids(wrapper)
    return ch[0], ch[1], ch[2:], footer


def page_title(path: str) -> str:
    el = find(parse(path), "title")
    return text_of(el) if el else ""


def aligned(stem: str):
    """Parse all twelve locales and group them by structure.

    Most pages come out of the canvas with one shape shared by every language,
    and their strings can be zipped by position. Some do not: Turkish puts the
    "to be confirmed" placeholder at the head of a sentence that French ends
    with, which moves a <span> and shifts every slot after it. Forcing those
    into one component is precisely how a translation ends up under the wrong
    heading, so each distinct shape gets its own transcription and the locales
    that share it.

    Returns (groups, text, titles) where a group is (locales, nodes-by-locale)
    and `text` holds every locale's own slot stream, whatever its length.
    """
    parts = {
        loc: board_parts(os.path.join(CANVAS, locale_file(stem, loc)))
        for loc in LOCALES
    }
    whole = {
        loc: [parts[loc][0], parts[loc][1], *parts[loc][2], parts[loc][3]]
        for loc in LOCALES
    }

    shapes: dict[tuple, list[str]] = {}
    for loc in LOCALES:
        sig = tuple(x for n in whole[loc] for x in signature(n))
        shapes.setdefault(sig, []).append(loc)
    # French's group first, so it stays the default variant.
    groups = sorted(shapes.values(), key=lambda g: 0 if "fr" in g else 1)

    text = {loc: [x for n in whole[loc] for x in slots(n)] for loc in LOCALES}
    titles = {
        loc: page_title(os.path.join(CANVAS, locale_file(stem, loc)))
        for loc in LOCALES
    }
    return [(g, {loc: whole[loc] for loc in g}) for g in groups], text, titles


def emit_part(nodes, *, per_locale_nodes, start_i, start_a, offset, hrefs,
              replacer=None, decorate=None, retag=None, name_for=None,
              tokens: set[str] | None = None):
    """Emit `nodes` as JSX whose slot reads are shifted by `offset`."""
    tokens = tokens if tokens is not None else set()
    variants, styles, values = variant_tables(per_locale_nodes, tokens)
    em = Emitter(
        assets=ASSETS,
        resolve_href=resolve_href,
        hrefs=hrefs,
        variants={k + start_a: v for k, v in variants.items()},
        slot_expr=lambda i: f"t[{i - offset}]",
        replace=replacer,
        decorate=decorate,
        retag=retag,
        name_for=name_for,
        image_ratio=image_ratio_matches,
        known_sizes=_SIZES,
    )
    em.tokens = tokens
    em.i, em.a = start_i, start_a
    lines = [ln for n in nodes for ln in em.emit(n, 3)]
    return lines, em, styles, values


def style_rows(styles: list) -> str:
    if not styles:
        return "[]"
    rows = [
        "    { "
        + ", ".join(
            f"{loc}: {{ " + ", ".join(f"{js(k)}: {js(v)}" for k, v in e[loc].items()) + " }"
            for loc in e
        )
        + " },"
        for e in styles
    ]
    return "[\n" + "\n".join(rows) + "\n  ]"


def value_rows(values: list) -> str:
    if not values:
        return "[]"
    rows = [
        "    { " + ", ".join(f"{loc}: {js(e[loc])}" for loc in e) + " },"
        for e in values
    ]
    return "[\n" + "\n".join(rows) + "\n  ]"


BOARD_DIR = "src/app/[lang]/(marketing)/_design"


# --- chrome ------------------------------------------------------------------


def port_chrome(tokens: set[str]) -> None:
    """Header and footer — one pair for the whole site.

    All thirteen artboards draw them identically in all twelve languages, which
    is asserted rather than assumed: if a language ever moved something in the
    header, two headers would be needed and this would say so.
    """
    parts = {
        loc: board_parts(os.path.join(CANVAS, locale_file("Accueil", loc)))
        for loc in LOCALES
    }
    head = {loc: [p[0], p[1]] for loc, p in parts.items()}
    foot = {loc: [p[3]] for loc, p in parts.items()}
    for label, group in (("header", head), ("footer", foot)):
        shapes = {
            tuple(x for n in v for x in signature(n)) for v in group.values()
        }
        if len(shapes) != 1:
            raise SystemExit(
                f"the {label} is not the same shape in every locale; it can no "
                "longer be a single component"
            )

    fr = head["fr"]
    n_head = sum(len(slots(n)) for n in fr)
    n_foot = len(slots(foot["fr"][0]))
    text = {
        loc: [x for n in [p[0], p[1], *p[2], p[3]] for x in slots(n)]
        for loc, p in parts.items()
    }
    a_total = len(attr_stream([parts["fr"][0], parts["fr"][1], *parts["fr"][2],
                               parts["fr"][3]]))

    routes = page_routes("Accueil")
    assert_header_shape(fr[1])
    decorate, check_chrome = chrome_decorator()
    lines, em, styles, values = emit_part(
        fr, per_locale_nodes=head, start_i=0, start_a=0, offset=0,
        hrefs=routes, replacer=chrome_replacer, decorate=decorate,
        retag=header_retag, tokens=tokens,
    )
    n_head_anchors = em.k
    write(f"{BOARD_DIR}/site-header.tsx", chrome_component(
        "SiteHeader", "chrome", lines, em, styles, values,
        extra='import { LocaleSwitch } from "./locale-switch";\n'
        'import { HeaderShell } from "./header-shell";',
        src="Main.dc.html — header; identical on every artboard",
    ))

    foot_i = len(text["fr"]) - n_foot
    flines, fem, fstyles, fvalues = emit_part(
        foot["fr"], per_locale_nodes=foot,
        start_i=foot_i, start_a=a_total - len(attr_stream(foot["fr"])),
        offset=foot_i,
        hrefs=routes[len(routes) - len(anchors(foot["fr"])):],
        replacer=chrome_replacer, decorate=decorate, tokens=tokens,
    )
    check_chrome()
    write(f"{BOARD_DIR}/site-footer.tsx", chrome_component(
        "SiteFooter", "chromeFooter", flines, fem, fstyles, fvalues,
        extra='import { LocaleRow } from "./locale-switch";',
        src="Main.dc.html — footer; identical on every artboard",
    ))

    write(f"{BOARD_DIR}/content/chrome.ts", chrome_content(
        "chrome", "*-Accueil.dc.html (header)",
        {loc: text[loc][:n_head] for loc in LOCALES}, styles, values,
    ))
    write(f"{BOARD_DIR}/content/chromeFooter.ts", chrome_content(
        "chromeFooter", "*-Accueil.dc.html (footer)",
        {loc: text[loc][len(text[loc]) - n_foot:] for loc in LOCALES},
        fstyles, fvalues,
    ))
    print(f"  chrome: header {n_head} strings, footer {n_foot} strings, "
          f"{len(LOCALES)} locales")


def chrome_content(name, src, text, styles, values) -> str:
    rows = "\n".join(
        f"    {loc}: [\n      " + ",\n      ".join(js(x) for x in text[loc]) + ",\n    ],"
        for loc in LOCALES
    )
    return (
        BANNER.format(src=src)
        + 'import type { CSSProperties } from "react";\n'
        + 'import type { Locale } from "@/lib/i18n/config";\n\n'
        + f"export const {name} = {{\n"
        + "  text: {\n" + rows + "\n  } as Record<Locale, readonly string[]>,\n"
        + "  styles: " + style_rows(styles) + " as Record<Locale, CSSProperties>[],\n"
        + "  values: " + value_rows(values) + " as Record<Locale, string>[],\n"
        + "};\n"
    )


def chrome_component(name, key, lines, em, styles, values, *, extra, src) -> str:
    imports = []
    if em.needs_link:
        imports.append('import Link from "next/link";')
    imports.append('import type { Locale } from "@/lib/i18n/config";')
    imports.append(f'import {{ {key} as content }} from "./content/{key}";')
    imports.append(extra)
    reads = ["  const t = content.text[lang];"]
    if styles:
        reads.append("  const s = content.styles;")
    if values:
        reads.append("  const v = content.values;")
    return (
        BANNER.format(src=src)
        + BOARD_DOC.format(content=f"./content/{key}.ts")
        + "\n\n"
        + "\n".join(imports)
        + "\n\n"
        + f"export function {name}({{ lang }}: {{ lang: Locale }}) {{\n"
        + "\n".join(reads)
        + "\n\n  return (\n    <>\n"
        + "\n".join("      " + ln for ln in lines)
        + "\n    </>\n  );\n}\n"
    )


# --- pages -------------------------------------------------------------------


def port_page(stem: str, tokens: set[str]) -> None:
    page = PAGES[stem]
    groups, text, titles = aligned(stem)
    routes = page_routes(stem)

    variants = []
    for locs, nodes in groups:
        decorate, check_decorations = decorator_for(stem)
        retag, check_components = component_for(stem)
        name_for, check_names = field_namer(stem)
        tag = locs[0]
        primary = nodes[tag]
        sections = {loc: n[2:-1] for loc, n in nodes.items()}
        start_i = sum(len(slots(n)) for n in primary[:2])
        start_a = len(attr_stream(primary[:2]))

        lines, em, styles, values = emit_part(
            sections[tag], per_locale_nodes=sections,
            start_i=start_i, start_a=start_a, offset=start_i,
            hrefs=routes[len(anchors(primary[:2])):],
            decorate=decorate,
            retag=retag,
            name_for=name_for,
            tokens=tokens,
        )
        check_decorations()
        check_components()
        check_names()
        # Ids are read back out of what was actually emitted, not out of the
        # artboard: several of them are added by the decorations above, and a
        # guard that checked the input rather than the output would pass while
        # shipping a link to nothing.
        check_fragments(
            stem,
            routes,
            set(re.findall(r'id="([^"]+)"', "\n".join(lines))),
            element_ids(_whole("Accueil", "fr")),
        )
        variants.append((tag, locs, lines, em, styles, values))

    write(f"{BOARD_DIR}/boards/{page.key}/index.tsx", board_index(page, variants))
    for tag, locs, lines, em, styles, values in variants:
        write(f"{BOARD_DIR}/boards/{page.key}/{tag}.tsx",
              board_variant(page, tag, locs, lines, em, styles, values,
                            imports=component_imports(stem, em.components)))

    body = {}
    for tag, locs, *_ in variants:
        primary = groups[[g[0] for g in groups].index(locs)][1][tag]
        start_i = sum(len(slots(n)) for n in primary[:2])
        for loc in locs:
            end_i = len(text[loc]) - len(slots(groups[[g[0] for g in groups].index(locs)][1][loc][-1]))
            body[loc] = text[loc][start_i:end_i]

    write(f"{BOARD_DIR}/content/{page.key}.ts",
          page_content(page, body, titles, variants))

    shapes = " + ".join(f"{tag}({len(locs)})" for tag, locs, *_ in variants)
    print(f"  {stem:<18} -> {page.key:<10} {len(variants)} shape(s) [{shapes}], "
          f"{len(body['fr'])} strings")


def board_index(page, variants) -> str:
    if len(variants) == 1:
        tag = variants[0][0]
        return (
            BANNER.format(src=page.board)
            + f'export {{ {page.comp} }} from "./{tag}";\n'
        )
    others = [v for v in variants if v[0] != variants[0][0]]
    imports = "\n".join(
        f'import {{ {page.comp}{v[0].upper()} }} from "./{v[0]}";' for v in variants
    )
    table = ", ".join(
        f"{loc}: {page.comp}{v[0].upper()}" for v in others for loc in v[1]
    )
    return (
        BANNER.format(src=page.board)
        + "/*\n"
        + " * Some languages do not have the same shape as French. Turkish puts\n"
        + " * the placeholder at the head of a sentence French ends with, which\n"
        + " * moves a <span> and shifts every string after it, so it is\n"
        + " * transcribed separately rather than bent into one component.\n"
        + " */\n\n"
        + 'import type { Locale } from "@/lib/i18n/config";\n'
        + imports
        + "\n\nconst BY_LOCALE: Partial<Record<Locale, typeof "
        + f"{page.comp}{variants[0][0].upper()}>> = {{ {table} }};\n\n"
        + f"export function {page.comp}({{ lang }}: {{ lang: Locale }}) {{\n"
        + f"  const Board = BY_LOCALE[lang] ?? {page.comp}{variants[0][0].upper()};\n"
        + "  return <Board lang={lang} />;\n}\n"
    )


def board_variant(page, tag, locs, lines, em, styles, values, *, imports=()) -> str:
    name = page.comp if len(locs) == len(LOCALES) else f"{page.comp}{tag.upper()}"
    extra = list(imports)
    imports = []
    if em.needs_link:
        imports.append('import Link from "next/link";')
    imports.append('import type { Locale } from "@/lib/i18n/config";')
    imports.append(f'import {{ {page.key} as content }} from "../../content/{page.key}";')
    imports.extend(extra)
    reads = ["  const t = content.text[lang];"]
    if styles:
        reads.append(f"  const s = content.{tag}Styles;")
    if values:
        reads.append(f"  const v = content.{tag}Values;")
    note = (
        ""
        if len(locs) == len(LOCALES)
        else f" *\n * Locales using this shape: {', '.join(locs)}.\n"
    )
    return (
        BANNER.format(src=f"{tag}-{page.stem}.dc.html (and {len(locs) - 1} more)")
        + BOARD_DOC.format(content=f"../../content/{page.key}.ts")[:-3]
        + note
        + " */\n\n"
        + "\n".join(imports)
        + "\n\n"
        + f"export function {name}({{ lang }}: {{ lang: Locale }}) {{\n"
        + "\n".join(reads)
        + "\n\n  return (\n    <>\n"
        + "\n".join("      " + ln for ln in lines)
        + "\n    </>\n  );\n}\n"
    )


def page_content(page, body, titles, variants) -> str:
    rows = "\n".join(
        f"    {loc}: [\n      " + ",\n      ".join(js(x) for x in body[loc]) + ",\n    ],"
        for loc in LOCALES
    )
    extra = ""
    for tag, locs, lines, em, styles, values in variants:
        extra += (
            f"  {tag}Styles: " + style_rows(styles)
            + " as Record<Locale, CSSProperties>[],\n"
            + f"  {tag}Values: " + value_rows(values)
            + " as Record<Locale, string>[],\n"
        )
    return (
        BANNER.format(src=page.board)
        + "//\n"
        + "// Position is the contract: within one locale, index n names the\n"
        + "// same slot as it does in every other locale that shares its shape.\n"
        + 'import type { CSSProperties } from "react";\n'
        + 'import type { Locale } from "@/lib/i18n/config";\n\n'
        + f"export const {page.key} = {{\n"
        + "  title: { "
        + ", ".join(f"{loc}: {js(titles[loc])}" for loc in LOCALES)
        + " } as Record<Locale, string>,\n"
        + "  description: { "
        + ", ".join(f"{loc}: {js(lead_paragraph(body[loc]))}" for loc in LOCALES)
        + " } as Record<Locale, string>,\n"
        + "  text: {\n" + rows + "\n  } as Record<Locale, readonly string[]>,\n"
        + extra
        + "};\n"
    )


if __name__ == "__main__":
    targets = sys.argv[1:] or list(PAGES)
    tokens: set[str] = set()
    port_chrome(tokens)
    for stem in targets:
        if stem not in PAGES:
            raise SystemExit(f"unknown page {stem!r}; known: {', '.join(PAGES)}")
        port_page(stem, tokens)
    check_tokens(tokens)
    print(f"  {len(tokens)} responsive tokens, all defined in {STYLESHEET}")
