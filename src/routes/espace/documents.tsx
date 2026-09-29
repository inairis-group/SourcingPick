import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { DataTable, Td } from "@/components/ops-ui";
import { frDate, useClient } from "@/components/client-ui";
import { clientFile } from "@/lib/ops.functions";

export const Route = createFileRoute("/espace/documents")({
  head: () => ({ meta: [{ title: "SourcingPick — Documents" }] }),
  component: Page,
});

function Page() {
  const { data, error } = useClient();
  const [note, setNote] = useState("");
  const documents = data?.documents ?? [];

  async function download(id: string, name: string) {
    setNote("");
    try {
      const file = await clientFile({ data: id });
      const bytes = Uint8Array.from(atob(file.data), (char) => char.charCodeAt(0));
      const blob = new Blob([bytes], { type: file.mime || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName || name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Téléchargement impossible.");
    }
  }

  return (
    <Shell>
      <PageHead title="Documents" />
      <p className="mb-4 max-w-3xl text-sm text-muted">
        Photos, fichiers joints à vos demandes, devis et factures. Tout ce qui vous concerne est ici.
      </p>
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      {note ? <p className="mb-4 text-sm text-[#8a1c1c]">{note}</p> : null}
      <DataTable head={["Document", "Catégorie", "Dossier", "Émis le", ""]}>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <Td className="font-semibold">{doc.title}</Td>
            <Td>{doc.category}</Td>
            <Td className="mono">{doc.orderRef || "—"}</Td>
            <Td>{frDate(doc.issuedOn)}</Td>
            <Td className="text-right">
              {doc.byteSize > 0 ? (
                <button className="font-semibold text-[#155DFC]" type="button" onClick={() => void download(doc.id, doc.title)}>
                  Télécharger
                </button>
              ) : doc.orderRef ? (
                <Link className="font-semibold text-[#155DFC]" to="/espace/demandes/$id" params={{ id: doc.orderRef }} search={{ envoyee: false }}>
                  Ouvrir
                </Link>
              ) : (
                "—"
              )}
            </Td>
          </tr>
        ))}
        {(data?.quotes ?? []).map((quote) => (
          <tr key={quote.id}>
            <Td className="font-semibold">Devis {quote.number}</Td>
            <Td>Devis</Td>
            <Td className="mono">{quote.orderRef || "—"}</Td>
            <Td>{frDate(quote.issuedOn)}</Td>
            <Td className="text-right">
              <Link className="font-semibold text-[#155DFC]" to="/espace/devis/$id" params={{ id: quote.id }}>
                Ouvrir
              </Link>
            </Td>
          </tr>
        ))}
        {(data?.invoices ?? []).map((invoice) => (
          <tr key={invoice.id}>
            <Td className="font-semibold">{invoice.number}</Td>
            <Td>Facture</Td>
            <Td className="mono">{invoice.orderRef || "—"}</Td>
            <Td>{frDate(invoice.issuedOn || invoice.receivedOn)}</Td>
            <Td className="text-right">
              <Link className="font-semibold text-[#155DFC]" to="/espace/facture/$id" params={{ id: invoice.id }}>
                Ouvrir
              </Link>
            </Td>
          </tr>
        ))}
      </DataTable>
      {!documents.length && !(data?.quotes ?? []).length && !(data?.invoices ?? []).length ? (
        <p className="mt-4 text-sm text-muted">Aucun document pour le moment. Les fichiers joints à une demande apparaissent ici.</p>
      ) : null}
    </Shell>
  );
}
