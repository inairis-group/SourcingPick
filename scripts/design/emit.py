"""Re-emit a parsed artboard as TSX.

Everything the canvas wrote — every padding, every hex, every stroke width —
is carried across unchanged. The only things this pass is allowed to alter are
the five that cannot survive a copy: text (becomes a slot lookup so the four
locales share one component), blob URLs (become files we serve), `href="#"`
(becomes a route), JSX's own spelling rules for attributes, and the handful of
pixel values that cannot survive a window narrower than the artboard — see
`responsive()` below, which wraps those in a custom property whose fallback
is the artboard's own value, so that at 1440px nothing has changed.
"""

from __future__ import annotations

import json
import re

from dcparse import Element, L10N_ATTRS

# --- CSS ---------------------------------------------------------------------


def split_decls(css: str) -> list[tuple[str, str]]:
    """Split a style attribute, respecting parens and quotes.

    `background-image: linear-gradient(30deg, rgba(...) 1px, transparent 1px)`
    contains both separators inside a function call, so a naive split on `;`
    and `:` mangles it.
    """
    out: list[tuple[str, str]] = []
    depth = 0
    quote = ""
    buf = ""
    for ch in css:
        if quote:
            buf += ch
            if ch == quote:
                quote = ""
            continue
        if ch in "\"'":
            quote = ch
            buf += ch
            continue
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == ";" and depth == 0:
            if buf.strip():
                out.append(_decl(buf))
            buf = ""
            continue
        buf += ch
    if buf.strip():
        out.append(_decl(buf))
    return [d for d in out if d[0]]


def _decl(chunk: str) -> tuple[str, str]:
    name, sep, value = chunk.partition(":")
    if not sep:
        return "", ""
    return name.strip(), value.strip()


def css_prop(name: str) -> str:
    """`background-image` -> backgroundImage; `-webkit-mask` -> WebkitMask.

    React spells a vendor prefix with a capital initial for every vendor except
    Microsoft's, which we do not use here.
    """
    if name.startswith("--"):
        return name  # custom property: React takes it verbatim
    lead_upper = name.startswith("-")
    parts = name.lstrip("-").split("-")
    out = parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])
    return out[:1].upper() + out[1:] if lead_upper else out


# The artboards ship no CSS reset, so the canvas authored them against the
# browser default — content-box — and writes `box-sizing: border-box` inline on
# the elements that want it. Our app has Tailwind's preflight, which makes
# everything border-box. That silently narrows any element setting both a pixel
# width and a padding: the quote page's heading column is drawn 900px wide and
# was rendering at 660.
#
# Restored per element rather than with a descendant reset on the frame. A
# reset would also catch the hand-written controls in _design/, which were
# written against border-box and break under content-box — which is how the
# language menu ended up with its selected row overflowing the menu.
_WIDTH = re.compile(r"\b(max-)?width\s*:\s*\d")
_PADDING = re.compile(r"\bpadding(-inline|-left|-right)?\s*:")


def needs_content_box(css: str) -> str:
    if "box-sizing" in css:
        return css  # the canvas already said which model it wants
    if _WIDTH.search(css) and _PADDING.search(css):
        return css.rstrip().rstrip(";") + "; box-sizing: content-box"
    return css


# --- responsive seams ----------------------------------------------------------
#
# The artboards are 1440px wide and say nothing about 390. A stylesheet cannot
# override an inline value without `!important`, and a file full of
# `[style*="font-size:62px"] { … !important }` is what this replaces. Instead
# the emitter wraps the few *system-level* values — type sizes, grid tracks,
# section gutters and rhythm, the large gaps — in a custom property whose
# fallback is the artboard's own value:
#
#     font-size: 62px      ->  font-size: var(--sp-fs-62, 62px)
#
# At desktop the property is undefined and the fallback renders: byte for byte
# the design. `board.module.css` defines each property under a media query and
# the cascade does the rest, with no `!important` and no attribute selectors.
# The names are keyed on the artboard's value, which is what makes them a type
# scale rather than a list of elements: every 46px heading on the site becomes
# the same size on a phone. The porter checks every name it emits against the
# names the stylesheet defines, so a re-export that introduces a new size fails
# the port instead of silently rendering at desktop size on a phone.
#
# Element-specific recomposition (the hero illustration, the phone mockups)
# is not done here — that is what DECORATIONS in port.py is for.

