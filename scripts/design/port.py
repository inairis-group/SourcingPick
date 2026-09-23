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

LOCALES = ("fr", "en", "zh", "ar")

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


def resolve_href(node: Element, raw: str):
    """-> (jsx value, is_internal_route) | None"""
    if raw.startswith("mailto:") or raw.startswith("http"):
        return json.dumps(raw), False
    label = text_of(node)
    if not label:
        # The only text-free anchor in the canvas is the wordmark.
        return "{`/${lang}`}", True
    if label in IN_PAGE:
        return fragment(IN_PAGE[label])
    if raw.startswith("#") and raw != "#":
        return fragment(raw)
    if label in SUBMITS:
        return None
    if label in ROUTES:
        path = ROUTES[label]
        if path == "/":
            return "{`/${lang}`}", True
        if path.startswith("/#"):
            return "{`/${lang}" + path[1:] + "`}", True
        return "{`/${lang}" + path + "`}", True
    raise SystemExit(f"unmapped link: {label!r} (href={raw!r})")


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
    streams = {loc: attr_stream(per_locale[loc]) for loc in LOCALES}
    n = len(streams["fr"])
    variants: dict[int, tuple[str, int]] = {}
    styles: list[dict[str, dict[str, str]]] = []
    values: list[dict[str, str]] = []

    for idx in range(n):
        tag, name, _ = streams["fr"][idx]
        vals = {loc: streams[loc][idx][2] for loc in LOCALES}
        if len({v or "" for v in vals.values()}) == 1:
            continue
        if name == "style":
            variants[idx] = ("style", len(styles))
            styles.append(
                {loc: dict(css_object(vals[loc] or "")) for loc in LOCALES}
            )
        else:
            variants[idx] = ("attr", len(values))
            values.append({loc: vals[loc] or "" for loc in LOCALES})
    return variants, styles, values


def css_object(css: str) -> list[tuple[str, str]]:
    return [(css_prop(k), v) for k, v in split_decls(css)]


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


def board_component(page, lines: list[str], *, needs_link: bool, has_styles: bool,
                    has_values: bool) -> str:
    imports = []
    if needs_link:
        imports.append('import Link from "next/link";')
    imports.append('import type { Locale } from "@/lib/i18n/config";')
    imports.append(f'import {{ {page.key} as content }} from "../content/{page.key}";')
    reads = ["  const t = content.text[lang];"]
    if has_styles:
        reads.append("  const s = content.styles;")
    if has_values:
        reads.append("  const v = content.values;")
    body = "\n".join("      " + ln for ln in lines)
    return (
        BANNER.format(src=page.board)
        + BOARD_DOC.format(key=page.key)
        + "\n\n"
        + "\n".join(imports)
        + "\n\n"
        + f"export function {page.comp}({{ lang }}: {{ lang: Locale }}) {{\n"
        + "\n".join(reads)
        + "\n\n  return (\n    <>\n"
        + body
        + "\n    </>\n  );\n}\n"
    )


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


def content_module(page_key: str, src: str, text: dict[str, list[str]],
                   styles: list, values: list, *, titles: dict[str, str] | None = None) -> str:
    def text_block() -> str:
        rows = []
        for loc in LOCALES:
            items = ",\n      ".join(js(x) for x in text[loc])
            rows.append(f"    {loc}: [\n      {items},\n    ],")
        return "  text: {\n" + "\n".join(rows) + "\n  },"

    def style_block() -> str:
        if not styles:
            return "  styles: [] as Record<Locale, CSSProperties>[],"
        rows = []
        for entry in styles:
            per = ", ".join(
                f"{loc}: {{ "
                + ", ".join(f"{js(k)}: {js(v)}" for k, v in entry[loc].items())
                + " }"
                for loc in LOCALES
            )
            rows.append("    { " + per + " },")
        return "  styles: [\n" + "\n".join(rows) + "\n  ] as Record<Locale, CSSProperties>[],"

    def value_block() -> str:
        if not values:
            return "  values: [] as Record<Locale, string>[],"
        rows = [
            "    { " + ", ".join(f"{loc}: {js(e[loc])}" for loc in LOCALES) + " },"
            for e in values
        ]
        return "  values: [\n" + "\n".join(rows) + "\n  ] as Record<Locale, string>[],"

    title_block = ""
    if titles:
        title_block = (
            "  title: { "
            + ", ".join(f"{loc}: {js(titles[loc])}" for loc in LOCALES)
            + " } as Record<Locale, string>,\n"
            + "  description: { "
            + ", ".join(f"{loc}: {js(lead_paragraph(text[loc]))}" for loc in LOCALES)
            + " } as Record<Locale, string>,\n"
        )

    return (
        BANNER.format(src=src)
        + "//\n"
        + "// Position is the contract: index n names the same slot in all four\n"
        + "// locales, proved against the artboards' structural signatures.\n"
        + 'import type { CSSProperties } from "react";\n'
        + 'import type { Locale } from "@/lib/i18n/config";\n\n'
        + f"export const {page_key} = {{\n"
        + title_block
        + text_block()
        + "\n"
        + style_block()
        + "\n"
        + value_block()
        + "\n};\n"
    )


