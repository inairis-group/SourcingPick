import { Link } from "@tanstack/react-router";
import { dueCents, formatDateSlash, formatEUR, type Document } from "@/lib/docs";
import { useAtelier } from "@/lib/store";
import { StatusPill } from "@/components/status";

export function DocTable({ docs, empty }: { docs: Document[]; empty: string }) {
  const clients = useAtelier((s) => s.clients);
  if (docs.length === 0) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr>
            {["Référence", "Client", "Montant", "Date", "État", ""].map((h) => (
              <th key={h} className="mono pb-3 text-[11px] font-semibold tracking-wider text-muted uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => {
            const client = clients.find((c) => c.id === doc.clientId);
            const to = doc.kind === "devis" ? "/devis/$id" : doc.kind === "facture" ? "/factures/$id" : "/avoirs/$id";
            return (
              <tr key={doc.id}>
                <td className="border-t border-line py-3.5 pe-4">
                  <span className="mono text-sm font-semibold">{doc.number}</span>
                </td>
                <td className="border-t border-line py-3.5 pe-4 text-sm">{client?.legalName ?? "—"}</td>
                <td className="mono border-t border-line py-3.5 pe-4 text-sm">{formatEUR(dueCents(doc))}</td>
                <td className="mono border-t border-line py-3.5 pe-4 text-sm">{formatDateSlash(doc.issueDate)}</td>
                <td className="border-t border-line py-3.5 pe-4">
                  <StatusPill doc={doc} />
                </td>
                <td className="border-t border-line py-3.5 text-right">
                  <Link to={to} params={{ id: doc.id }} className="text-sm font-semibold text-brand">
                    Ouvrir
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