_PX = re.compile(r"^(\d+(?:\.\d+)?)px$")
_GUTTERS = {"section": "120px", "footer": "120px", "header": "96px"}


def _slug(v: str) -> str:
    return v.replace(".", "_")


def _grid_slug(value: str) -> str:
    """`340px repeat(4, minmax(0, 1fr))` -> `340-r4`; `minmax(0, 1fr) 640px` -> `fr-640`."""
    out: list[str] = []
    for tok in re.findall(r"repeat\([^)]*\)\)?|minmax\([^)]*\)|\S+", value):
        m = re.match(r"repeat\((\d+),\s*minmax\(0,\s*1fr\)\)", tok)
        if m:
            out.append(f"r{m.group(1)}")
            continue
        m = re.match(r"minmax\(0,\s*([\d.]+)fr\)", tok)
        if m:
            out.append("fr" if m.group(1) == "1" else f"{_slug(m.group(1))}fr")
            continue
        m = _PX.match(tok)
        if m:
            out.append(_slug(m.group(1)))
            continue
        raise SystemExit(f"grid track the porter does not know how to name: {tok!r} in {value!r}")
    return "-".join(out)


def _padding_parts(value: str) -> tuple[str, str, str, str] | None:
    parts = value.split()
    if not 1 <= len(parts) <= 4:
        return None
    t = parts[0]
    r = parts[1] if len(parts) > 1 else t
    b = parts[2] if len(parts) > 2 else t
    l = parts[3] if len(parts) > 3 else r
    return t, r, b, l


def _scaled(v: str) -> str:
    """A vertical padding, scaled by the rhythm factor; zero stays zero."""
    if v in ("0", "0px"):
        return "0"
    if not _PX.match(v):
        raise SystemExit(f"section padding the porter cannot scale: {v!r}")
    return f"calc({v} * var(--sp-vs, 1))"


def _font_size_base(base_css: str | None) -> float | None:
    if not base_css:
        return None
    for name, value in split_decls(base_css):
        if name == "font-size" and (m := _PX.match(value)):
            return float(m.group(1))
    return None


