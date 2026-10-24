#!/usr/bin/env bash
# Deploy this app on the VPS, with the nginx change that serves French at the
# root (scripts/deploy/nginx-fr-root.py). Run it after pulling:
#
#   cd /var/www/sourcingpick && git pull origin dev && bash scripts/deploy/deploy.sh
#
# It stops at the first step that fails and says which. The site keeps running
# on the previous build until step 4: the build happens beside it. If nginx
# rejects the new configuration, the previous one is put back before stopping.
set -euo pipefail

APP_DIR="/var/www/sourcingpick"
MARKER="Added by scripts/deploy/nginx-vitrine.py"
HOST="https://sourcingpick.com"

say() { printf '\n== %s\n' "$*"; }
fail() { printf '\nÉCHEC : %s\nRien d’autre n’a été changé. Envoie-moi tout ce qui est affiché ci-dessus.\n' "$*" >&2; exit 1; }

cd "$APP_DIR" || fail "dossier $APP_DIR introuvable"

say "0/5 Vérifications"
node_major=$(node -p 'process.versions.node.split(".")[0]')
[ "$node_major" -ge 20 ] || fail "Node.js $(node -v) : il faut Node 20 ou plus récent"
F=$(grep -l "$MARKER" /etc/nginx/sites-enabled/* /etc/nginx/conf.d/* 2>/dev/null | head -1 || true)
[ -n "$F" ] || fail "fichier nginx de sourcingpick.com introuvable (marqueur « $MARKER » absent)"
echo "Node $(node -v) · nginx : $F · version : $(git log --oneline -1)"

say "1/5 Dépendances (npm ci)"
npm ci || fail "npm ci"

say "2/5 Construction (npm run build) — le site actuel reste en ligne pendant ce temps"
npm run build || fail "npm run build"

say "3/5 nginx : pages françaises à la racine"
backup="/root/nginx-sourcingpick.before-deploy-$(date +%Y%m%d-%H%M%S)"
cp "$F" "$backup"
python3 scripts/deploy/nginx-fr-root.py "$F" --apply || { cp "$backup" "$F"; fail "script nginx"; }
if ! nginx -t; then
  cp "$backup" "$F"
  fail "nginx -t refuse la nouvelle configuration (l’ancienne est remise)"
fi
echo "sauvegarde nginx : $backup"

say "4/5 Redémarrage de l’application et rechargement de nginx"
pm2 restart sourcingpick || fail "pm2 restart sourcingpick"
systemctl reload nginx || fail "systemctl reload nginx"

say "5/5 Vérification"
sleep 5
ok=1
check() {
  local path=$1 want=$2 got
  got=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "$HOST$path" || true)
  if [ "$got" = "$want" ]; then printf '  ok    %-16s %s\n' "$path" "$got"; else printf '  ERREUR %-15s %s (attendu %s)\n' "$path" "$got" "$want"; ok=0; fi
}
for p in / /tarifs /a-propos /services /en/pricing /robots.txt /sitemap.xml /demande /contact; do check "$p" 200; done
check /fr/pricing 301

if [ "$ok" = 1 ]; then
  say "Terminé : le site est à jour."
else
  printf '\nCertaines adresses ne répondent pas comme prévu. Envoie-moi tout ce qui est affiché.\n'
  printf 'Retour arrière nginx si besoin : cp %s %s && nginx -t && systemctl reload nginx\n' "$backup" "$F"
  exit 1
fi
