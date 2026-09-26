import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Shell, PageHead } from "@/components/shell";
import { StatusPill } from "@/components/status";
import { dueCents, formatDateSlash, formatEUR, isFacture } from "@/lib/docs";
import { useAtelier } from "@/lib/store";

export const Route = createFileRoute("/paiements")({ component: Page });

function Page() {
  const all = useAtelier((s) => s.docs);
  const docs = useMemo(() => all.filter(isFacture), [all]);
  const clients = useAtelier((s) => s.clients);
  const updateDoc = useAtelier((s) => s.updateDoc);
  return (
    <Shell>
      <PageHead title="Paiements" />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr>
              {["Facture", "Client", "Dû", "Reçu", "État", ""].map((h) => (
                <th key={h} className="mono pb-3 text-[11px] font-semibold tracking-wider text-muted uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => {
              const client = clients.find((c) => c.id === doc.clientId);
              return (
                <tr key={doc.id}>
                  <td className="border-t border-line py-3.5 pe-3">
                    <span className="mono text-sm font-semibold">{doc.number}</span>
                    <span className="mt-0.5 block text-xs text-muted">{formatDateSlash(doc.issueDate)}</span>
                  </td>
                  <td className="border-t border-line py-3.5 pe-3 text-sm">{client?.legalName ?? "—"}</td>
                  <td className="mono border-t border-line py-3.5 pe-3 text-sm">{formatEUR(dueCents(doc))}</td>
                  <td className="mono border-t border-line py-3.5 pe-3 text-sm">{doc.paidCents == null ? "—" : formatEUR(doc.paidCents)}</td>
                  <td className="border-t border-line py-3.5 pe-3">
                    <StatusPill doc={doc} />
                  </td>
                  <td className="border-t border-line py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      {doc.status !== "payee" ? (
                        <button
                          className="text-sm font-semibold text-brand"
                          type="button"
                          onClick={() =>
                            updateDoc(doc.id, {
                              status: "payee",
                              paidOn: doc.paidOn || new Date().toISOString().slice(0, 10),
                              paidCents: doc.paidCents ?? dueCents(doc),
                            })
                          }
                        >
                          Marquer payée
                        </button>
                      ) : null}
                      <Link to="/factures/$id" params={{ id: doc.id }} className="text-sm font-semibold">
                        Ouvrir
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {docs.length === 0 ? <p className="pt-3 text-sm text-muted">Aucune facture à suivre.</p> : null}
      </div>
    </Shell>
  );
}