def responsive(
    css: str,
    tag: str,
    tokens: set[str] | None = None,
    base_css: str | None = None,
    known_sizes: set[float] = frozenset(),
) -> str:
    """Wrap the system-level values of one style attribute in custom properties.

    `base_css` is the French style for an element whose style varies by
    locale. Arabic and Chinese retune the display font's size — 59.9px where
    French has 62 — and that retuning is a ratio, not a size of its own: it is
    emitted as `calc(var(--sp-fs-62, 62px) * 0.9661)`, which is 59.9px at
    desktop and follows the French token everywhere else.
    """
    out: list[str] = []
    decls = split_decls(css)
    base_fs = _font_size_base(base_css)
    for name, value in decls:
        m = _PX.match(value)
        if name == "font-size" and m and base_fs and base_fs >= 15.5:
            ratio = float(m.group(1)) / base_fs
            token = f"--sp-fs-{_slug(str(base_fs).removesuffix('.0'))}"
            base_px = f"{str(base_fs).removesuffix('.0')}px"
            if abs(ratio - 1) < 1e-6:
                value = f"var({token}, {value})"
            else:
                value = f"calc(var({token}, {base_px}) * {ratio:.4f})"
        elif name == "font-size" and m and float(m.group(1)) >= 15.5:
            size = float(m.group(1))
            if known_sizes and size not in known_sizes:
                # A retuned size in a shape with no French twin (the Turkish
                # boards): read as a ratio of the nearest size the stylesheet
                # knows, which is how the designer arrived at it.
                base = min(known_sizes, key=lambda k: abs(size / k - 1))
                if abs(size / base - 1) <= 0.1:
                    token = f"--sp-fs-{_slug(str(base).removesuffix('.0'))}"
                    value = f"calc(var({token}, {str(base).removesuffix('.0')}px) * {size / base:.4f})"
                    if tokens is not None:
                        tokens.add(token)
                    out.append(f"{name}: {value}")
                    continue
            token = f"--sp-fs-{_slug(str(size).removesuffix('.0'))}"
            value = f"var({token}, {value})"
        elif name == "gap" and m and float(m.group(1)) >= 40:
            token = f"--sp-gap-{_slug(m.group(1))}"
            value = f"var({token}, {value})"
        elif name == "height" and tag == "header" and m:
            # The one height the sticky offset and the drawer both depend on.
            token = "--sp-header-h"
            value = f"var({token}, {value})"
        elif name == "height" and tag == "img" and m and "width: auto" in css:
            # The wordmark is the only image drawn by its height.
            token = "--sp-logo-h"
            value = f"var({token}, {value})"
        elif (
            name == "padding"
            and tag not in _GUTTERS
            and (parts := _padding_parts(value))
            and all(_PX.match(v) or v == "0" for v in value.split())
            and (top := _PX.match(parts[0]))
            and float(top.group(1)) >= 24
        ):
            # A card's inner padding — 40px on a phone is a third of the card.
            token = "--sp-pad-" + "-".join(_slug(v.replace("px", "")) for v in value.split())
            value = f"var({token}, {value})"
        elif name == "grid-template-columns":
            token = f"--sp-grid-{_grid_slug(value)}"
            value = f"var({token}, {value})"
        elif name == "grid-column" and value.startswith("span "):
            token = "--sp-span"
            value = f"var({token}, {value})"
        elif name == "padding" and tag in _GUTTERS:
            parts = _padding_parts(value)
            if parts is None:
                raise SystemExit(f"<{tag}> padding the porter cannot read: {value!r}")
            t, r, b, l = parts
            gutter = _GUTTERS[tag]
            if r != gutter or l != gutter:
                raise SystemExit(
                    f"<{tag}> is drawn with {r}/{l} gutters, not the {gutter} the "
                    "stylesheet reflows; teach emit.responsive about it"
                )
            token = "--sp-gutter" if tag != "header" else "--sp-gutter-header"
            value = f"{_scaled(t)} var({token}, {gutter}) {_scaled(b)}"
        else:
            token = None
        if token is not None and tokens is not None:
            tokens.add(token)
        out.append(f"{name}: {value}")
    return "; ".join(out)


def fluid_image(css: str, ratio_matches: bool) -> str:
    """Let a drawn image shrink with its column.

    `max-width: 100%` alone would squash an image whose height is fixed, so
    the height is released too — but only when the porter has checked, against
    the file we serve, that the drawn box has the image's own aspect ratio. In
    that case `height: auto` computes to exactly the drawn height at desktop,
    so nothing moves. An image drawn at another ratio carries `object-fit:
    contain` in the artboard and letterboxes itself; only its width is capped.
    """
    if "max-width" in css or not (_WIDTH.search(css)):
        return css
    if ratio_matches:
        # Rewritten in place: a style object cannot hold two `height`s.
        css = re.sub(r"(?<![-\w])height:\s*[\d.]+px", "height: auto", css)
    return css.rstrip().rstrip(";") + "; max-width: 100%"


def style_object(css: str) -> str:
    decls = split_decls(css)
    if not decls:
        return ""
    body = ", ".join(f"{json.dumps(css_prop(k))}: {json.dumps(v)}" for k, v in decls)
    return "{ " + body + " }"


# --- attributes --------------------------------------------------------------

