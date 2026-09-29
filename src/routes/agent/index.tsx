import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Hero, Stat } from "@/components/design";
import { Badge, DataTable, Td, useOps } from "@/components/ops-ui";
import { opsInbox, opsOrders } from "@/lib/ops.functions";
import { useAccount } from "@/lib/use-account";
import { useUi } from "@/lib/ui-lang";

export const Route = createFileRoute("/agent/")({
  head: () => ({ meta: [{ title: "SourcingPick — Mon travail" }] }),
  component: Page,
});

const OPEN = new Set(["Paiement reçu", "Préparation terminée", "Expédié", "En transit"]);

function Page() {
  const account = useAccount();
  const { t } = useUi();
  const me = account?.name ?? "";
  const { data, error } = useOps(async () => {
    const [orders, inbox] = await Promise.all([opsOrders(), opsInbox()]);
    return { orders, inbox };
  });
  const orders = data?.orders ?? [];
  const mine = orders.filter((order) => order.agentName === me && !["Terminé", "Annulé"].includes(order.state));
  const toUpdate = mine.filter((order) => OPEN.has(order.state));
  const lastByOrder = new Map<string, { author: string; agentName: string }>();
  for (const message of data?.inbox ?? []) {
    if (message.internalOnly) continue;
    lastByOrder.set(message.orderId, { author: message.author, agentName: message.agentName });
  }
  const unanswered = [...lastByOrder.values()].filter((row) => row.agentName === me && row.author !== me).length;
  const queue = mine.slice(0, 12);

  return (
    <Shell>
      <Hero
        kicker={t("Agent")}
        title={t("Mon travail du jour")}
        text={t("Vous suivez les dossiers qui vous sont attribués. Vous n’écrivez pas au client, sauf si l’administration vous y autorise.")}
      >
        <Link to="/commandes" className="btn btn-quiet">{t("Mes commandes")}</Link>
      </Hero>
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Dossiers attribués")} value={String(mine.length)} />
        <Stat label={t("Commandes à mettre à jour")} value={String(toUpdate.length)} />
        <Stat label={t("Messages sans réponse")} value={String(unanswered)} />
      </section>
      <h2 className="display mb-3 text-lg">{t("Dossiers attribués")}</h2>
      <DataTable head={["Référence", "Produit", "État", "Sous-état", ""]}>
        {queue.map((order) => (
            <tr key={order.id}>
              <Td className="mono font-semibold">{order.ref}</Td>
              <Td>{order.product}</Td>
              <Td><Badge value={order.state} /></Td>
              <Td><Badge value={order.substate} /></Td>
              <Td className="text-right">
                <Link className="font-semibold text-[#155DFC]" to="/commandes/$id" params={{ id: order.id }}>
                  {t("Ouvrir")}
                </Link>
              </Td>
            </tr>
        ))}
      </DataTable>
      {queue.length === 0 ? <p className="mt-3 text-sm text-muted">{t("Aucun dossier dans votre file.")}</p> : null}
      <p className="mt-4 text-sm">
        <Link to="/agent/finances" className="font-semibold text-[#155DFC]">{t("Mes commissions")}</Link>
      </p>
    </Shell>
  );
}

