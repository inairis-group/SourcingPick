import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { loadAtelier, saveAtelier, type AtelierSnapshot } from "@/lib/backend.functions";
import { normalizeDocs, type Client, type Company, type Document, type Seq } from "@/lib/docs";
import { armLoadingBar, clearLoadingBar } from "@/lib/loading";
import { loadSession, peekSession } from "@/lib/session";
import { useAtelier } from "@/lib/store";

function snapshot(): AtelierSnapshot {
  const s = useAtelier.getState();
  return {
    company: s.company,
    clients: s.clients.filter((client) => client.id.startsWith("usr_")),
    docs: s.docs,
    seq: s.seq,
  };
}

function printReady(path: string) {
  if (!path.startsWith("/imprimer/")) return false;
  const id = decodeURIComponent(path.slice("/imprimer/".length).split("/")[0] || "");
  if (!id) return false;
  try {
    return Boolean(localStorage.getItem(`sp-print:${id}`));
  } catch {
    return false;
  }
}

function Loader() {
  return (
    <div className="app-boot" aria-busy="true">
      <img src="/illustrations/mascotte-ronde.svg" alt="" />
      <p>Chargement…</p>
    </div>
  );
}

export function AtelierBoot({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const opened = useRef(path);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    let timer = 0;
    let unsub = () => {};
    const here = opened.current;
    void (async () => {
      const cached = printReady(here);
      if (!cached) await Promise.resolve(useAtelier.persist.rehydrate());
      if (!live) return;
      armLoadingBar();
      try {
        const session = await loadSession();
        if (!live) return;
        if (!session.user) {
          void navigate({ to: "/connexion" });
          return;
        }
        sessionStorage.removeItem("sp-error-retry");
        if (cached) return;
        const staff = session.user.role !== "client";
        if (!staff) return;
        const remote = await loadAtelier();
        if (!live) return;
        if (remote && Array.isArray(remote.docs)) {
          const company = remote.company as unknown as Company;
          const clients = (remote.clients as unknown as Client[]).filter((client) => String(client?.id || "").startsWith("usr_"));
          const docs = remote.docs as unknown as Document[];
          const seq = remote.seq as unknown as Seq;
          const fixed = normalizeDocs(company, clients, docs);
          useAtelier.setState({
            company,
            clients,
            docs: fixed.docs,
            seq,
          });
          if (fixed.changed && staff) await saveAtelier({ data: snapshot() });
        } else if (staff) {
          await saveAtelier({ data: snapshot() });
        }
      } catch (err) {
        console.error("[atelier] synchro serveur", err);
        return;
      }
      if (!live) return;
      unsub = useAtelier.subscribe(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          void saveAtelier({ data: snapshot() }).catch((saveErr) => console.error("[atelier] enregistrement", saveErr));
        }, 700);
      });
    })().finally(() => {
      if (live) {
        clearLoadingBar();
        setTick((value) => value + 1);
      }
    });
    return () => {
      live = false;
      window.clearTimeout(timer);
      unsub();
      clearLoadingBar();
    };
  }, [navigate]);
  if (tick >= 0 && !peekSession()?.user) return <Loader />;
  return children;
}