BOARD_DIR = "src/app/[lang]/(marketing)/_design"


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
    """Parse all four locales of a page and prove they can be zipped."""
    parts = {
        loc: board_parts(os.path.join(CANVAS, locale_file(stem, loc)))
        for loc in LOCALES
    }
    whole = {
        loc: [parts[loc][0], parts[loc][1], *parts[loc][2], parts[loc][3]]
        for loc in LOCALES
    }
    base = [x for n in whole["fr"] for x in signature(n)]
    for loc in LOCALES[1:]:
        other = [x for n in whole[loc] for x in signature(n)]
        if other != base:
            at = next(
                (i for i, (a, b) in enumerate(zip(base, other)) if a != b), len(base)
            )
            raise SystemExit(
                f"{stem}: the {loc} artboard diverges from fr at node {at} "
                f"({base[at:at+1]} vs {other[at:at+1]}). Strings cannot be "
                "zipped by position — re-export the canvas."
            )
    text = {loc: [x for n in whole[loc] for x in slots(n)] for loc in LOCALES}
    titles = {
        loc: page_title(os.path.join(CANVAS, locale_file(stem, loc)))
        for loc in LOCALES
    }
    return whole, text, titles


def emit_part(nodes, *, per_locale_nodes, start_i, start_a, offset, replacer=None):
    variants, styles, values = variant_tables(per_locale_nodes)
    em = Emitter(
        assets=ASSETS,
        resolve_href=resolve_href,
        variants={k + start_a: v for k, v in variants.items()},
        slot_expr=lambda i: f"t[{i - offset}]",
        replace=replacer,
    )
    em.i, em.a = start_i, start_a
    lines = [ln for n in nodes for ln in em.emit(n, 3)]
    return lines, em, styles, values


def port_chrome() -> None:
    """Header and footer — byte-identical on all thirteen artboards."""
    whole, text, _ = aligned("Accueil")
    n_head = sum(len(slots(n)) for n in whole["fr"][:2])
    a_head = len(attr_stream(whole["fr"][:2]))
    n_foot = len(slots(whole["fr"][-1]))
    total = len(text["fr"])
    total_a = len(attr_stream(whole["fr"]))
    a_foot = len(attr_stream([whole["fr"][-1]]))

    lines, em, styles, values = emit_part(
        whole["fr"][:2],
        per_locale_nodes={loc: whole[loc][:2] for loc in LOCALES},
        start_i=0, start_a=0, offset=0, replacer=chrome_replacer,
    )
    write(f"{BOARD_DIR}/site-header.tsx", chrome_component(
        "SiteHeader", "chrome", lines, em, styles, values,
        extra='import { LocaleSwitch } from "./locale-switch";',
        src="Main.dc.html — header; identical on every artboard",
    ))
    write(f"{BOARD_DIR}/content/chrome.ts", content_module(
        "chrome", "*-Accueil.dc.html (header)",
        {loc: text[loc][:n_head] for loc in LOCALES}, styles, values,
    ))

    flines, fem, fstyles, fvalues = emit_part(
        [whole["fr"][-1]],
        per_locale_nodes={loc: [whole[loc][-1]] for loc in LOCALES},
        start_i=total - n_foot, start_a=total_a - a_foot,
        offset=total - n_foot, replacer=chrome_replacer,
    )
    write(f"{BOARD_DIR}/site-footer.tsx", chrome_component(
        "SiteFooter", "chromeFooter", flines, fem, fstyles, fvalues,
        extra='import { LocaleRow } from "./locale-switch";',
        src="Main.dc.html — footer; identical on every artboard",
    ))
    write(f"{BOARD_DIR}/content/chromeFooter.ts", content_module(
        "chromeFooter", "*-Accueil.dc.html (footer)",
        {loc: text[loc][total - n_foot:] for loc in LOCALES}, fstyles, fvalues,
    ))
    print(f"  chrome: header {n_head} strings, footer {n_foot} strings")


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
    body = "\n".join("      " + ln for ln in lines)
    return (
        BANNER.format(src=src)
        + BOARD_DOC.format(key=key)
        + "\n\n"
        + "\n".join(imports)
        + "\n\n"
        + f"export function {name}({{ lang }}: {{ lang: Locale }}) {{\n"
        + "\n".join(reads)
        + "\n\n  return (\n    <>\n"
        + body
        + "\n    </>\n  );\n}\n"
    )


def port_page(stem: str) -> None:
    page = PAGES[stem]
    whole, text, titles = aligned(stem)
    sections = {loc: whole[loc][2:-1] for loc in LOCALES}
    start_i = sum(len(slots(n)) for n in whole["fr"][:2])
    start_a = len(attr_stream(whole["fr"][:2]))
    end_i = len(text["fr"]) - len(slots(whole["fr"][-1]))

    lines, em, styles, values = emit_part(
        sections["fr"], per_locale_nodes=sections,
        start_i=start_i, start_a=start_a, offset=start_i,
    )
    write(f"{BOARD_DIR}/boards/{page.key}.tsx", board_component(
        page, lines, needs_link=em.needs_link,
        has_styles=bool(styles), has_values=bool(values),
    ))
    write(f"{BOARD_DIR}/content/{page.key}.ts", content_module(
        page.key, page.board,
        {loc: text[loc][start_i:end_i] for loc in LOCALES}, styles, values,
        titles=titles,
    ))
    print(f"  {stem:<18} -> {page.key:<10} {end_i - start_i:>3} strings, "
          f"{len(styles):>3} locale styles, {len(lines):>4} lines")


if __name__ == "__main__":
    targets = sys.argv[1:] or list(PAGES)
    port_chrome()
    for stem in targets:
        if stem not in PAGES:
            raise SystemExit(f"unknown page {stem!r}; known: {', '.join(PAGES)}")
        port_page(stem)
