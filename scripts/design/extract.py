"""
Pull structure and copy out of a design canvas artboard.

The artboards are fixed-size absolutely-positioned mockups (1440x8000). We are
not transplanting their CSS — we rebuild responsively — so what we need out of
them is the *content tree*: section order, headings, body copy, list items,
link labels and button labels, in document order.

Run:  python3 scripts/design/extract.py <artboard.dc.html>
"""
import re, sys, json, html
from html.parser import HTMLParser

SKIP = {"script", "style", "svg", "path", "circle", "rect", "helmet", "line", "polyline", "defs", "g"}
BLOCK = {"h1","h2","h3","h4","p","li","a","button","span","div","td","th","label","strong","em","dt","dd"}

class Extract(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth_skip = 0
        self.stack = []
        self.out = []
        self.buf = []
        self.cur = None

    def handle_starttag(self, tag, attrs):
        if tag in SKIP:
            self.depth_skip += 1
            return
        if self.depth_skip: return
        self.flush()
        self.stack.append(tag)
        if tag in ("h1","h2","h3","h4","a","button","li"):
            self.cur = tag

    def handle_endtag(self, tag):
        if tag in SKIP:
            self.depth_skip = max(0, self.depth_skip - 1)
            return
        if self.depth_skip: return
        self.flush()
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        self.cur = None

    def handle_data(self, data):
        if self.depth_skip: return
        if data.strip():
            self.buf.append(data)

    def flush(self):
        if not self.buf: return
        text = re.sub(r"\s+", " ", "".join(self.buf)).strip()
        self.buf = []
        if text:
            self.out.append({"tag": self.cur or (self.stack[-1] if self.stack else "text"),
                             "text": text})

def extract(path):
    src = open(path, encoding="utf-8").read()
    # Only the rendered markup, not the logic block.
    m = re.search(r"<x-dc>(.*?)</x-dc>", src, re.S)
    body = m.group(1) if m else src
    p = Extract(); p.feed(body); p.flush()
    # Collapse runs of identical adjacent text (the mockups repeat labels).
    seen, items = None, []
    for it in p.out:
        if it["text"] != seen:
            items.append(it)
        seen = it["text"]
    return items

if __name__ == "__main__":
    items = extract(sys.argv[1])
    print(json.dumps(items, ensure_ascii=False, indent=1))
