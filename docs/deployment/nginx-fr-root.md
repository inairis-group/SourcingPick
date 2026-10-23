# Pages françaises à la racine de sourcingpick.com

Suite de [nginx-vitrine.md](./nginx-vitrine.md), à appliquer sur la
configuration que ce script a produite.

## Ce qui change

- Le français est servi **à la racine**, sous des adresses françaises :
  `/`, `/services`, `/comment-ca-marche`, `/entrepot`, `/tarifs`, `/faq`,
  `/a-propos`, `/livraisons`, `/mentions`, `/confidentialite`, `/cgv`,
  `/cookies`, et les nouvelles pages `/services/…`, `/outils/…`, `/blog/…`.
  Ce sont les adresses que le site publiait et que Google connaît.
- Les anciennes adresses `/fr/…` (`/fr/pricing`, `/fr/about`…) renvoient en
  **301** (permanent) vers les adresses françaises. C'est l'application qui le
  fait (`src/proxy.ts`), plus nginx.
- Les onze autres langues ne bougent pas : `/en/pricing`, `/de/faq`…
- `/robots.txt` et `/sitemap.xml` viennent de cette application. Le sitemap
  liste tout le domaine (avec les `hreflang`), le robots.txt reprend les
  chemins privés de l'ancienne application.
- Restent à l'ancienne application : `/contact`, `/demande`, `/application`,
  l'espace client (`/connexion`, `/inscription`, `/espace`, `/admin`), `/stock`.

La table des adresses est dans `src/lib/i18n/site-paths.ts`.

## Ordre des opérations

Les deux étapes se suivent sans attendre. Entre les deux, `/tarifs` (nginx,
302 vers `/fr/pricing`) et `/fr/pricing` (application, 301 vers `/tarifs`) se
renvoient l'un à l'autre.

1. **Construire** la nouvelle version (le site reste servi par l'ancienne
   pendant la construction) :
   ```bash
   cd /var/www/sourcingpick && git pull origin dev && npm ci && npm run build
   ```
2. **Lire le changement nginx** (le script n'écrit rien sans `--apply`) :
   ```bash
   F=$(grep -l "server_name sourcingpick.com" /etc/nginx/sites-enabled/* /etc/nginx/conf.d/* 2>/dev/null | head -1); echo "$F"
   python3 /var/www/sourcingpick/scripts/deploy/nginx-fr-root.py "$F"
   ```
3. **Appliquer et redémarrer ensemble** :
   ```bash
   python3 /var/www/sourcingpick/scripts/deploy/nginx-fr-root.py "$F" --apply && nginx -t && pm2 restart sourcingpick && systemctl reload nginx
   ```
4. **Vérifier** :
   ```bash
   for p in / /tarifs /a-propos /fr/pricing /en/pricing /robots.txt /sitemap.xml /contact /demande; do printf "%-14s " $p; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://sourcingpick.com$p"; done
   ```
   Attendu : `/`, `/tarifs`, `/a-propos`, `/en/pricing`, `/robots.txt`,
   `/sitemap.xml`, `/contact`, `/demande` en 200 ; `/fr/pricing` en 301 vers
   `/tarifs`.

## Retour arrière

Le script affiche le chemin de sa sauvegarde : la recopier sur le fichier,
`nginx -t`, `systemctl reload nginx`, puis redéployer la version précédente de
l'application.

## Google Search Console

Une fois en ligne : soumettre `https://sourcingpick.com/sitemap.xml`, puis
« Inspection de l'URL » → « Demander une indexation » sur `/`, `/services`,
`/tarifs`, `/comment-ca-marche`, `/entrepot`, `/faq`, `/a-propos`.
