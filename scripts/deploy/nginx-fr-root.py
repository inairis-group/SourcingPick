#!/usr/bin/env python3
"""Serve the French pages of sourcingpick.com at the root, under French addresses.

Runs after nginx-vitrine.py, on the configuration it produced. Until now the
French addresses (/tarifs, /a-propos, /mentions...) answered with a 302 to
this app's /fr/pricing, /fr/about... This makes them the real addresses:

  * /services, /comment-ca-marche, /entrepot, /tarifs, /faq, /a-propos,
    /livraisons, /mentions, /confidentialite, /cgv, /cookies, and the new
    /services/<page>, /outils/<tool> and /blog/<article> go to this app
    (port 3002), which serves them in French without changing the address;
  * the ten 302 redirects nginx-vitrine.py added are removed — the app now
    sends the old /fr/... addresses to the French ones itself, permanently
    (301), so leaving them would make a loop;
  * /robots.txt and /sitemap.xml come from this app, which now lists the
    whole host (and keeps the other application's private paths out of
    search engines, as its own robots.txt did);
  * /<lang>/legal/security goes straight to /confidentialite instead of
    through /fr/legal/privacy.

Contact, the quote request (/demande), the app page, the client area and
everything else stay where they are.

Dry run by default: prints the diff and writes nothing. It stops without
touching the file if any line it expects is missing.

    python3 nginx-fr-root.py /etc/nginx/sites-enabled/<file>            # diff
    python3 nginx-fr-root.py /etc/nginx/sites-enabled/<file> --apply    # write
    nginx -t && systemctl reload nginx

Apply it right after restarting the app on the version that serves French at
the root (and not before): in between, /tarifs and /fr/pricing send to each
other.

Rollback: copy the backup it prints back over the file, `nginx -t`, reload.
"""

from __future__ import annotations

import difflib
import re
import shutil
import sys
import time

HOST = "https://sourcingpick.com"
VITRINE_MARKER = "Added by scripts/deploy/nginx-vitrine.py"
MARKER = "Added by scripts/deploy/nginx-fr-root.py"

# The 302s nginx-vitrine.py wrote, one per moved page.
VITRINE_REDIRECTS = {
    "/services": "/fr/services",
    "/tarifs": "/fr/pricing",
    "/faq": "/fr/faq",
    "/a-propos": "/fr/about",
    "/comment-ca-marche": "/fr/comment-ca-marche",
    "/entrepot": "/fr/entrepot",
    "/cookies": "/fr/legal/cookies",
    "/mentions": "/fr/legal/mentions-legales",
    "/confidentialite": "/fr/legal/privacy",
    "/cgv": "/fr/legal/terms",
}

FRENCH_ROOT = (
    "services|comment-ca-marche|entrepot|tarifs|faq|a-propos|livraisons|"
    "mentions|confidentialite|cgv|cookies|outils|blog"
)

SECURITY = re.compile(
    r"(\s*location ~ \^/\([a-z|]+\)/legal/security/\?\$ \{ return 301 )"
    + re.escape(HOST)
    + r"/fr/legal/privacy(; \})"
)

PROXY = [
    "    proxy_pass http://127.0.0.1:3002;",
    "    proxy_http_version 1.1;",
    "    proxy_set_header Host $host;",
    "    proxy_set_header X-Real-IP $remote_addr;",
    "    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
    "    proxy_set_header X-Forwarded-Proto $scheme;",
]


def transform(text: str) -> str:
    if MARKER in text:
        return text  # already applied
    if VITRINE_MARKER not in text:
        raise SystemExit("stop: nginx-vitrine.py has not been applied to this file; nothing changed")
    lines = text.split("\n")

    # 1. the vitrine's 302s go
    kept, dropped = [], 0
    for line in lines:
        m = re.fullmatch(r"\s*location = (/[a-z-]+) \{ return 302 (\S+); \}\s*", line)
        if m and VITRINE_REDIRECTS.get(m.group(1)) and m.group(2) == HOST + VITRINE_REDIRECTS[m.group(1)]:
            dropped += 1
            continue
        kept.append(line)
    if dropped != len(VITRINE_REDIRECTS):
        raise SystemExit(f"stop: expected {len(VITRINE_REDIRECTS)} vitrine redirects, found {dropped}")
    lines = kept

    # 2. /legal/security straight to the French address
    hits = [i for i, l in enumerate(lines) if SECURITY.fullmatch(l)]
    if len(hits) != 1:
        raise SystemExit(f"stop: expected one /legal/security redirect, found {len(hits)}")
    lines[hits[0]] = SECURITY.sub(r"\1" + HOST + r"/confidentialite\2", lines[hits[0]])

    # 3. after the vitrine's `location = / { ... }` block: the French
    #    addresses, robots.txt and sitemap.xml
    at = next((i for i, l in enumerate(lines) if VITRINE_MARKER in l), None)
    if at is None or not re.fullmatch(r"\s*location = / \{", lines[at + 1]):
        raise SystemExit("stop: the vitrine's `location = /` block was not found; nothing changed")
    end = next((i for i in range(at + 1, len(lines)) if lines[i].strip() == "}"), None)
    if end is None:
        raise SystemExit("stop: unbalanced `location = /` block; nothing changed")
    pad = re.match(r"\s*", lines[at]).group(0)

    def block(head: str) -> list[str]:
        return [f"{pad}{head} {{", *[pad + p for p in PROXY], f"{pad}}}"]

    new = [
        f"{pad}# Pages françaises à la racine (/tarifs, /a-propos...). {MARKER}",
        *block(f"location ~ ^/({FRENCH_ROOT})(/|$)"),
        *block("location = /robots.txt"),
        *block("location = /sitemap.xml"),
    ]
    lines[end + 1 : end + 1] = new
    return "\n".join(lines)


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        return 2
    path = args[0]
    before = open(path, encoding="utf-8").read()
    after = transform(before)
    if after == before:
        print("already applied: nothing to change")
        return 0
    diff = "".join(
        difflib.unified_diff(before.splitlines(True), after.splitlines(True), "before", "after", n=1)
    )
    print(diff)
    if "--apply" not in sys.argv:
        print("dry run: nothing written. Add --apply to write it.")
        return 0
    backup = f"/root/nginx-sourcingpick.backup-{time.strftime('%Y%m%d-%H%M%S')}"
    shutil.copy2(path, backup)
    open(path, "w", encoding="utf-8").write(after)
    print(f"written. backup: {backup}\nnext: nginx -t && systemctl reload nginx")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
