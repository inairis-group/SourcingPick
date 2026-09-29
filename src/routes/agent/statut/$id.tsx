import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, useOps } from "@/components/ops-ui";
import { opsAddDocument, opsOrder, opsSetState } from "@/lib/ops.functions";
import { STATE_TREE } from "@/lib/ops.shared";
import { useUi } from "@/lib/ui-lang";

export const Route = createFileRoute("/agent/statut/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Statut" }] }),
  component: Page,
});

const ALLOWED = new Set(["Préparation terminée", "Expédié", "En transit"]);

function Page() {
  const { id } = Route.useParams();
  const { t } = useUi();
  const { data, error, reload } = useOps(() => opsOrder({ data: id }), `order:${id}`);
  const order = data?.order;
  const [sub, setSub] = useState("");
  const [comment, setComment] = useState("");
  const [kind, setKind] = useState("Contrôle");
  const [title, setTitle] = useState("");
  const [info, setInfo] = useState("");
  const chosen = sub || order?.substate || "";
  const groups = STATE_TREE.filter((group) => ALLOWED.has(group.state));

  return (
    <Shell>
      <PageHead title={order?.ref ?? "Statut"}>
        <Link to="/demandes/$id" params={{ id: order?.id ?? id }} className="btn btn-quiet">{t("Qualifier")}</Link>
        <Link to="/agent/messages" className="btn btn-quiet">Messages</Link>
      </PageHead>
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      {order ? (
        <p className="mb-4 text-sm text-muted">
          {order.product} · {order.clientName} <Badge value={order.state} />
        </p>
      ) : null}
      {order ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="card">
            <h2 className="font-semibold">{t("Mettre à jour l’état")}</h2>
            <p className="mt-1 text-sm text-muted">
              {t("Un agent peut passer une commande en préparation terminée, expédiée ou en transit.")}
            </p>
            {groups.map((group) => (
              <fieldset key={group.state} className="mt-4">
                <legend className="text-xs font-semibold tracking-wide text-muted uppercase">{t(group.state)}</legend>
                <div className="mt-2 grid gap-1">
                  {group.subs.map((item) => (
                    <label key={item.name} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="substate" checked={chosen === item.name} onChange={() => setSub(item.name)} />
                      <span>{t(item.name)}</span>
                      {item.internal ? <span className="text-xs text-muted">{t("Interne, non visible par le client")}</span> : null}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <label className="mt-4 block text-sm">
              {t("Commentaire pour le client")}
              <textarea className="field mt-1" value={comment} onChange={(event) => setComment(event.target.value)} />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  void opsSetState({ data: { id: order.id, substate: chosen, comment } }).then(() => {
                    setInfo(t("État publié au client."));
                    setComment("");
                    reload();
                  });
                }}
              >
                {t("Publier au client")}
              </button>
              <button className="btn btn-quiet" type="button" onClick={() => { setSub(order.substate); setComment(""); setInfo(""); }}>
                {t("Annuler")}
              </button>
            </div>
            {info ? <p className="mt-3 text-sm text-[#0e9f6e]">{info}</p> : null}
          </section>
          <section className="card">
            <h2 className="font-semibold">{t("Ajouter des photos")}</h2>
            <p className="mt-1 text-xs text-muted">{t("JPG, PNG, MP4. La pièce est rangée dans le dossier client.")}</p>
            <label className="mt-3 block text-sm">
              {t("Ajouter des photos")}
              <input
                className="mt-1 block w-full text-sm"
                type="file"
                accept="image/jpeg,image/png,video/mp4"
                onChange={(event) => setTitle(event.target.files?.[0]?.name ?? "")}
              />
            </label>
            <label className="mt-3 block text-sm">
              {t("Type de photo")}
              <select className="field mt-1" value={kind} onChange={(event) => setKind(event.target.value)}>
                <option value="Réception">{t("Réception")}</option>
                <option value="Contrôle">{t("Contrôle")}</option>
                <option value="Chargement">{t("Chargement")}</option>
              </select>
            </label>
            <button
              className="btn btn-quiet mt-3 w-full"
              type="button"
              disabled={!title}
              onClick={() => {
                void opsAddDocument({
                  data: {
                    clientName: order.clientName,
                    category: "Photos et vidéos",
                    title: `${title} · ${kind}`,
                    orderRef: order.ref,
                  },
                }).then(() => setInfo(t("Photos publiées : elles sont visibles par le client, avec la date et l’auteur.")));
              }}
            >
              {t("Ajouter des photos")}
            </button>
          </section>
        </div>
      ) : null}
    </Shell>
  );
}
