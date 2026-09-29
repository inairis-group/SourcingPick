import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Paper } from "@/components/paper";
import { adminSession } from "@/lib/admin-auth.functions";
import { type Client, type Company, type Document } from "@/lib/docs";
import { printNamed } from "@/lib/ops-paper";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/imprimer/$id")({ component: Page });

type Pack = { doc: Document; company: Company; client: Client | null };

function readPack(id: string): Pack | null {
  try {
    const raw = localStorage.getItem(`sp-print:${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Pack;
    if (!parsed?.doc || parsed.doc.id !== id || !parsed.doc.number) return null;
    return parsed;
  } catch {
    return null;
  }
}

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [pack] = useState(() => readPack(id));
  const storeDoc = useAtelier((s) => s.docs.find((d) => d.id === id));
  const doc = pack?.doc ?? storeDoc;

  useEffect(() => {
    if (!doc?.number) return;
    const previous = document.title;
    document.title = doc.number;
    const apply = () => {
      document.title = doc.number;
    };
    window.addEventListener("beforeprint", apply);
    return () => {
      window.removeEventListener("beforeprint", apply);
      document.title = previous;
    };
  }, [doc?.number]);

  useEffect(() => {
    let live = true;
    adminSession()
      .then((session) => {
        if (live && !session.user) void navigate({ to: "/connexion" });
      })
      .catch(() => {
        if (live) void navigate({ to: "/connexion" });
      });
    return () => {
      live = false;
    };
  }, [navigate]);

  if (!doc) {
    return (
      <main className="p-8">
        <p>Document introuvable.</p>
        <Link to="/">Retour</Link>
      </main>
    );
  }

  const back = doc.kind === "devis" ? "/devis/$id" : doc.kind === "facture" ? "/factures/$id" : "/avoirs/$id";

  return (
    <main className="print-stage">
      <div className="no-print mb-4 flex w-[794px] max-w-full items-center justify-between gap-3">
        <Link to={back} params={{ id: doc.id }} className="btn btn-quiet">
          Retour au document
        </Link>
        <button className="btn btn-primary" type="button" onClick={() => printNamed(doc.number)}>
          Enregistrer en PDF
        </button>
      </div>
      <div className="sheet">
        <Paper doc={doc} company={pack?.company} client={pack ? pack.client : undefined} />
      </div>
    </main>
  );
}