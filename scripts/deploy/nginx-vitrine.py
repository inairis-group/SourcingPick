#!/usr/bin/env python3
"""Move the marketing pages of sourcingpick.com from the old site to this app.

Today nginx sends `location /` to the old Grok application (port 3020) and
redirects this app's `/fr/pricing`, `/fr/faq`... to its pages. This rewrites
only the `sourcingpick.com` server block so that:

  * the pages with no form — home, services, pricing, how-it-works, warehouse,
    FAQ, about, deliveries and the four legal pages — are served by this app
    (port 3002) in all twelve languages;
  * the old addresses (/services, /tarifs, /a-propos, ...) redirect to them;
  * contact, application and the quote request STAY on the old site, whose forms
    work and whose leads the team reads (/fr/contact -> /contact, /fr/devis ->
    /demande, as before), now for all twelve languages;
  * everything else (/connexion, /espace, /admin, /stock, the APIs) is untouched.

Dry run by default: prints the diff and writes nothing. It stops without
touching the file if any line it expects is missing, because a half-applied
nginx configuration is worse than none.

    python3 nginx-vitrine.py /etc/nginx/sites-enabled/<file>            # diff
    python3 nginx-vitrine.py /etc/nginx/sites-enabled/<file> --apply    # write
    nginx -t && systemctl reload nginx

Rollback: copy the backup it prints back over the file, `nginx -t`, reload.
"""

from __future__ import annotations

import difflib
import re
import shutil
import sys
import time

LOCALES = "fr|en|zh|es|de|it|pt|nl|ar|ru|tr|pl"
HOST = "https://sourcingpick.com"

APP_ROUTES = (
    "admin|client|agent|factory|shipper|messages|support|login|signup|onboarding|"
    "forgot-password|reset-password|verify-otp|marketplace|auctions|factories|"
    "delivery-calculator"
)
# What this change adds to the app's routes: the pages that move over.
MOVED = "services|pricing|faq|about|comment-ca-marche|entrepot|livraisons"
LEGAL = "legal/(cookies|mentions-legales|privacy|terms)"

OLD_APP = (
    rf"location ~ ^/(fr|en|zh)/({APP_ROUTES})(/|$) {{"
)
NEW_APP = (
    rf"location ~ ^/({LOCALES})(/?$|/({APP_ROUTES}|{MOVED}|{LEGAL})(/|$)) {{"
)

# Redirects of this app's own addresses to the old site's pages: dropped for the
# pages that move, widened to twelve languages for the three that stay.
DROP = [
    r"location = /(fr|en|zh)/? \{ return 301 https://sourcingpick\.com/; \}",
    r"location ~ \^/\(fr\|en\|zh\)/(services|pricing|faq|about|comment-ca-marche|entrepot)/\?\$ \{ return 301 [^;]+; \}",
    r"location ~ \^/\(fr\|en\|zh\)/legal/(cookies|mentions-legales|privacy|terms)/\?\$ \{ return 301 [^;]+; \}",
]
WIDEN = {
    "contact": f"{HOST}/contact",
    "application": f"{HOST}/application",
    "devis": f"{HOST}/demande",
}
SECURITY_OLD = r"location ~ \^/\(fr\|en\|zh\)/legal/security/\?\$ \{ return 301 [^;]+; \}"

