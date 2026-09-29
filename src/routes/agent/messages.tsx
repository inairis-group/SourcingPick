import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { useOps } from "@/components/ops-ui";
import { opsAddMessage, opsClients, opsDocumentFile, opsDocuments, opsInbox, opsOrders } from "@/lib/ops.functions";
import type { OpsClient, OpsDocument, OpsInboxItem } from "@/lib/ops.shared";
import { clientLabel } from "@/lib/ops.shared";
import { useAccount } from "@/lib/use-account";
import { useUi } from "@/lib/ui-lang";
import { ChatColumn } from "@/components/chat";
import { VoiceNote } from "@/components/piece";

export const Route = createFileRoute("/agent/messages")({
  head: () => ({ meta: [{ title: "SourcingPick — Messages" }] }),
  component: Page,
});

function Page() {
  const account = useAccount();
  const { t } = useUi();
  const me = account?.name ?? "";
  const { data, error, reload } = useOps(async () => {
    const [inbox, orders] = await Promise.all([opsInbox(), opsOrders()]);
    return { inbox, orders };
  });
  const [documents, setDocuments] = useState<OpsDocument[]>([]);
  const [picked, setPicked] = useState("");
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [localError, setLocalError] = useState("");
  const [draftClient, setDraftClient] = useState("");
  const [draftOrder, setDraftOrder] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [accounts, setAccounts] = useState<OpsClient[]>([]);
  useEffect(() => {
    void opsClients().then(setAccounts).catch(() => setAccounts([]));
    void opsDocuments().then(setDocuments).catch(() => setDocuments([]));
  }, []);
  const threads = useMemo(() => {
    const grouped = group(data?.inbox ?? [], account?.role === "admin" ? "" : me);
    const known = new Set(grouped.map((thread) => thread.orderId));
    for (const order of data?.orders ?? []) {
      if (account?.role !== "admin" && order.agentName !== me) continue;
      if (known.has(order.id)) continue;
      grouped.push({
        orderId: order.id,
        ref: order.ref,
        product: order.product,
        agentName: order.agentName,
        when: "",
        preview: "Aucun message",
        items: [],
      });
    }
    return grouped;
  }, [data, account?.role, me]);
  const current = threads.find((thread) => thread.orderId === picked) ?? threads[0];
  const talked = (data?.orders ?? []).find((order) => order.id === current?.orderId);
  const canWrite = account?.role === "admin" || Boolean(talked?.clientTalk);
  const accountClient = accounts.find((item) => item.id === draftClient);
  const dossiers = (data?.orders ?? []).filter((order) => {
    if (!accountClient) return false;
    const who = `${order.clientName}`.toLowerCase();
    return who === accountClient.company.toLowerCase() || who === accountClient.name.toLowerCase() || who === clientLabel(accountClient).toLowerCase();
  });

  return (
    <Shell>
      <PageHead title="Messages" />
      {error || localError ? <p className="mb-4 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {account?.role === "admin" ? (
      <form
        className="card mb-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const text = draftBody.trim();
          if (!draftOrder || !text) return;
          setLocalError("");
          void opsAddMessage({ data: { orderId: draftOrder, body: text, internalOnly: false } })
            .then(() => {
              setDraftBody("");
              setPicked(draftOrder);
              reload();
            })
            .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Discussion impossible."));
        }}
      >
        <h2 className="font-semibold sm:col-span-2">Nouvelle discussion</h2>
        <label className="text-sm">Client
          <select className="field mt-1" value={draftClient} required onChange={(event) => { setDraftClient(event.target.value); setDraftOrder(""); }}>
            <option value="">Choisir un client</option>
            {accounts.map((item) => (
              <option key={item.id} value={item.id}>{clientLabel(item)} — {item.email}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">Dossier
          <select className="field mt-1" value={draftOrder} required onChange={(event) => setDraftOrder(event.target.value)}>
            <option value="">{accountClient ? "Choisir un dossier" : "D’abord le client"}</option>
            {dossiers.map((order) => (
              <option key={order.id} value={order.id}>{order.ref} — {order.product}</option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">Premier message
          <textarea className="field mt-1 min-h-20" value={draftBody} required onChange={(event) => setDraftBody(event.target.value)} />
        </label>
        <button className="btn btn-primary w-fit" type="submit">Ouvrir la discussion</button>
      </form>
      ) : (
        <p className="mb-4 text-sm text-muted">Vous voyez les dossiers qui vous sont attribués. Écrire au client n’est possible que si l’administration vous y autorise. Sinon, laissez une note interne.</p>
      )}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="card min-w-0 overflow-hidden">
          <h2 className="mb-3 font-semibold">{t("Conversations")}</h2>
          {threads.length === 0 ? <p className="text-sm text-muted">{t("Aucun message sur vos dossiers.")}</p> : null}
          <ul className="grid min-w-0 gap-1">
            {threads.map((thread) => (
              <li key={thread.orderId} className="min-w-0">
                <button
                  type="button"
                  className={`block w-full min-w-0 overflow-hidden rounded-xl px-3 py-2 text-left text-sm ${current?.orderId === thread.orderId ? "bg-navy text-white" : ""}`}
                  onClick={() => setPicked(thread.orderId)}
                >
                  <span className="mono block truncate text-xs">{thread.ref}</span>
                  <span className="block truncate text-xs opacity-70">{thread.when}</span>
                  <span className="block truncate font-semibold">{thread.product}</span>
                  <span className="mt-0.5 block truncate opacity-80">{thread.preview}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {current ? (
          <ChatColumn
            title={current.product || current.ref}
            subtitle={`${current.agentName || "Agent"} · ${current.ref}`}
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
                {canWrite ? t("Message interne") : "Note interne — vous n’êtes pas autorisé à écrire au client"}
              </label>
            }
            messages={current.items.map((message) => ({
              id: message.id,
              author: message.author,
              at: message.atLabel,
              body: message.body,
              mine: message.author === (current.agentName || me),
              internal: message.internalOnly,
              node: message.kind === "voice"
                ? <VoiceNote body={message.body} />
                : <PhotoLine body={message.body} docs={documents.filter((doc) => doc.orderRef === current.ref)} />,
            }))}
            onSend={() => {
              const text = body.trim();
              if (!text) return;
              const quiet = !canWrite || internal;
              void opsAddMessage({ data: { orderId: current.orderId, body: text, internalOnly: quiet } })
                .then((result) => {
                  setBody("");
                  if (canWrite) setInternal(false);
                  setLocalError(quiet || result.emailed ? "" : "Message enregistré. Pas d’email client sur cette commande.");
                  reload();
                })
                .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Envoi impossible."));
            }}
          />
        ) : null}
      </div>
    </Shell>
  );
}

function PhotoLine({ body, docs }: { body: string; docs: OpsDocument[] }) {
  const title = body.replace(/ est visible dans les photos de votre commande\.$/, "");
  const doc = title === body ? undefined : docs.find((item) => item.title === title || item.fileName === title);
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (!doc?.byteSize || !doc.mime.startsWith("image/")) return;
    let live = true;
    void opsDocumentFile({ data: doc.id })
      .then((file) => {
        if (live && file.mime.startsWith("image/")) setSrc(`data:${file.mime};base64,${file.data}`);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [doc?.id, doc?.byteSize, doc?.mime]);
  if (!src) return <p className="mt-1 break-words whitespace-pre-wrap">{body}</p>;
  return (
    <p className="mt-1">
      <img src={src} alt={title} className="max-h-56 max-w-full rounded-xl" />
    </p>
  );
}

function group(items: OpsInboxItem[], agentName: string) {
  const map = new Map<string, OpsInboxItem[]>();
  for (const item of items) {
    if (agentName && item.agentName !== agentName) continue;
    const list = map.get(item.orderId) ?? [];
    list.push(item);
    map.set(item.orderId, list);
  }
  return [...map.values()].map((list) => {
    const last = [...list].reverse().find((item) => !item.internalOnly) ?? list[list.length - 1];
    return {
      orderId: list[0].orderId,
      ref: list[0].ref,
      product: list[0].product,
      agentName: list[0].agentName,
      when: last.atLabel,
      preview: last.body,
      items: list,
    };
  });
}
