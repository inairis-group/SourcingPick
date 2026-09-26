import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { loadAtelier, saveAtelier, type AtelierSnapshot } from "@/lib/backend.functions";
import { useAtelier } from "@/lib/store";

function snapshot(): AtelierSnapshot {
  const s = useAtelier.getState();
  return { company: s.company, clients: s.clients, docs: s.docs, seq: s.seq };
}

function isAtelier(path: string) {
  return /^\/(admin|devis|factures|avoirs|clients|paiements|societe|demandes|aide|imprimer)(\/|$)/.test(path);
}

export function Boot({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const atelier = isAtelier(path);
  const [ready, setReady] = useState(!atelier);
  useEffect(() => {
    let live = true;
    let timer = 0;
    let unsub = () => {};
    void (async () => {
      await Promise.resolve(useAtelier.persist.rehydrate());
      if (!live) return;
      if (!atelier) {
        setReady(true);
        return;
      }
      try {
        const remote = await loadAtelier();
        if (!live) return;
        if (remote && Array.isArray(remote.docs)) {
          useAtelier.setState({
            company: remote.company as never,
            clients: remote.clients as never,
            docs: remote.docs as never,
            seq: remote.seq as never,
          });
        } else {
          await saveAtelier({ data: snapshot() });
        }
      } catch (err) {
        console.error("[atelier] synchro serveur", err);
      }
      if (!live) return;
      unsub = useAtelier.subscribe(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          void saveAtelier({ data: snapshot() }).catch((err) => console.error("[atelier] enregistrement", err));
        }, 400);
      });
      setReady(true);
    })();
    return () => {
      live = false;
      window.clearTimeout(timer);
      unsub();
    };
  }, [atelier]);
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-muted">
        <p className="rise">SourcingPick</p>
      </div>
    );
  }
  return children;
}