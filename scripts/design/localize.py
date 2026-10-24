"""Translated boards: the canvas's French layout carrying another language.

The canvas draws some pages in French only (Livraisons), or redrew French
after the other languages were done (the October Tarifs, whose prices the
September boards in the eleven other languages no longer match). Those pages
get their other languages from `translations/<page>/<locale>.json`: the
French artboard's nodes, copied, with the translated strings written back in
the porter's own slot order. The rest of the pipeline cannot tell the
difference — shapes, slot streams, per-locale style tables and verify.py all
read the materialized board.

A translation file is:

    {
      "base": "fr",          # "fr": French nodes, translated text
                             # "own": the locale's own artboard, rewritten text
      "title": "...",        # the page's <title>, optional
      "text": ["...", ...]   # every slot of the page's sections, in order
    }

and `translations/chrome/<locale>.json` rewrites the header and footer
({"header": [...], "footer": [...]}), which are shared by every page.

Chinese and Arabic are not French with other words. When the canvas's
designer drew them, they changed the typography the same way on every page,
and `localize_styles` applies those same changes to the copied French nodes
(derived by diffing the French artboards with the designer's Chinese and
Arabic ones; see `check_rules` below):

- the display, mono and body faces become Noto Sans SC (zh) or Readex Pro (ar);
  the mono face stays where the text is figures only ("01");
- no capitals and no tracking: `text-transform: uppercase` and every
  letter-spacing go to none / 0;
- display line heights below 1.3 open to 1.3 (CJK and Arabic glyphs are tall);
- the mono labels go from 12.5px to 13.5px;
- Chinese headings set in the display face go from weight 600 to 700;
- Arabic mirrors the arrows and the closing band's speech bubble.
"""

from __future__ import annotations

import copy
import json
import os
import re

from dcparse import L10N_ATTRS, Element
from emit import split_decls

HERE = os.path.dirname(os.path.abspath(__file__))
TRANSLATIONS = os.path.join(HERE, "translations")

FACES = {
    "zh": "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    "ar": "'Readex Pro', 'Segoe UI', Tahoma, sans-serif",
}
DISPLAY = "'Unbounded', 'Trebuchet MS', sans-serif"
MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace"
BODY = "'Onest', 'Segoe UI', system-ui, sans-serif"

# Arabic reads right to left: the arrow on every button points the other way.
AR_PATHS = {
    "M5 12h14": "M19 12H5",
    "M13 6l6 6-6 6": "M11 6l-6 6 6 6",
    "M19 12H5": "M5 12h14",
    "M11 6l-6 6 6 6": "M13 6l6 6-6 6",
    "M9 6l6 6-6 6": "M15 6l-6 6 6 6",
}


def load(page: str, loc: str) -> dict | None:
    path = os.path.join(TRANSLATIONS, page, f"{loc}.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _own_text(el: Element) -> str:
    out: list[str] = []

    def walk(n):
        if isinstance(n, str):
            out.append(n)
            return
        for c in n.children:
            walk(c)

    walk(el)
    return re.sub(r"\s+", " ", "".join(out)).strip()


def _figures_only(el: Element) -> bool:
    text = _own_text(el)
    return bool(text) and not re.search(r"[^\W\d_]", text)


def _css(decls: list[tuple[str, str]]) -> str:
    return " ".join(f"{k}: {v};" for k, v in decls)


def localize_style(css: str, el: Element, loc: str) -> str:
    decls = split_decls(css)
    props = dict(decls)
    face = props.get("font-family")
    keep_mono = face == MONO and _figures_only(el)
    out = []
    for k, v in decls:
        if k == "font-family" and v in (DISPLAY, MONO, BODY) and not keep_mono:
            v = FACES[loc]
        elif k == "text-transform" and v == "uppercase":
            v = "none"
        elif k == "letter-spacing" and v not in ("0", "normal"):
            v = "0"
        elif k == "line-height" and re.fullmatch(r"1(\.\d+)?", v) and float(v) < 1.3 and face == DISPLAY:
            v = "1.3"
        elif k == "font-size" and v == "12.5px" and face == MONO and not keep_mono:
            v = "13.5px"
        elif k == "font-weight" and v == "600" and loc == "zh" and face == DISPLAY and el.tag != "span":
            v = "700"
        out.append((k, v))
    css = _css(out)
    if loc == "ar":
        css = _mirror_bubble(css)
    return css


def _mirror_bubble(css: str) -> str:
    # The mascot's speech bubble on the closing band hangs off its left edge,
    # its pointed corner towards the mascot; Arabic hangs it off the right.
    if "border-radius: 18px 18px 4px 18px;" in css and "left: -60px;" in css:
        css = css.replace("left: -60px;", "right: -30px;")
        css = css.replace("border-radius: 18px 18px 4px 18px;", "border-radius: 18px 18px 18px 4px;")
    return css


def localize_styles(nodes: list[Element], loc: str) -> None:
    if loc not in FACES:
        return

    def walk(n):
        if isinstance(n, str):
            return
        attrs = []
        for k, v in n.attrs:
            if k == "style" and v:
                v = localize_style(v, n, loc)
            elif k == "d" and loc == "ar" and v in AR_PATHS:
                v = AR_PATHS[v]
            attrs.append((k, v))
        n.attrs = attrs
        for c in n.children:
            walk(c)

    for n in nodes:
        walk(n)


def write_text(nodes: list[Element], strings: list[str], where: str) -> None:
    """Write `strings` into `nodes` in the order `dcparse.slots` reads them.

    A text node keeps its own surrounding whitespace (the space before an
    inline <strong> is part of the layout, not of the string)."""
    it = iter(strings)
    count = 0

    def take():
        nonlocal count
        try:
            s = next(it)
        except StopIteration:
            raise SystemExit(f"{where}: too few strings (the board has more slots)")
        count += 1
        return s

    def walk(n, parent):
        if isinstance(n, str):
            return
        attrs = []
        for k, v in n.attrs:
            if k in L10N_ATTRS and v:
                v = take()
            attrs.append((k, v))
        n.attrs = attrs
        for i, c in enumerate(n.children):
            if isinstance(c, str):
                s = c.strip()
                if s:
                    lead = c[: len(c) - len(c.lstrip())]
                    trail = c[len(c.rstrip()):]
                    n.children[i] = lead + take() + trail
            else:
                walk(c, n)

    for n in nodes:
        walk(n, None)
    rest = sum(1 for _ in it)
    if rest:
        raise SystemExit(f"{where}: {rest} string(s) too many (the board has {count} slots)")


def fixed(s: str, parent_tag: str | None = None) -> bool:
    """A slot that is not prose: keyframes, figures, codes. Copied verbatim."""
    return parent_tag == "style" or not re.search(r"[^\W\d_]", s)


def slot_parents(nodes: list[Element]) -> list[str]:
    """The tag that holds each slot, in slot order (for `fixed`)."""
    out: list[str] = []

    def walk(n):
        if isinstance(n, str):
            return
        for k in L10N_ATTRS:
            if n.attr(k):
                out.append("@" + k)
        for c in n.children:
            if isinstance(c, str):
                if c.strip():
                    out.append(n.tag)
            else:
                walk(c)

    for n in nodes:
        walk(n)
    return out


def translated_sections(fr_sections: list[Element], loc: str, strings: list[str],
                        where: str) -> list[Element]:
    nodes = copy.deepcopy(fr_sections)
    localize_styles(nodes, loc)
    write_text(nodes, strings, where)
    return nodes
