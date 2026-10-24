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

## Déployer

Une seule commande, sur le serveur :

```bash
cd /var/www/sourcingpick && git pull origin dev && bash scripts/deploy/deploy.sh
```

`scripts/deploy/deploy.sh` enchaîne `npm ci`, la construction (le site reste
servi par la version précédente pendant ce temps), le changement nginx, le
redémarrage de l'application avec le rechargement de nginx — dans cet ordre et
sans pause, car entre les deux `/tarifs` (nginx, 302 vers `/fr/pricing`) et
`/fr/pricing` (application, 301 vers `/tarifs`) se renvoient l'un à l'autre —
puis vérifie les adresses. Il s'arrête à la première étape qui échoue en disant
laquelle ; si `nginx -t` refuse la configuration, l'ancienne est remise.

Le fichier nginx est celui qui porte le marqueur de `nginx-vitrine.py`
(« Added by scripts/deploy/nginx-vitrine.py ») : le chercher par
`server_name` peut tomber sur un autre fichier qui déclare aussi le domaine.

Attendu à la fin : `/`, `/tarifs`, `/a-propos`, `/services`, `/en/pricing`,
`/robots.txt`, `/sitemap.xml`, `/demande`, `/contact` en 200 ; `/fr/pricing`
en 301 vers `/tarifs`.

## Retour arrière

Le script affiche le chemin de sa sauvegarde : la recopier sur le fichier,
`nginx -t`, `systemctl reload nginx`, puis redéployer la version précédente de
l'application.

## Google Search Console

Une fois en ligne : soumettre `https://sourcingpick.com/sitemap.xml`, puis
« Inspection de l'URL » → « Demander une indexation » sur `/`, `/services`,
`/tarifs`, `/comment-ca-marche`, `/entrepot`, `/faq`, `/a-propos`.
