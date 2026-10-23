# Basculer les pages vitrine de sourcingpick.com vers ce Next.js

## Pourquoi

Sur le serveur, `sourcingpick.com` est servi par **deux applications** :

| Port | Application | Rôle aujourd'hui |
|---|---|---|
| 3020 | `sourcingpick-site` (Grok App Builder, hors dépôt) | `location /` : tout le site public, plus son propre espace client (`/connexion`, `/inscription`, `/espace`, `/admin`) |
| 3002 | ce dépôt (`pm2 restart sourcingpick`) | seulement `/(fr\|en\|zh)/login`, `/client`, `/agent`, `/admin`…, `/api/`, `/_next/` |

Les règles `return 301` de nginx renvoient `/fr/pricing`, `/fr/faq`… vers les
pages de l'ancien site. Le nouveau design, qui n'existe que dans ce dépôt,
n'était donc servi sur aucune adresse publique.

## Ce que fait la bascule

- **Passent à ce dépôt** (12 langues) : accueil, services, tarifs, comment ça
  marche, entrepôt, FAQ, à propos, livraisons, mentions légales,
  confidentialité, cookies, CGV.
- **Restent à l'ancien site** : `/contact`, `/application`, la demande de devis
  (`/demande`), l'espace client (`/connexion`, `/inscription`, `/espace`,
  `/admin`), `/stock`, les API. Raison : leurs formulaires y fonctionnent et
  c'est là que l'équipe lit les demandes. Le formulaire de contact de ce dépôt
  n'envoie encore rien, et sa demande de devis écrit dans une autre base.
- Les boutons « Espace client » du site pointent vers `/connexion` et
  `/inscription` (sans préfixe de langue).
- Les anciennes adresses (`/tarifs`, `/a-propos`, `/cgv`…) redirigent en **302**
  vers les nouvelles. Passer en 301 une fois la bascule confirmée : un 301 est
  mis en cache par les navigateurs et se reprend difficilement.

## Ordre des opérations

1. **Déployer ce dépôt d'abord** (sinon les pages n'ont pas les nouveaux liens) :
   ```bash
   cd /var/www/sourcingpick && git pull origin dev && npm ci && npm run build && pm2 restart sourcingpick
   ```
2. **Modifier nginx** avec le script (il n'écrit rien sans `--apply`) :
   ```bash
   F=$(grep -l "server_name sourcingpick.com" /etc/nginx/sites-enabled/* /etc/nginx/conf.d/* 2>/dev/null | head -1); echo "$F"
   python3 scripts/deploy/nginx-vitrine.py "$F"            # affiche le diff, n'écrit rien
   python3 scripts/deploy/nginx-vitrine.py "$F" --apply    # écrit, après une sauvegarde dans /root
   nginx -t && systemctl reload nginx
   ```
   Le script s'arrête sans rien toucher si une ligne attendue manque.
3. **Vérifier** :
   ```bash
   for p in / /fr /fr/services /en/pricing /fr/livraisons /fr/legal/terms /tarifs /fr/contact /contact /connexion /espace /admin; do
     printf "%-22s" $p; curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://sourcingpick.com$p; done
   ```
   Attendu : `/` en 307 vers `/fr` ; `/fr/services`, `/en/pricing`, `/fr/livraisons`,
   `/fr/legal/terms` en 200 ; `/tarifs` en 302 vers `/fr/pricing` ; `/fr/contact`
   en 301 vers `/contact` ; `/contact`, `/connexion`, `/espace`, `/admin` en 200.

## Retour arrière

```bash
cp /root/nginx-sourcingpick.backup-<date> "$F" && nginx -t && systemctl reload nginx
```

## À savoir

- `sitemap.xml` et `robots.txt` sont toujours ceux de l'ancien site et listent
  encore les anciennes adresses (qui redirigent).
- Le service worker servi à `/sw.js` est celui de l'ancien site : il se
  désinstalle de lui-même et ne gêne pas ces pages.
- Les cookies de langue des deux sites sont distincts.
