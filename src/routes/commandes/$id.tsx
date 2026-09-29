import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChatColumn } from "@/components/chat";
import { PageHead, Shell } from "@/components/shell";
import { Badge, useOps } from "@/components/ops-ui";
import { opsAddMessage, opsAssign, opsOrder, opsOrderTalk, opsSetState, opsUsers } from "@/lib/ops.functions";
import { STATE_TREE } from "@/lib/ops.shared";
import { useAccount } from "@/lib/use-account";

export const Route = createFileRoute("/commandes/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Commande" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const account = useAccount();
  const admin = account?.role === "admin";
  const { data, error, reload } = useOps(async () => {
    const pack = await opsOrder({ data: id });
    if (!pack) throw new Error("Commande introuvable.");
    return pack;
  }, `order:${id}`);
  const order = data?.order ?? null;
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [agent, setAgent] = useState("");
  const [sub, setSub] = useState("");
  const [comment, setComment] = useState("");
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!admin) return;
    void opsUsers()
      .then((rows) => setAgents(rows.filter((row) => row.role === "agent" && row.active).map((row) => ({ id: row.id, name: row.name }))))
      .catch(() => setAgents([]));
  }, [admin]);

  useEffect(() => {
    if (order) setAgent(order.agentName === "Équipe Hangzhou" ? "" : order.agentName);
  }, [order?.id, order?.agentName]);

  const canWrite = admin || Boolean(order?.clientTalk);
  const note = (order?.note || "").trim();

  function fail(err: unknown) {
    setLocalError(err instanceof Error ? err.message : "Action impossible.");
  }

  return (
    <Shell>
      <PageHead title={order?.ref ?? "Commande"}>
        {order ? <Link to="/demandes/$id" params={{ id: order.id }} className="btn btn-quiet">Demande</Link> : null}
      </PageHead>
      {error || localError ? <p className="mb-4 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {!order && !error ? <p className="text-sm text-muted">Chargement…</p> : null}
      {order ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <section className="card text-sm">
              <p className="font-semibold">{order.clientName}</p>
              <p className="mt-1 text-muted">{order.product}</p>
              <p className="mt-3 flex flex-wrap items-center gap-2">
                <Badge value={order.state} />
                <span className="text-muted">{order.substate}</span>
              </p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {order.clientEmail ? <a className="font-semibold text-brand" href={`mailto:${order.clientEmail}`}>{order.clientEmail}</a> : <span className="text-muted">Pas d’email</span>}
                {order.clientPhone ? <a className="font-semibold text-brand" href={`tel:${order.clientPhone.replace(/\s/g, "")}`}>{order.clientPhone}</a> : <span className="text-muted">Pas de téléphone</span>}
              </p>
              {note ? <p className="mt-3 whitespace-pre-wrap border-t border-line pt-3 text-muted">{note}</p> : null}
            </section>

            <section className="card text-sm">
              <h2 className="font-semibold">Agent</h2>
              <p className="mt-1 text-muted">L’agent suit le dossier. Il n’écrit pas au client, sauf si vous l’y autorisez.</p>
              {admin ? (
                <>
                  <label className="mt-3 block">
                    Agent du dossier
                    <select className="field mt-1" value={agent} onChange={(event) => setAgent(event.target.value)}>
                      <option value="">Personne</option>
                      {agents.map((row) => <option key={row.id} value={row.name}>{row.name}</option>)}
                    </select>
                  </label>
                  <button
                    className="btn btn-primary mt-3"
                    type="button"
                    onClick={() => {
                      setLocalError("");
                      void opsAssign({ data: { id: order.id, agentName: agent } })
                        .then(() => {
                          setInfo(agent ? `${agent} est sur ce dossier.` : "Aucun agent sur ce dossier.");
                          reload();
                        })
                        .catch(fail);
                    }}
                  >
                    Enregistrer l’agent
                  </button>
                  <label className="mt-4 flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={order.clientTalk}
                      onChange={(event) => {
                        const allowed = event.target.checked;
                        setLocalError("");
                        void opsOrderTalk({ data: { id: order.id, allowed } })
                          .then(() => {
                            setInfo(allowed ? "L’agent peut écrire au client." : "L’agent ne peut plus écrire au client.");
                            reload();
                          })
                          .catch(fail);
                      }}
                    />
                    <span>
                      <span className="block font-semibold">Autoriser l’agent à écrire au client</span>
                      <span className="text-muted">Sinon, seul vous lui écrivez. L’agent peut seulement laisser une note interne.</span>
                    </span>
                  </label>
                </>
              ) : (
                <p className="mt-3">
                  {order.agentName && order.agentName !== "Équipe Hangzhou" ? order.agentName : "Pas encore d’agent."}
                  <span className="mt-1 block text-muted">
                    {order.clientTalk ? "Vous pouvez écrire au client sur ce dossier." : "Vous ne pouvez pas écrire au client. Note interne seulement."}
                  </span>
                </p>
              )}
            </section>

            <section className="card text-sm">
              <h2 className="font-semibold">État</h2>
              <label className="mt-3 block">
                Nouvel état
                <select className="field mt-1" value={sub || order.substate} onChange={(event) => setSub(event.target.value)}>
                  {STATE_TREE.map((group) => (
                    <optgroup key={group.state} label={group.state}>
                      {group.subs.map((item) => (
                        <option key={item.name} value={item.name}>{item.name}{item.internal ? " (interne)" : ""}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="mt-3 block">
                Commentaire
                <textarea className="field mt-1" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Visible par le client seulement si le message part" />
              </label>
              <button
                className="btn btn-quiet mt-3"
                type="button"
                onClick={() => {
                  setLocalError("");
                  void opsSetState({ data: { id: order.id, substate: sub || order.substate, comment } })
                    .then(() => {
                      setInfo("État enregistré.");
                      setComment("");
                      reload();
                    })
                    .catch(fail);
                }}
              >
                Enregistrer l’état
              </button>
            </section>
            {info ? <p className="text-sm text-[#0e9f6e]">{info}</p> : null}
          </div>

          <ChatColumn
            title="Messages"
            subtitle={canWrite ? `${order.clientName} · ${order.ref}` : `Note interne · ${order.ref}`}
            draft={body}
            onDraft={setBody}
            extra={
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!canWrite || internal}
                  disabled={!canWrite}
                  onChange={(event) => setInternal(event.target.checked)}
                />
                {canWrite ? "Note interne, le client ne la voit pas" : "Note interne — vous n’êtes pas autorisé à écrire au client"}
              </label>
            }
            messages={(data?.messages ?? []).map((message) => ({
              id: message.id,
              author: message.author,
              at: message.atLabel,
              body: message.body,
              mine: message.author === account?.name,
              internal: message.internalOnly,
            }))}
            onSend={() => {
              const text = body.trim();
              if (!text) {
                setLocalError("Écrivez un message.");
                return;
              }
              const quiet = !canWrite || internal;
              setLocalError("");
              void opsAddMessage({ data: { orderId: order.id, body: text, internalOnly: quiet } })
                .then((result) => {
                  setBody("");
                  setInfo(quiet ? "Note interne enregistrée." : result.emailed ? "Message envoyé au client." : "Message dans le dossier. Le client le voit dans son espace.");
                  reload();
                })
                .catch(fail);
            }}
          />
        </div>
      ) : null}
    </Shell>
  );
}