RENAME = {
    "class": "className",
    "for": "htmlFor",
    "srcset": "srcSet",
    "tabindex": "tabIndex",
    "colspan": "colSpan",
    "rowspan": "rowSpan",
    "maxlength": "maxLength",
    "autocomplete": "autoComplete",
    "readonly": "readOnly",
    "novalidate": "noValidate",
    "enctype": "encType",
    "crossorigin": "crossOrigin",
    "datetime": "dateTime",
}

# Attributes that stay hyphenated in JSX.
KEEP_HYPHEN = ("aria-", "data-")

SVG_TAGS = {
    "clippath": "clipPath",
    "lineargradient": "linearGradient",
    "radialgradient": "radialGradient",
    "textpath": "textPath",
    "foreignobject": "foreignObject",
    "fegaussianblur": "feGaussianBlur",
    "feoffset": "feOffset",
    "feblend": "feBlend",
    "fecolormatrix": "feColorMatrix",
    "fecomposite": "feComposite",
    "femerge": "feMerge",
    "femergenode": "feMergeNode",
    "fedropshadow": "feDropShadow",
}

# HTMLParser lowercases attribute names, which is right for HTML and wrong for
# SVG, where `viewBox` is case-sensitive and React will warn about `viewbox`.
SVG_CASE = {
    "viewbox": "viewBox",
    "preserveaspectratio": "preserveAspectRatio",
    "gradientunits": "gradientUnits",
    "gradienttransform": "gradientTransform",
    "patternunits": "patternUnits",
    "patterncontentunits": "patternContentUnits",
    "clippathunits": "clipPathUnits",
    "maskunits": "maskUnits",
    "maskcontentunits": "maskContentUnits",
    "filterunits": "filterUnits",
    "primitiveunits": "primitiveUnits",
    "markerwidth": "markerWidth",
    "markerheight": "markerHeight",
    "refx": "refX",
    "refy": "refY",
    "stddeviation": "stdDeviation",
    "spreadmethod": "spreadMethod",
    "startoffset": "startOffset",
    "textlength": "textLength",
    "lengthadjust": "lengthAdjust",
    "pathlength": "pathLength",
    "attributename": "attributeName",
    "repeatcount": "repeatCount",
}


def jsx_attr_name(tag: str, name: str) -> str:
    if name.startswith(KEEP_HYPHEN):
        return name
    if name in SVG_CASE:
        return SVG_CASE[name]
    if name in RENAME:
        return RENAME[name]
    if tag == "input" and name == "value":
        return "defaultValue"
    if tag == "option" and name == "selected":
        return "defaultSelected"
    if name == "checked":
        return "defaultChecked"
    if "-" in name:
        parts = name.split("-")
        return parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])
    return name


# Attributes React wants as booleans rather than empty strings.
BOOLEAN_ATTRS = {"checked", "disabled", "required", "selected", "readonly", "multiple"}


# --- emitter -----------------------------------------------------------------


def _is_disclosure(node) -> bool:
    """An element whose header says whether it is open.

    `aria-expanded` is the canvas's own way of drawing a question as open. It
    is also exactly the contract a disclosure needs, so no page has to be
    named here: the FAQ, the home page and the pricing page all light up.
    """
    if isinstance(node, str):
        return False
    return any(
        not isinstance(c, str)
        and c.tag == "button"
        and c.attr("aria-expanded") is not None
        for c in node.children
    )


