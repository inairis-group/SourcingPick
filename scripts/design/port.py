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
from emit import Emitter, css_prop, split_decls

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
    fr = anchors(_whole(stem, "fr"))
    routes = [french_route(a, text_of(a), a.attr("href") or "") for a in fr]
    for loc in LOCALES:
        n = len(anchors(_whole(stem, loc)))
        if n != len(fr):
            raise SystemExit(
                f"{stem}: the {loc} artboard has {n} links where French has "
                f"{len(fr)}; routes cannot be carried across by position"
            )
    return routes


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


def variant_tables(per_locale: dict[str, list[Element]]):
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
            styles.append(
                {loc: dict(css_object(vals[loc] or "")) for loc in locales}
            )
        else:
            variants[idx] = ("attr", len(values))
            values.append({loc: vals[loc] or "" for loc in locales})
    return variants, styles, values


def css_object(css: str) -> list[tuple[str, str]]:
    return [(css_prop(k), v) for k, v in split_decls(css)]


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


DECORATIONS: dict[str, list[tuple]] = {
    # The six operations read as one sequence, so they park and stack as you
    # scroll instead of scrolling past as six separate blocks.
    "Services": [(_is_step_card, "sp-step-card", 6)],
}


def decorator_for(stem: str):
    """A decorate hook for one page, plus the tally it must satisfy."""
    rules = DECORATIONS.get(stem, [])
    seen = [0] * len(rules)

    def decorate(el: Element) -> str | None:
        for i, (pred, cls, _) in enumerate(rules):
            if pred(el):
                seen[i] += 1
                return cls
        return None

    def check() -> None:
        for (pred, cls, expected), got in zip(rules, seen):
            if got != expected:
                raise SystemExit(
                    f"{stem}: expected {expected} element(s) for .{cls}, matched "
                    f"{got}. The artboard changed — update DECORATIONS rather "
                    "than shipping the page without its behaviour."
                )

    return decorate, check


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
              replacer=None, decorate=None):
    """Emit `nodes` as JSX whose slot reads are shifted by `offset`."""
    variants, styles, values = variant_tables(per_locale_nodes)
    em = Emitter(
        assets=ASSETS,
        resolve_href=resolve_href,
        hrefs=hrefs,
        variants={k + start_a: v for k, v in variants.items()},
        slot_expr=lambda i: f"t[{i - offset}]",
        replace=replacer,
        decorate=decorate,
    )
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


def port_chrome() -> None:
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
    lines, em, styles, values = emit_part(
        fr, per_locale_nodes=head, start_i=0, start_a=0, offset=0,
        hrefs=routes, replacer=chrome_replacer,
    )
    n_head_anchors = em.k
    write(f"{BOARD_DIR}/site-header.tsx", chrome_component(
        "SiteHeader", "chrome", lines, em, styles, values,
        extra='import { LocaleSwitch } from "./locale-switch";',
        src="Main.dc.html — header; identical on every artboard",
    ))

    foot_i = len(text["fr"]) - n_foot
    flines, fem, fstyles, fvalues = emit_part(
        foot["fr"], per_locale_nodes=foot,
        start_i=foot_i, start_a=a_total - len(attr_stream(foot["fr"])),
        offset=foot_i,
        hrefs=routes[len(routes) - len(anchors(foot["fr"])):],
        replacer=chrome_replacer,
    )
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


def port_page(stem: str) -> None:
    page = PAGES[stem]
    groups, text, titles = aligned(stem)
    routes = page_routes(stem)

    variants = []
    for locs, nodes in groups:
        decorate, check_decorations = decorator_for(stem)
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
        )
        check_decorations()
        variants.append((tag, locs, lines, em, styles, values))

    write(f"{BOARD_DIR}/boards/{page.key}/index.tsx", board_index(page, variants))
    for tag, locs, lines, em, styles, values in variants:
        write(f"{BOARD_DIR}/boards/{page.key}/{tag}.tsx",
              board_variant(page, tag, locs, lines, em, styles, values))

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


def board_variant(page, tag, locs, lines, em, styles, values) -> str:
    name = page.comp if len(locs) == len(LOCALES) else f"{page.comp}{tag.upper()}"
    imports = []
    if em.needs_link:
        imports.append('import Link from "next/link";')
    imports.append('import type { Locale } from "@/lib/i18n/config";')
    imports.append(f'import {{ {page.key} as content }} from "../../content/{page.key}";')
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
    port_chrome()
    for stem in targets:
        if stem not in PAGES:
            raise SystemExit(f"unknown page {stem!r}; known: {', '.join(PAGES)}")
        port_page(stem)
