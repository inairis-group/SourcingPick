import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, useOps } from "@/components/ops-ui";
import { QuoteFigures, frDate, useClient } from "@/components/client-ui";
import { PieceView } from "@/components/piece";
import { clientConsult, clientRefuse, opsQuote } from "@/lib/ops.functions";
import { devisFromOps, openOpsQuote, signRows } from "@/lib/ops-paper";
import { addDays } from "@/lib/docs";

export const Route = createFileRoute("/espace/devis/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Devis" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data, error, reload } = useClient();
  const summary = data?.quotes.find((item) => item.id === id || item.number === id);
  const { data: full } = useOps(() => (summary ? opsQuote({ data: summary.id }) : Promise.resolve(null)), summary ? `quote-view:${summary.id}` : "quote-view:wait");
  const quote = full ?? summary;
  const [askRefuse, setAskRefuse] = useState(false);
  useEffect(() => {
    if (!quote || quote.status !== "Devis envoyé") return;
    void clientConsult({ data: quote.id }).catch(() => {});
  }, [quote?.id, quote?.status]);
  if (!quote) return <Shell><p>{error || "Chargement…"}</p></Shell>;
  const draft = devisFromOps(quote);
  return (
    <Shell>
      <PageHead title={`Devis ${quote.number}`}>
        <Badge value={quote.status} />
      </PageHead>
      <p className="-mt-3 mb-4 text-sm text-muted">
        Valable jusqu’au {frDate(addDays(quote.issuedOn, Number(quote.validityDays) || 0))}
        {quote.orderRef ? ` · commande ${quote.orderRef}` : ""}
      </p>
      <PieceView doc={draft} fileName={`${quote.number}.pdf`} clientName={quote.clientName} site={quote.port} onPdf={() => void openOpsQuote(quote)}>
        <QuoteFigures quote={quote} />
        <p className="mt-3 text-muted">
          Émis le {frDate(quote.issuedOn)}
          {quote.orderRef ? ` · Commande ${quote.orderRef}` : ""}
        </p>
        {quote.status === "Devis signé" ? <SignCard quote={quote} /> : null}
        {quote.status === "Devis envoyé" ? (
          <>
            <Link className="btn btn-primary mt-4 w-full" to="/espace/signer/$id" params={{ id: quote.id }}>Signer le devis</Link>
            <button className="btn btn-quiet mt-2 w-full" type="button" onClick={() => setAskRefuse(true)}>Refuser</button>
            {askRefuse ? (
              <div className="mt-3 rounded-2xl border border-line p-3">
                <p>Refuser le devis {quote.number} annule la demande. L’agent pourra en établir un nouveau.</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn btn-primary" type="button" onClick={() => void clientRefuse({ data: quote.id }).then(() => reload())}>Oui, refuser</button>
                  <button className="btn btn-quiet" type="button" onClick={() => setAskRefuse(false)}>Retour</button>
                </div>
              </div>
            ) : null}
            <p className="mt-3 text-muted">La signature en ligne vaut acceptation du devis et de nos conditions générales de vente.</p>
          </>
        ) : null}
        <Link className="btn btn-quiet mt-2 w-full" to="/espace/messages">Poser une question</Link>
      </PieceView>
    </Shell>
  );
}

function SignCard({ quote }: { quote: Parameters<typeof signRows>[0] }) {
  const rows = signRows(quote);
  if (!rows.length) return null;
  return (
    <div className="mt-4 grid gap-2 rounded-2xl bg-canvas p-3">
      <p className="font-semibold">Signature électronique</p>
      {rows.map((row) => (
        <p key={row.label}>
          <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">{row.label}</span>
          <span className="break-words">{row.value}</span>
        </p>
      ))}
    </div>
  );
}