class Emitter:
    """Walks the tree, producing TSX lines.

    Three streams are tracked in lockstep with `dcparse`:

      * `i` — translatable strings, read as `t[i]`;
      * `a` — every other attribute, most of which are identical in all four
        locales and get inlined. The ones that are not are read as `s[k][lang]`
        (a whole style object) or `v[k][lang]` (a single value). Arabic mirrors
        arrow paths and drops the display font's negative tracking; Chinese
        re-sizes headings. Porting the French values alone would have shipped
        left-pointing "next" arrows on the RTL site.

    `resolve_href` is handed the anchor and its raw href and returns
    `(jsx_value, internal)` — internal anchors are emitted as `next/link`, the
    rest stay plain `<a>` — or None to drop the attribute entirely.
    """

    def __init__(
        self,
        *,
        assets: dict[str, str],
        resolve_href,
        hrefs: list | None = None,
        variants: dict[int, tuple[str, int]] | None = None,
        slot_expr=lambda i: f"t[{i}]",
        replace=None,
        decorate=None,
        retag=None,
        name_for=None,
        image_ratio=None,
        known_sizes: set[float] = frozenset(),
    ) -> None:
        self.known_sizes = known_sizes
        # (first question slot, first answer slot, end) for each Disclosure.
        self.disclosures: list[tuple[int, int, int]] = []
        # What `slot_expr` subtracts, when the port shifts slot reads.
        self.slot_offset = 0
        self.assets = assets
        # Given an element's `src`, says whether the drawn box keeps the
        # image's own aspect ratio — see `fluid_image`. None: never fluid.
        self.image_ratio = image_ratio or (lambda src, css: False)
        # Every custom property the emitted styles read, for the port to
        # check against the ones the stylesheet defines.
        self.tokens: set[str] = set()
        self.resolve_href = resolve_href
        # One entry per <a> in document order — see the note on routes in
        # port.py. Anchors are resolved by position because text is ambiguous:
        # in English the FAQ's "Contrôle" tab and the footer's "Vérification"
        # link are both "Inspection", going to different places.
        self.hrefs = hrefs or []
        self.variants = variants or {}
        self.slot_expr = slot_expr
        self.replace = replace or (lambda el, em: None)
        # Adds a class to an element without otherwise touching it — the one
        # way behaviour is attached to transcribed markup. See DECORATIONS in
        # port.py.
        self.decorate = decorate or (lambda el: None)
        # Swaps the element's tag for a component while keeping its attributes
        # and its children, which stay server-rendered. This is how a
        # transcribed <form> gets an action without the fields it contains
        # being pulled into the client bundle.
        self.retag = retag or (lambda el: None)
        # Names a control the canvas left without an id.
        self.name_for = name_for or (lambda el: None)
        self.components: set[str] = set()
        # Radio groups, so each input can be given the index of its option.
        self._radio: dict[str, int] = {}
        self.i = 0
        self.a = 0
        self.k = 0
        self.needs_link = False

    def emit(self, el: Element, indent: int = 0) -> list[str]:
        return self._node(el, indent)

    def children(self, el: Element, indent: int) -> list[str]:
        out: list[str] = []
        for c in el.children:
            out.extend(self._node(c, indent))
        return out

    # -- counting, for subtrees a hand-written component stands in for

    def count_slots(self, node) -> int:
        if isinstance(node, str):
            return 1 if node.strip() else 0
        n = sum(1 for name in L10N_ATTRS if node.attr(name))
        return n + sum(self.count_slots(c) for c in node.children)

    def _generic_class(self, node) -> str | None:
        """Classes that follow from the markup, not from which page it is on.

        A label wrapping a radio is a choice chip. The canvas can only draw one
        state, so it hard-codes the selected outline onto whichever option the
        designer left checked; `.sp-choice` makes that outline follow the radio
        instead. The rule is structural, so it holds for any such control the
        canvas ever draws.
        """
        if node.tag == "span" and "border: 1px dashed #D99A00" in (node.attr("style") or ""):
            # The amber "to be confirmed" chip. Drawn `white-space: nowrap`,
            # which a Russian placeholder cannot honour on a phone.
            return "sp-placeholder"
        if node.tag != "label":
            return None
        radios = [
            c
            for c in node.children
            if not isinstance(c, str)
            and c.tag == "input"
            and c.attr("type") == "radio"
        ]
        return "sp-choice" if radios else None

    def _is_figure(self, node) -> bool:
        """A box drawn to the exact size of the one image it holds.

        The warehouse and about pages wrap their illustration in a
        `<div dir="ltr" style="width: 640px; height: 471px">`. The image
        inside is made fluid; this lets the box follow it, under the same
        ratio check, so `height: auto` is again the drawn height at desktop.
        """
        if node.tag != "div":
            return False
        kids = [c for c in node.children if not isinstance(c, str) or c.strip()]
        if len(kids) != 1 or isinstance(kids[0], str) or kids[0].tag != "img":
            return False
        img = kids[0]
        box, pic = node.attr("style") or "", img.attr("style") or ""
        bw = re.search(r"(?<![-\w])width:\s*(\d+)px", box)
        iw = re.search(r"(?<![-\w])width:\s*(\d+)px", pic)
        return bool(bw and iw and bw.group(1) == iw.group(1)) and self.image_ratio(
            img.attr("src") or "", pic
        )

    def count_anchors(self, node) -> int:
        if isinstance(node, str):
            return 0
        n = 1 if node.tag == "a" else 0
        return n + sum(self.count_anchors(c) for c in node.children)

    def count_attrs(self, node) -> int:
        if isinstance(node, str):
            return 0
        n = sum(1 for k, _ in node.attrs if k not in L10N_ATTRS)
        return n + sum(self.count_attrs(c) for c in node.children)

    def skip(self, node) -> None:
        self.i += self.count_slots(node)
        self.a += self.count_attrs(node)
        self.k += self.count_anchors(node)

    # -- internals

    def _node(self, node, indent: int) -> list[str]:
        pad = "  " * indent
        if isinstance(node, str):
            return self._text(node, pad)

        sub = self.replace(node, self)
        if sub is not None:
            # The hook is responsible for calling `skip`; leaving a subtree's
            # slots unclaimed would shift every later string on the page.
            return [pad + line for line in sub]

        # HTMLParser lowercases tag names too; SVG's camel-cased elements need
        # their case back or React renders an unknown element and TypeScript
        # refuses `clippath`.
        tag = SVG_TAGS.get(node.tag, node.tag)
        # Claimed in L10N_ATTRS order, matching `dcparse.slots`; document order
        # would shift indices on any element carrying two of them.
        claimed: dict[str, int] = {}
        for name in L10N_ATTRS:
            if node.attr(name):
                claimed[name] = self.i
                self.i += 1

        attrs: list[str] = []
        is_link = False
        for name, value in node.attrs:
            if name in L10N_ATTRS:
                # An empty one — `alt=""` on a decorative image — carries no
                # string to translate but still has to be emitted, and must not
                # consume an index in either stream.
                if name in claimed:
                    attrs.append(
                        f"{jsx_attr_name(tag, name)}={{{self.slot_expr(claimed[name])}}}"
                    )
                else:
                    attrs.append(f'{jsx_attr_name(tag, name)}=""')
                continue
            var = self.variants.get(self.a)
            self.a += 1

            if name == "style":
                if var:
                    attrs.append(f"style={{s[{var[1]}][lang]}}")
                elif value:
                    css = needs_content_box(value)
                    if tag == "img":
                        css = fluid_image(css, self.image_ratio(node.attr("src") or "", css))
                    elif self._is_figure(node):
                        css = fluid_image(css, True)
                    obj = style_object(
                        responsive(css, tag, self.tokens, known_sizes=self.known_sizes)
                    )
                    if obj:
                        attrs.append(f"style={{{obj}}}")
                continue
            if name == "src" and value and value.startswith("/_blob/"):
                attrs.append(f'src="{self.assets[value.rsplit("/", 1)[1]]}"')
                continue
            if name == "href" and tag == "a":
                resolved = self.resolve_href(self.hrefs[self.k], value or "")
                self.k += 1
                if resolved is None:
                    continue
                href, is_link = resolved
                attrs.append(f"href={href}")
                continue
            if var:
                attrs.append(f"{jsx_attr_name(tag, name)}={{v[{var[1]}][lang]}}")
                continue
            if value is None or name in BOOLEAN_ATTRS:
                # `checked="checked"` is HTML's way of saying true; JSX wants
                # the bare prop.
                attrs.append(f"{jsx_attr_name(tag, name)}")
                continue
            attrs.append(f"{jsx_attr_name(tag, name)}={json.dumps(value)}")

        # A decoration is either a class or a set of attributes. Ids matter
        # here: an in-page anchor needs something to land on, and the canvas
        # draws the target without giving it one.
        decoration = self.decorate(node) or self._generic_class(node)
        if isinstance(decoration, str):
            decoration = {"className": decoration}
        if decoration:
            for k, v in decoration.items():
                attrs.insert(0, f'{k}="{v}"')

        # -- form plumbing, all of it derived rather than declared ------------
        #
        # The canvas draws a form; it does not submit one. Three rules turn the
        # drawing into something a browser can post, and none of them needs to
        # know what page they are on:

        if tag in ("input", "select", "textarea"):
            # 1. A control the designer gave an id but no name. The id is the
            #    design's own, so the field names are too.
            el_id, el_name = node.attr("id"), node.attr("name")
            if el_id and not el_name:
                attrs.append(f'name="{el_id}"')
            elif not el_id and not el_name:
                declared = self.name_for(node)
                if declared:
                    attrs.append(f'name="{declared}"')
            # 2. Radios in a group carry no value, so a checked one would post
            #    "on" and say nothing about which option it was. Numbering them
            #    by position is the same contract the rest of this port runs
            #    on; the server maps index to meaning.
            if node.attr("type") == "radio" and el_name:
                idx = self._radio.get(el_name, 0)
                self._radio[el_name] = idx + 1
                attrs.append(f'value="{idx}"')

        # Asked once and reused: the hook counts its matches so a re-export
        # that changes the markup fails the port, and calling it twice would
        # make every match look like two.
        retagged = self.retag(node)

        if not retagged and _is_disclosure(node):
            self.components.add("Disclosure")
            head = f"Disclosure{'' if not attrs else ' ' + ' '.join(attrs)}"
            # Which slots are the question (the header button) and which the
            # answer (the rest), so a page can describe its questions to search
            # engines without a second copy of the text. Emitted child by child,
            # exactly as `children()` would, to read the slot counter between.
            start, split, inner = self.i, None, []
            for c in node.children:
                inner.extend(self._node(c, indent + 1))
                if split is None and isinstance(c, Element):
                    split = self.i
            o = self.slot_offset
            self.disclosures.append((start - o, (self.i if split is None else split) - o, self.i - o))
            return [f"{pad}<{head}>", *inner, f"{pad}</Disclosure>"]

        if retagged:
            component, extra = retagged
            self.components.add(component)
            attrs.extend(extra)
            tag_out = component
        elif tag == "a" and not is_link and not any(
            a.startswith("href=") for a in attrs
        ):
            # 3. An anchor the route map resolved to nothing is a submit
            #    control the canvas had no way to draw as one.
            tag_out = "SubmitButton"
            self.components.add("SubmitButton")
        else:
            tag_out = "Link" if (tag == "a" and is_link) else tag
        if tag_out == "Link":
            self.needs_link = True

        head = tag_out + ("" if not attrs else " " + " ".join(attrs))
        inner = self.children(node, indent + 1)
        if not inner:
            return [f"{pad}<{head} />"]
        if len(inner) == 1 and len(pad) + len(head) + len(inner[0]) < 96:
            return [f"{pad}<{head}>{inner[0].strip()}</{tag_out}>"]
        return [f"{pad}<{head}>", *inner, f"{pad}</{tag_out}>"]

    def _text(self, raw: str, pad: str) -> list[str]:
        body = raw.strip()
        if not body:
            return []
        lead = '{" "}' if raw[:1].isspace() and raw[:1] != "\n" else ""
        trail = '{" "}' if raw[-1:].isspace() and raw[-1:] != "\n" else ""
        expr = self.slot_expr(self.i)
        self.i += 1
        return [f"{pad}{lead}{{{expr}}}{trail}"]
