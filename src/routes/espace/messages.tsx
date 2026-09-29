import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Composer, useClient } from "@/components/client-ui";
import { ChatColumn } from "@/components/chat";
import { VoiceNote } from "@/components/piece";
import { clientReply } from "@/lib/ops.functions";

export const Route = createFileRoute("/espace/messages")({
  head: () => ({ meta: [{ title: "SourcingPick — Messages" }] }),
  component: Page,
});

function Page() {
  const { data, error, reload } = useClient();
  const threads = new Map<string, { id: string; ref: string; product: string; agent: string; preview: string }>();
  for (const order of data?.orders ?? []) {
    threads.set(order.id, { id: order.id, ref: order.ref, product: order.product, agent: order.agentName, preview: "Aucun message pour le moment." });
  }
  for (const message of data?.messages ?? []) {
    const current = threads.get(message.orderId) ?? { id: message.orderId, ref: message.ref, product: message.product, agent: message.agentName, preview: "" };
    current.preview = message.body;
    threads.set(message.orderId, current);
  }
  const list = [...threads.values()];
  const [active, setActive] = useState("");
  const chosen = list.find((item) => item.id === (active || list[0]?.id));
  const messages = (data?.messages ?? []).filter((message) => message.orderId === chosen?.id || message.ref === chosen?.ref);
  return (
    <Shell>
      <PageHead title="Messages" />
      <p className="mb-4 text-sm text-muted">Un fil par demande. Écrivez ici, même avant qu’un agent ait répondu.</p>
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="card flex max-h-[70vh] min-w-0 flex-col gap-2 overflow-auto p-2">
          {list.map((thread) => (
            <button key={thread.id} type="button" className={`min-w-0 overflow-hidden rounded-xl px-3 py-2 text-left ${chosen?.id === thread.id ? "bg-canvas" : ""}`} onClick={() => setActive(thread.id)}>
              <p className="truncate font-semibold">{thread.ref}</p>
              <p className="truncate text-sm text-muted">{thread.product}</p>
              <p className="truncate text-sm">{thread.preview}</p>
            </button>
          ))}
          {list.length === 0 ? <p className="p-3 text-sm text-muted">Aucune demande pour le moment.</p> : null}
        </aside>
        {chosen ? (
        <ChatColumn
          title={chosen.agent || "Votre agent"}
          subtitle={`${chosen.product} · ${chosen.ref}`}
          draft=""
          onDraft={() => undefined}
          onSend={() => undefined}
          hideBar
          messages={messages.map((message) => ({
            id: message.id,
            author: message.author,
            at: message.atLabel,
            body: message.body,
            mine: message.author === data?.name,
            node: message.kind === "voice" ? <VoiceNote body={message.body} /> : undefined,
          }))}
          extra={
            <Composer
              onSend={async (body) => {
                await clientReply({ data: { orderId: chosen.id, body } });
                window.dispatchEvent(new Event("sp-bell-refresh"));
                reload();
              }}
            />
          }
        />
        ) : <p className="card text-sm text-muted">Choisissez une demande.</p>}
      </div>
    </Shell>
  );
}
