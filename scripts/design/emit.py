"""Re-emit a parsed artboard as TSX.

Everything the canvas wrote — every padding, every hex, every stroke width —
is carried across unchanged. The only things this pass is allowed to alter are
the four that cannot survive a copy: text (becomes a slot lookup so the four
locales share one component), blob URLs (become files we serve), `href="#"`
(becomes a route), and JSX's own spelling rules for attributes.
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
        variants: dict[int, tuple[str, int]] | None = None,
        slot_expr=lambda i: f"t[{i}]",
        replace=None,
    ) -> None:
        self.assets = assets
        self.resolve_href = resolve_href
        self.variants = variants or {}
        self.slot_expr = slot_expr
        self.replace = replace or (lambda el, em: None)
        self.i = 0
        self.a = 0
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

    def count_attrs(self, node) -> int:
        if isinstance(node, str):
            return 0
        n = sum(1 for k, _ in node.attrs if k not in L10N_ATTRS)
        return n + sum(self.count_attrs(c) for c in node.children)

    def skip(self, node) -> None:
        self.i += self.count_slots(node)
        self.a += self.count_attrs(node)

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

        tag = node.tag
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
                    obj = style_object(value)
                    if obj:
                        attrs.append(f"style={{{obj}}}")
                continue
            if name == "src" and value and value.startswith("/_blob/"):
                attrs.append(f'src="{self.assets[value.rsplit("/", 1)[1]]}"')
                continue
            if name == "href" and tag == "a":
                resolved = self.resolve_href(node, value or "")
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
