# SourcingPick — reprise pour Claude

Document de passation. État constaté le 22 octobre 2026.
Ne pas inventer de fonctionnalité. Ne pas toucher aux autres applications du serveur.

## 1. Où est le code

Dépôt **privé** : https://github.com/inairis-group/SourcingPick

Il n’y a pas de branche `main` à déployer. Branche de travail et de production :

| Branche | Rôle |
|---|---|
| `rebuild` | **Le code en ligne.** Site public + SaaS atelier. Commit déployé `ebd59f9` — « Send the logo back to the home page. » |
| `dev` | Ancienne. Ne pas déployer. |

Une recherche GitHub publique ne trouve rien. Il faut un compte membre de l’organisation `inairis-group`, ou un jeton avec accès à ce dépôt.

```bash
git clone https://github.com/inairis-group/SourcingPick.git
cd SourcingPick
git checkout rebuild
git pull origin rebuild
npm install
```

`rebuild` est **une seule application web** (TanStack Start + Vite + Nitro `node-server`, React 19). `@tanstack/react-start` doit rester **≥ 1.168.60** (Vercel refuse les versions plus anciennes, CVE-2026-102989). Version constatée : `1.168.60`.

Elle contient :

- le site marketing (maquettes dans `src/site/boards/*.html`, rendues par `src/components/board.tsx`) ;
- le SaaS : espace client `/espace` et admin (devis, factures, avoirs, commandes, clients, stock, statistiques, agents).

Elle ne contient **pas** l’application mobile native. Le mobile est `reserve-stock` sur le même VPS. La page `/application` est une page de présentation.

## 2. Connexion VPS

```bash
ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes root@82.112.242.243
```

- Hébergeur : Hostinger. Machine : `srv1104436`. IP : `82.112.242.243`.
- Clé publique déjà autorisée pour root, commentaire `sourcingpick-site-grok` :

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJRIgQu2qQPo5MZslICD8feWvc6+JjIN4cSjFyjbfkBv sourcingpick-site-grok
```

Ce document **ne contient pas** la clé privée. La clé privée qui déploie aujourd’hui s’appelle `sourcingpick-site-grok` (`id_ed25519`). Le propriétaire doit la donner à Claude hors du dépôt. Ne pas la committer.

- Node du système (`node -v` → v12) est **le mauvais**. Les apps tournent avec `/root/.nvm/versions/node/v22.13.0/bin/node`.
- Ne jamais faire `pm2 restart all`, `reboot`, ni `nginx -s stop`.
- Ne jamais éditer ou redémarrer : `reserve-stock`, `inairis`, `melrys-api`, `smsi`, ni l’ancien `sourcingpick` (port 3002), sauf demande explicite.

## 3. Processus au 22 octobre 2026

| Nom PM2 | Dossier | Port | Quoi |
|---|---|---|---|
| `sourcingpick-site` | `/var/www/sourcingpick-site` | `127.0.0.1:3020` | **Branche `rebuild`.** Site + SaaS. C’est le seul qu’on déploie. |
| `sourcingpick` | `/var/www/sourcingpick` | `3002` | Ancien SaaS Next.js. Nginx y envoie encore d’anciennes URLs. Ne pas y déployer le nouveau code. |
| `reserve-stock` | `/var/www/reserve-stock` | `127.0.0.1:3010` | App mobile. Interdit d’y toucher. |
| `inairis` | `/var/www/inairis` | `3003` | Autre site. Ne pas y toucher. |
| `melrys-api` | `/var/www/melrys-api` | — | Autre produit. Ne pas y toucher. |
| `smsi` | `/var/www/smsi-studio` | — | Autre site. Ne pas y toucher. |

Nginx : `/etc/nginx/sites-enabled/sourcingpick.com`. Ne pas le remplacer par un proxy unique.

Routage utile :

- `/` et presque tout le nouveau site → `3020`
- `/api/o/` et `/api/c/` → `3020`
- `/stock` exact → `3020`
- `/stock/` et l’APK → `3010` (mobile)
- anciennes URLs localisées admin/client → `3002`

Santé : `curl -s -o /dev/null -w '%{http_code}\n' https://sourcingpick.com/` doit répondre `200`.

## 4. Données — ne pas effacer

