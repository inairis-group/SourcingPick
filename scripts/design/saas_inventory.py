"""Read the SaaS canvas and say what is in it.

The app artboards are not transcribed the way the marketing ones are — they
are pictures of a working product, full of sample data. What we take from them
is the design system and the copy. This script finds both:

  * whether each board's French and English versions are structurally
    identical, which is what lets their strings be zipped by position;
  * the copy itself, as fr/en pairs;
  * an outline of each board, so the shape of a screen can be read without
    reading 30kB of inline-styled markup.

Nothing here writes to the app. It reports.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from dcparse import Element, find, kids, parse, signature, slots, text_of  # noqa: E402

BOARDS = Path(
    "/tmp/claude-1000/-home-caystone-dev-jobs-inairis-sourcingpick/"
    "95253e99-b7de-417f-8083-0e8caea5e861/scratchpad/saas/project"
)


def stems() -> list[str]:
    out = []
    for p in sorted(BOARDS.glob("SaaS-*.dc.html")):
        out.append(p.name[: -len(".dc.html")])
    return out


def board(stem: str, locale: str) -> Element:
    name = f"{stem}.dc.html" if locale == "fr" else f"en-{stem}.dc.html"
    return parse(str(BOARDS / name))


def artboard(root: Element) -> Element:
    """The frame itself — the first div under <x-dc>, past the <helmet>."""
    dc = find(root, "x-dc")
    assert dc is not None
    for c in kids(dc):
        if c.tag == "div":
            return c
    raise SystemExit("no artboard div")


def outline(el: Element, depth: int = 0, out: list[str] | None = None) -> list[str]:
    """Headings and landmarks only — the skeleton of a screen."""
    if out is None:
        out = []
    for c in kids(el):
        if c.tag in ("h1", "h2", "h3", "h4"):
            out.append(f"{'  ' * depth}{c.tag}: {text_of(c)}")
            continue
        if c.tag in ("aside", "nav", "main", "header", "section", "table", "form"):
            out.append(f"{'  ' * depth}<{c.tag}>")
            outline(c, depth + 1, out)
            continue
        outline(c, depth, out)
    return out


def main() -> None:
    what = sys.argv[1] if len(sys.argv) > 1 else "align"

    if what == "align":
        bad = 0
        for stem in stems():
            fr, en = artboard(board(stem, "fr")), artboard(board(stem, "en"))
            sf, se = signature(fr), signature(en)
            if sf == se:
                print(f"ok    {len(slots(fr)):4d} strings  {stem}")
            else:
                bad += 1
                # Where they part company, so a divergence can be looked at
                # rather than guessed at.
                i = next(
                    (i for i, (a, b) in enumerate(zip(sf, se)) if a != b),
                    min(len(sf), len(se)),
                )
                print(f"DIVERGE at {i}  {stem}")
                print(f"        fr: {sf[i] if i < len(sf) else '<end>'}")
                print(f"        en: {se[i] if i < len(se) else '<end>'}")
        print(f"\n{len(stems())} boards, {bad} divergent")

    elif what == "outline":
        for stem in sys.argv[2:] or stems():
            print(f"=== {stem}")
            print("\n".join(outline(artboard(board(stem, "fr")))))

    elif what == "strings":
        for stem in sys.argv[2:] or stems():
            fr, en = artboard(board(stem, "fr")), artboard(board(stem, "en"))
            sf, se = slots(fr), slots(en)
            print(f"=== {stem}")
            if signature(fr) != signature(en):
                print("  (divergent — fr only)")
                for s in sf:
                    print(f"  {s}")
                continue
            for a, b in zip(sf, se):
                print(f"  {a}\n  | {b}" if a != b else f"  = {a}")


if __name__ == "__main__":
    main()
