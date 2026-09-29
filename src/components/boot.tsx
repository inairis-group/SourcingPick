import { Suspense, lazy, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

const AtelierBoot = lazy(() => import("@/components/atelier-boot").then((mod) => ({ default: mod.AtelierBoot })));

function isAtelier(path: string) {
  return /^\/(admin|devis|factures|avoirs|clients|paiements|societe|demandes|aide|imprimer|espace|acces|sessions|commandes|documents|contrats|emails|journal|logs|agents|utilisateurs|parametres|stock|statistiques|gestion)(\/|$)/.test(path);
}

function Loader() {
  return (
    <div className="app-boot" aria-busy="true">
      <img src="/illustrations/mascotte-ronde.svg" alt="" />
      <p>Chargement…</p>
    </div>
  );
}

export function Boot({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!isAtelier(path)) return children;
  return (
    <Suspense fallback={<Loader />}>
      <AtelierBoot>{children}</AtelierBoot>
    </Suspense>
  );
}
