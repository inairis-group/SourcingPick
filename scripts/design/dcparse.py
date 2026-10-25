"""Parse a `.dc.html` artboard into a tree we can re-emit as JSX.

The canvas exports plain HTML with every style inline, which makes it a
faithful description of the design rather than an approximation of it. Porting
that markup mechanically is the whole point: a hand-written interpretation
drifts, a transcription cannot.
"""

from __future__ import annotations

import html
import re
from dataclasses import dataclass, field
from html.parser import HTMLParser

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}


@dataclass
class Element:
    tag: str
    attrs: list[tuple[str, str | None]]
    children: list["Element | str"] = field(default_factory=list)

    def attr(self, name: str) -> str | None:
        for k, v in self.attrs:
            if k == name:
                return v
        return None


# The brand is written SourcingPick, in one word, as its logo and its legal
# notice write it; the canvas sometimes splits it. Normalised as it is read,
# so the porter writes it right and the verifier compares like with like.
def brand(s: str) -> str:
    return re.sub(r"Sourcing\s+Pick", "SourcingPick", s)


class _Builder(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Element("#root", [])
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        el = Element(tag, [(k, brand(v) if v else v) for k, v in attrs])
        self.stack[-1].children.append(el)
        if tag not in VOID:
            self.stack.append(el)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Element(tag, [(k, brand(v) if v else v) for k, v in attrs]))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(brand(data))


def parse(path: str) -> Element:
    src = open(path, encoding="utf-8").read()
    # The artboard carries a `<script type="text/x-dc">` runtime block whose
    # body is JavaScript. HTMLParser handles script CDATA correctly, but the
    # block is noise for us and its `data-props` attribute holds a JSON blob
    # with quotes that only confuse later passes.
    src = re.sub(r"<script\b.*?</script>", "", src, flags=re.S)
    b = _Builder()
    b.feed(src)
    return b.root


def find(el: Element, tag: str) -> Element | None:
    """First descendant with `tag`, document order."""
    for c in el.children:
        if isinstance(c, Element):
            if c.tag == tag:
                return c
            hit = find(c, tag)
            if hit is not None:
                return hit
    return None


def kids(el: Element) -> list[Element]:
    return [c for c in el.children if isinstance(c, Element)]


def text_of(el: Element) -> str:
    out: list[str] = []

    def walk(n):
        if isinstance(n, str):
            out.append(n)
            return
        for c in n.children:
            walk(c)

    walk(el)
    return re.sub(r"\s+", " ", "".join(out)).strip()


# --- localizable slots -------------------------------------------------------

# Attributes that hold prose. Order is fixed so the slot stream of two locales
# of the same artboard lines up index for index.
L10N_ATTRS = ("alt", "aria-label", "placeholder", "title", "value")


def slots(el: Element) -> list[str]:
    """Every translatable string under `el`, in document order.

    Attributes first, then text, per element. `Element.attrs` order is the
    source document's, which the exporter keeps stable across locales.
    """
    out: list[str] = []

    def walk(n):
        if isinstance(n, str):
            s = n.strip()
            if s:
                out.append(re.sub(r"\s+", " ", s))
            return
        for name in L10N_ATTRS:
            v = n.attr(name)
            if v:
                out.append(v)
        for c in n.children:
            walk(c)

    walk(el)
    return out


def signature(el: Element) -> list[str]:
    """Structural fingerprint — tags and attribute names, no values.

    Two artboards that share a signature can have their slot streams zipped
    safely; one that doesn't would silently shift every string after the
    divergence, which is how a translation ends up under the wrong heading.
    """
    out: list[str] = []

    def walk(n):
        if isinstance(n, str):
            if n.strip():
                out.append("#text")
            return
        out.append(n.tag + "[" + ",".join(k for k, _ in n.attrs) + "]")
        for c in n.children:
            walk(c)

    walk(el)
    return out
