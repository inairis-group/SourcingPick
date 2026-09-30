import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

/**
 * Bandeau de consentement cookies — conforme à la politique de cookies :
 * trois boutons de même taille (« Tout accepter », « Tout refuser »,
 * « Choisir »), refus aussi simple qu'acceptation, choix conservé 6 mois,
 * réouverture via l'événement "sp:consent:open" (bouton de la page Cookies).
 * La mesure d'audience (Track) n'est active qu'avec le consentement.
 */

const KEY = "sp_consent";
const SIX_MONTHS_MS = 183 * 24 * 3600 * 1000;

// Routes privées où le bandeau ne s'affiche pas (espaces applicatifs).
const PRIVATE =
  /^\/(admin|agent|devis|factures|avoirs|clients|commandes|demandes|documents|emails|statistiques|journal|logs|parametres|utilisateurs|sessions|agents|paiements|contrats|stock|gestion|imprimer|connexion|inscription|acces|verification|api|espace|signer|consulter)(\/|$)/;

export type ConsentValue = "all" | "none" | "custom-stats";

/** Lit le choix conservé ; null si absent ou plus vieux que 6 mois. */
export function readConsent(): { v: ConsentValue; at: number } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    if (!raw.startsWith("{")) return { v: raw === "all" ? "all" : "none", at: Date.now() }; // format historique
    const c = JSON.parse(raw) as { v: ConsentValue; at: number };
    if (Date.now() - (c.at || 0) > SIX_MONTHS_MS) return null;
    return c;
  } catch {
    return null;
  }
}

/** True si la mesure d'audience est consentie. */
export function statsAllowed(): boolean {
  const c = readConsent();
  return c?.v === "all" || c?.v === "custom-stats";
}

function save(v: ConsentValue) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v, at: Date.now() }));
  } catch {
    /* stockage indisponible : le bandeau réapparaîtra */
  }
}

export function ConsentBanner() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mode, setMode] = useState<"hidden" | "ask" | "custom">("hidden");
  const [stats, setStats] = useState(false);

  useEffect(() => {
    if (PRIVATE.test(path)) {
      setMode("hidden");
      return;
    }
    setMode(readConsent() ? "hidden" : "ask");
    const reopen = () => {
      setStats(statsAllowed());
      setMode("ask");
    };
    window.addEventListener("sp:consent:open", reopen);
    return () => window.removeEventListener("sp:consent:open", reopen);
  }, [path]);

  if (mode === "hidden") return null;

  const choose = (v: ConsentValue) => {
    save(v);
    setMode("hidden");
  };

  return (
    <div
      role="dialog"
      aria-label="Consentement cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-line bg-paper p-5 shadow-card"
    >
      <p className="font-semibold text-ink">Des cookies, seulement ceux qui servent.</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Les cookies nécessaires font fonctionner le site, la connexion et la signature. La mesure
        d'audience — agrégée, sans identifiant publicitaire — n'est déposée qu'avec votre accord.
        Refuser n'a aucune conséquence sur l'accès au site.
      </p>
      {mode === "custom" ? (
        <label className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3">
          <span className="text-sm font-medium text-ink">Mesure d'audience (pages vues, agrégées)</span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-[#155dfc]"
            checked={stats}
            onChange={(e) => setStats(e.target.checked)}
          />
        </label>
      ) : null}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {mode === "custom" ? (
          <button type="button" className="btn btn-primary h-11 min-h-11 flex-1" onClick={() => choose(stats ? "custom-stats" : "none")}>
            Enregistrer mes choix
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-primary h-11 min-h-11 flex-1" onClick={() => choose("all")}>
              Tout accepter
            </button>
            <button type="button" className="btn btn-quiet h-11 min-h-11 flex-1" onClick={() => choose("none")}>
              Tout refuser
            </button>
            <button type="button" className="btn btn-quiet h-11 min-h-11 flex-1" onClick={() => { setStats(statsAllowed()); setMode("custom"); }}>
              Choisir
            </button>
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-muted">
        Détail des traceurs sur la page{" "}
        <Link to="/cookies" className="font-semibold text-brand">
          Cookies
        </Link>
        . Votre choix est conservé 6 mois.
      </p>
    </div>
  );
}