`sourcingpick-site` n’a pas de `DATABASE_URL` dans PM2. Base **PGLite** :

```text
PGLITE_DATA_DIR=/var/lib/sourcingpick-site/pglite
```

Uploads : `/var/lib/sourcingpick-site/uploads`  
Courrier : `/var/www/sourcingpick-site/mail.env` (secrets SMTP, ne pas les copier dans un chat)  
Redis : `127.0.0.1:6379`

Le dossier déployé n’est **pas** un clone Git. Seulement le build Nitro :

```text
server/index.mjs    # lancé par PM2
public/
nitro.json
mail.env
logs/app.log
logs/error.log
server.prev/        # retour arrière
public.prev/
```

PM2 : script `server/index.mjs`, cwd `/var/www/sourcingpick-site`, node v22.13.0, `PORT=3020`, `HOST=127.0.0.1`.

## 5. Déployer uniquement `sourcingpick-site`

Depuis la machine qui a le dépôt, branche `rebuild`. **Ne pas** lancer `npm run build` : ce script enchaîne une migration.

```bash
git checkout rebuild
git pull --rebase origin rebuild

NITRO_PRESET=node-server node scripts/with-app-env.mjs ./node_modules/.bin/vite build

tar -C .output -czf /tmp/sp-site.tgz server public nitro.json
scp -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes /tmp/sp-site.tgz root@82.112.242.243:/tmp/sp-site.tgz
```

Sur le serveur :

```bash
cd /var/www/sourcingpick-site
rm -rf server.prev public.prev
mv server server.prev
mv public public.prev
tar -xzf /tmp/sp-site.tgz -C /var/www/sourcingpick-site
pm2 restart sourcingpick-site

ok=0
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:3020/ || true)
  echo "try $i ${code:-000}"
  if [ "$code" = "200" ]; then ok=1; break; fi
  sleep 1
done
if [ "$ok" != "1" ]; then
  echo ROLLBACK
  rm -rf server public
  mv server.prev server
  mv public.prev public
  pm2 restart sourcingpick-site
  exit 1
fi
echo DEPLOY_OK
```

Le premier `curl` juste après le restart vaut souvent `000`. Ce n’est pas un échec. Attendre le `200` avant de rollback.

Pousser **avant** ou après le build, mais toujours la branche `rebuild` :

```bash
git push origin HEAD:rebuild
```

Ne pas lancer les migrations sauf si un fichier de `migrations/` a vraiment changé. Les données vivent dans le dossier PGLite, pas dans `server/` qu’on remplace. Un seul build à la fois.

## 6. Ce qu’il ne faut pas casser (travail déjà en ligne)

- Les boutons « Demander un devis », « Voir les 6 étapes » et la carte Application ont de vrais liens (`/demande`, `/comment-ca-marche`, `/application`). Ne pas les remettre en `href="#"`.
- Le logo du header et du pied de page ouvre `/`. Dans le SaaS, le logo ouvre le tableau de bord du rôle.
- En mobile, le header **n’est pas** collant. Le visuel du haut ne suit pas le scroll.
- Marketplace et Enchères ne sont plus dans la navigation publique.
- Les langues sont en bas du pied de page.
- Le formulaire public de demande crée le compte client, la commande, le fil de discussion, et envoie l’email de confirmation. Ne pas le réduire à une écriture dans une table de leads inutilisée.
- Les champs email / mot de passe de `/connexion` utilisent la classe `field-icon`. Ne pas reposer l’icône en `absolute` Tailwind par-dessus `.field` : le padding du champ gagne et le texte se superpose à l’icône.
- PDF devis : ne pas laisser le titre ni le pied passer sous la vague. Les règles d’impression sont dans `src/styles.css`.
- `npm run build` n’est pas la commande de déploiement.

## 7. Contrôle au réveil

```bash
ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes root@82.112.242.243
pm2 status
curl -s -o /dev/null -w '%{http_code}\n' --max-time 8 http://127.0.0.1:3020/
curl -s -o /dev/null -w '%{http_code}\n' --max-time 12 https://sourcingpick.com/
```

Attendu : `sourcingpick-site` online, HTTP 200.  
Si le port 22 ne répond plus, ce n’est pas le code : console Hostinger. Ne pas redémarrer les autres processus.
