"""Turn the static HTML export back into the .dc.html layout port.py reads.

usage: export_to_canvas.py <export-root> <out-dir>

Then port from the result:  SP_CANVAS=<out-dir> npm run design:port
(the export is the folder with site/, saas/ and assets/ in it).
The export wired every link to a real file; port.py expects "#" (it maps
routes from the French link text), so hrefs are reset and pk-* attributes
dropped. Nothing else is touched.
"""
import os, re, sys

EXPORT, OUT = sys.argv[1], sys.argv[2]
FR = {  # port.py stem -> (export file, canvas file for fr)
    "Accueil": ("index", "Main.dc.html"),
    "Services": ("services", "Site-Services.dc.html"),
    "Comment-ca-marche": ("comment-ca-marche", "Site-Comment-ca-marche.dc.html"),
    "Entrepot": ("entrepot", "Site-Entrepot.dc.html"),
    "Tarifs": ("tarifs", "Site-Tarifs.dc.html"),
    "FAQ": ("faq", "Site-FAQ.dc.html"),
    "Devis": ("devis", "Site-Devis.dc.html"),
    "Contact": ("contact", "Site-Contact.dc.html"),
    "A-propos": ("a-propos", "Site-A-propos.dc.html"),
    "Application": ("application", "Site-Application.dc.html"),
    "Mentions-legales": ("mentions-legales", "Site-Mentions-legales.dc.html"),
    "Confidentialite": ("confidentialite", "Site-Confidentialite.dc.html"),
    "Cookies": ("cookies", "Site-Cookies.dc.html"),
    "CGV": ("cgv", "Site-CGV.dc.html"),
    "Livraisons": ("livraisons", "Site-Livraisons.dc.html"),
    "404": ("404", "Site-404.dc.html"),
}
LOCALES = "fr en zh es de it pt nl ar ru tr pl".split()

def convert(src, cur):
    title = re.search(r"<title>(.*?)</title>", src, re.S)
    i = src.index('<div id="pk-root"')
    j = src.index(">", i) + 1
    k = src.rindex("</div>", 0, src.index("<script", j) if "<script" in src[j:] else len(src))
    inner = src[j:k]
    ROUTE = {"index": "/", "services": "/services", "comment-ca-marche": "/comment-ca-marche",
             "entrepot": "/entrepot", "tarifs": "/pricing", "faq": "/faq", "devis": "/devis",
             "contact": "/contact", "a-propos": "/about", "application": "/application",
             "mentions-legales": "/legal/mentions-legales", "confidentialite": "/legal/privacy",
             "cookies": "/legal/cookies", "cgv": "/legal/terms", "livraisons": "/livraisons",
             "404": "/", "connexion": "/login", "inscription": "/signup"}
    def href(m):
        h = m.group(1)
        if h.startswith(("mailto:", "http", "#")):
            return m.group(0)
        mm = re.match(r"^(?:\.\./)*(?:saas/[a-z]{2}/|[a-z]{2}/)?([a-z0-9-]+)\.html(#.*)?$", h)
        if not mm or mm.group(1) not in ROUTE:
            return ' href="#"'
        name, frag = mm.group(1), mm.group(2) or ""
        if frag and name in (cur, "index"):
            return ' href="%s"' % frag
        return ' href="%s%s"' % (ROUTE[name], frag)
    inner = re.sub(r'\shref="([^"]*)"', href, inner)
    inner = re.sub(r'(src=")(?:\.\./)+assets/img/([0-9a-f]+)\.[a-z]+(")', r'\1/_blob/\2\3', inner)
    inner = re.sub(r'\sdata-pk-[a-z-]+="[^"]*"', "", inner)
    return f'<html><head><title>{title.group(1) if title else ""}</title></head><body><x-dc><div>{inner}</div></x-dc></body></html>'

# Pages the design draws in French only. Every other language shows the French
# page, so the porter sees twelve identical boards and the content tables fall
# back to French by construction.
FR_ONLY = {"Livraisons"}

os.makedirs(OUT, exist_ok=True)
n = 0
for stem, (f, frname) in FR.items():
    for loc in LOCALES:
        p = os.path.join(EXPORT, "site", "fr" if stem in FR_ONLY else loc, f + ".html")
        if not os.path.exists(p):
            continue
        out = frname if loc == "fr" else f"{loc}-{stem}.dc.html"
        open(os.path.join(OUT, out), "w", encoding="utf-8").write(convert(open(p, encoding="utf-8").read(), f))
        n += 1
print("wrote", n)
