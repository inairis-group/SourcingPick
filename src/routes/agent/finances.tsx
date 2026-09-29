import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Td, useOps } from "@/components/ops-ui";
import { opsOrders, opsQuotes } from "@/lib/ops.functions";
import { euros, quoteMath } from "@/lib/ops.shared";
import { useAccount } from "@/lib/use-account";
import { useUi } from "@/lib/ui-lang";

export const Route = createFileRoute("/agent/finances")({
  head: () => ({ meta: [{ title: "SourcingPick — Commissions" }] }),
  component: Page,
});

function Page() {
  const account = useAccount();
  const { t } = useUi();
  const me = account?.name ?? "";
  const { data, error } = useOps(async () => {
    const [orders, quotes] = await Promise.all([opsOrders(), opsQuotes()]);
    return { orders, quotes };
  });
  const rows = (data?.orders ?? [])
    .filter((order) => account?.role === "admin" || order.agentName === me)
    .filter((order) => order.product !== "Assortiment sourcing")
    .map((order) => {
      const quote = data?.quotes.find((item) => item.orderRef === order.ref);
      const math = quote ? quoteMath(quote.lines, quote.goodsBps, quote.freightBps, quote.depositBps) : null;
      const commission = math ? math.goodsCommissionCents + math.freightCommissionCents : 0;
      const due = order.state === "Terminé" && commission > 0 ? Math.round(commission / 2) : 0;
      return { order, amount: quote?.amountCents ?? 0, due };
    });
  const total = rows.reduce((sum, row) => sum + row.due, 0);

  return (
    <Shell>
      <PageHead title="Mes commissions" />
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      <DataTable head={["Référence", "Produit", "Montant", "État", "Total"]}>
        {rows.map((row) => (
          <tr key={row.order.id}>
            <Td className="mono font-semibold">{row.order.ref}</Td>
            <Td>{row.order.product}</Td>
            <Td>{row.amount ? euros(row.amount) : "—"}</Td>
            <Td><Badge value={row.order.state} /></Td>
            <Td>{row.due ? euros(row.due) : "—"}</Td>
          </tr>
        ))}
        <tr>
          <Td className="font-semibold">{t("Total")}</Td>
          <Td> </Td>
          <Td> </Td>
          <Td> </Td>
          <Td className="font-semibold">{total ? euros(total) : "—"}</Td>
        </tr>
      </DataTable>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
        {t("L’agent perçoit 50 % de la commission Sourcing Pick encaissée sur les dossiers qu’il a suivis, une fois la commande close et le solde réglé.")}
      </p>
    </Shell>
  );
}
