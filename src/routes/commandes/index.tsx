import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td, useOps } from "@/components/ops-ui";
import { opsClients, opsCreateOrder, opsDeleteOrder, opsOrders } from "@/lib/ops.functions";
import { clientLabel, type OpsClient } from "@/lib/ops.shared";
import { useAccount } from "@/lib/use-account";
import { useUi } from "@/lib/ui-lang";

export const Route = createFileRoute("/commandes/")({
  head: () => ({ meta: [{ title: "SourcingPick — Commandes" }] }),
  component: Page,
});

function Page() {
  const { t } = useUi();
  const account = useAccount();
  const admin = account?.role === "admin";
  const navigate = useNavigate();
  const { data, error, reload } = useOps(() => opsOrders());
  const [busy, setBusy] = useState("");
  const [clientId, setClientId] = useState("");
  const [product, setProduct] = useState("");
  const [note, setNote] = useState("");
  const [accounts, setAccounts] = useState<OpsClient[]>([]);
  const [localError, setLocalError] = useState("");
  useEffect(() => {
    void opsClients().then(setAccounts).catch(() => setAccounts([]));
  }, []);
  const client = accounts.find((item) => item.id === clientId);
  const rows = (data ?? []).filter((row) => admin || !account || row.agentName === account.name);
  return (
    <Shell>
      <PageHead title="Commandes" />
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {admin ? (
      <form
        className="card mb-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setLocalError("");
          void opsCreateOrder({ data: { clientName: client ? (client.company || client.name) : "", product, note } })
            .then((order) => navigate({ to: "/commandes/$id", params: { id: order.id } }))
            .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Création impossible."));
        }}
      >
        <h2 className="font-semibold sm:col-span-2">Nouvelle commande</h2>
        <label className="text-sm">Client
          <select className="field mt-1" value={clientId} required onChange={(event) => setClientId(event.target.value)}>
            <option value="">Choisir un client</option>
            {accounts.map((item) => (
              <option key={item.id} value={item.id}>{clientLabel(item)} — {item.email}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">Produit ou prestation
          <input className="field mt-1" value={product} required placeholder="Ce que le client commande" onChange={(event) => setProduct(event.target.value)} />
        </label>
        <label className="text-sm sm:col-span-2">Note
          <input className="field mt-1" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <button className="btn btn-primary w-fit" type="submit">Créer la commande</button>
      </form>
      ) : null}
      <DataTable head={["Référence", "Client", "Produit", "Agent", "État", "Sous-état", ""]}>
        {rows.map((row) => (
          <tr key={row.id} className="cursor-pointer" onDoubleClick={() => void navigate({ to: "/commandes/$id", params: { id: row.id } })}>
            <Td className="mono font-semibold">{row.ref}</Td>
            <Td>{row.clientName}</Td>
            <Td>{row.product}</Td>
            <Td>{row.agentName}</Td>
            <Td><Badge value={row.state} /></Td>
            <Td>{row.substate}</Td>
            <Td>
              <span className="flex items-center gap-3">
                <Link to="/commandes/$id" params={{ id: row.id }} className="font-semibold text-brand">{t("Ouvrir")}</Link>
                <Link to="/commandes/$id" params={{ id: row.id }} hash="messages" className="font-semibold text-brand">{t("Messages")}</Link>
                {admin ? (
                <button
                  type="button"
                  className="font-semibold text-[#8a1c1c] disabled:opacity-50"
                  disabled={busy === row.id}
                  onClick={() => {
                    if (!window.confirm(`Supprimer la commande ${row.ref} ?`)) return;
                    setBusy(row.id);
                    void opsDeleteOrder({ data: row.id })
                      .then(() => reload())
                      .catch((err: unknown) => window.alert(err instanceof Error ? err.message : "Suppression impossible."))
                      .finally(() => setBusy(""));
                  }}
                >
                  {t("Supprimer")}
                </button>
                ) : null}
              </span>
            </Td>
          </tr>
        ))}
      </DataTable>
      {rows.length === 0 ? <p className="mt-4 text-sm text-muted">Aucune commande.</p> : null}
    </Shell>
  );
}