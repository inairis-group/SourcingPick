#!/usr/bin/env python3
"""Prove the running site says what the artboard says.

The porter guarantees structure; this proves the result. For every page in
every locale it pulls the rendered <main>, reduces it to visible text in
document order, and compares that sequence to the artboard's. A mismatch is
printed with its neighbours, because the usual cause is an off-by-one in a
slot stream and the neighbours are what identify it.

Usage:  python3 scripts/design/verify.py [base-url]
"""

from __future__ import annotations

import html
import os
import re
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from port import CANVAS, LOCALES, PAGES, aligned, locale_file

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"

# Text our own components put on the page in place of the canvas's twelve
# languages — see `_design/locale-switch.tsx`.
SKIP_TAGS = ("script", "style", "svg", "noscript", "template")


def visible_text(markup: str) -> list[str]:
    for tag in SKIP_TAGS:
        markup = re.sub(rf"<{tag}\b.*?</{tag}>", " ", markup, flags=re.S | re.I)
    markup = re.sub(r"<!--.*?-->", " ", markup, flags=re.S)
    out: list[str] = []
    for chunk in re.split(r"<[^>]+>", markup):
        text = re.sub(r"\s+", " ", html.unescape(chunk)).strip()
        if text:
            out.append(text)
    return out


def main_of(page_html: str) -> str:
    m = re.search(r"<main[^>]*>(.*)</main>", page_html, re.S)
    return m.group(1) if m else ""


def fetch(path: str) -> str:
    # A browser-shaped request: the app negotiates locale and bot handling from
    # these headers, and urllib's defaults get routed somewhere else entirely.
    req = urllib.request.Request(
        f"{BASE}{path}",
        headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/140.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "fr",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def main() -> int:
    bad = 0
    for stem, page in PAGES.items():
        if page.route is None:
            continue
        for loc in LOCALES:
            path = f"/{loc}/{page.route}".rstrip("/")
            try:
                got = visible_text(main_of(fetch(path)))
            except Exception as exc:  # noqa: BLE001 - report and keep going
                bad += 1
                print(f"  FAIL {page.key:<11} {loc}  {path}: {exc}")
                continue
            want = text_slots(stem, loc)
            if want == got:
                print(f"  ok   {page.key:<11} {loc}  {len(got)} strings")
                continue
            bad += 1
            at = next(
                (i for i, (a, b) in enumerate(zip(want, got)) if a != b),
                min(len(want), len(got)),
            )
            print(f"  FAIL {page.key:<11} {loc}  artboard {len(want)} / page {len(got)}")
            for j in range(max(0, at - 2), min(max(len(want), len(got)), at + 3)):
                w = want[j] if j < len(want) else "—"
                g = got[j] if j < len(got) else "—"
                mark = "<<" if j == at else "  "
                print(f"       {j:>4} {mark} artboard: {w[:70]!r}")
                print(f"            {mark} page    : {g[:70]!r}")
    return 1 if bad else 0


def text_slots(stem: str, locale: str) -> list[str]:
    """Slots that are text nodes, in document order — no alt/aria attributes.

    `aligned` now returns one entry per distinct page shape, because a few
    languages genuinely differ; the locale's own nodes come from whichever
    group claims it.
    """
    groups, _, _ = aligned(stem)
    nodes = next(n[locale] for locs, n in groups if locale in locs)
    out: list[str] = []

    def walk(n):
        if isinstance(n, str):
            s = re.sub(r"\s+", " ", n.strip())
            if s:
                out.append(s)
            return
        # `<text>` inside an illustration is drawn, not written: the numerals
        # in the step circles on the home page. The HTML side drops whole
        # <svg> blocks, so the artboard side has to as well.
        if n.tag == "svg":
            return
        for c in n.children:
            walk(c)

    for n in nodes[2:-1]:
        walk(n)
    return out


if __name__ == "__main__":
    raise SystemExit(main())