# Old addresses of the moved pages -> where they live now. 302 first: a
# permanent redirect is cached by browsers and is hard to take back.
REDIRECTS = {
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


def block_bounds(lines: list[str]) -> tuple[int, int]:
    """First and last line of the server block that carries the app regex."""
    hit = next(
        (i for i, l in enumerate(lines) if "location ~ ^/(fr|en|zh)/(admin|client" in l),
        None,
    )
    if hit is None:
        raise SystemExit("stop: the app route regex was not found; nothing changed")
    start = hit
    while start >= 0 and not re.match(r"^\s*server\s*\{", lines[start]):
        start -= 1
    if start < 0:
        raise SystemExit("stop: no enclosing server block; nothing changed")
    depth, end = 0, None
    for i in range(start, len(lines)):
        depth += lines[i].count("{") - lines[i].count("}")
        if depth == 0:
            end = i
            break
    if end is None:
        raise SystemExit("stop: unbalanced braces; nothing changed")
    return start, end


MARKER = "Added by scripts/deploy/nginx-vitrine.py"


def transform(text: str) -> str:
    if MARKER in text:
        return text  # already applied; running it twice must not stack a second copy
    lines = text.split("\n")
    start, end = block_bounds(lines)
    block = lines[start : end + 1]
    if not any("server_name sourcingpick.com" in l for l in block):
        raise SystemExit("stop: that block is not sourcingpick.com's; nothing changed")

    # 1. the app regex gains twelve languages, the home and the moved pages
    idx = [i for i, l in enumerate(block) if l.strip() == OLD_APP]
    if len(idx) != 1:
        raise SystemExit(f"stop: expected one app route regex, found {len(idx)}")
    pad = re.match(r"\s*", block[idx[0]]).group(0)
    block[idx[0]] = f"{pad}{NEW_APP}"

    # 2. drop the redirects of the pages that move
    kept, dropped = [], 0
    for l in block:
        if any(re.fullmatch(rf"\s*{p}\s*", l) for p in DROP):
            dropped += 1
            continue
        kept.append(l)
    # six for the language roots, ten for the pages
    if dropped != 16:
        raise SystemExit(f"stop: expected to drop 16 redirects, found {dropped}")
    block = kept

    # 3. the three pages that stay on the old site, and /legal/security, in all languages
    for slug, target in WIDEN.items():
        old = rf"location ~ \^/\(fr\|en\|zh\)/{slug}/\?\$ \{{ return 301 [^;]+; \}}"
        i = [k for k, l in enumerate(block) if re.fullmatch(rf"\s*{old}\s*", l)]
        if len(i) != 1:
            raise SystemExit(f"stop: expected one redirect for /{slug}, found {len(i)}")
        block[i[0]] = f"{pad}location ~ ^/({LOCALES})/{slug}/?$ {{ return 301 {target}; }}"
    i = [k for k, l in enumerate(block) if re.fullmatch(rf"\s*{SECURITY_OLD}\s*", l)]
    if len(i) != 1:
        raise SystemExit(f"stop: expected one redirect for /legal/security, found {len(i)}")
    block[i[0]] = (
        f"{pad}location ~ ^/({LOCALES})/legal/security/?$ {{ return 301 {HOST}/fr/legal/privacy; }}"
    )

    # 4. the home and the old addresses, ahead of the catch-all
    catch = [
        k
        for k, l in enumerate(block)
        if re.fullmatch(r"\s*location / \{", l)
        and any("proxy_pass http://127.0.0.1:3020" in b for b in block[k : k + 8])
    ]
    if len(catch) != 1:
        raise SystemExit(f"stop: expected one `location /` to the old site, found {len(catch)}")
    new = [
        f"{pad}# Pages vitrine: this app (nouveau design). Added by scripts/deploy/nginx-vitrine.py",
        f"{pad}location = / {{",
        f"{pad}    proxy_pass http://127.0.0.1:3002;",
        f"{pad}    proxy_http_version 1.1;",
        f"{pad}    proxy_set_header Host $host;",
        f"{pad}    proxy_set_header X-Real-IP $remote_addr;",
        f"{pad}    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
        f"{pad}    proxy_set_header X-Forwarded-Proto $scheme;",
        f"{pad}}}",
        *[f"{pad}location = {old} {{ return 302 {HOST}{new_}; }}" for old, new_ in REDIRECTS.items()],
        "",
    ]
    block[catch[0] : catch[0]] = new

    return "\n".join(lines[:start] + block + lines[end + 1 :])


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
        difflib.unified_diff(
            before.splitlines(True), after.splitlines(True), "before", "after", n=1
        )
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
