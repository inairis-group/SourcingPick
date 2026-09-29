import type { ReactNode } from "react";

export function ChatColumn({
  title,
  subtitle,
  messages,
  draft,
  onDraft,
  onSend,
  extra,
  hideBar,
}: {
  title: string;
  subtitle: string;
  messages: Array<{ id: string; author: string; at: string; body: string; mine: boolean; internal?: boolean; node?: ReactNode }>;
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  extra?: ReactNode;
  hideBar?: boolean;
}) {
  return (
    <section className="flex h-[72vh] min-h-[420px] flex-col overflow-hidden rounded-[22px] border border-line bg-white">
      <header className="border-b border-line px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </header>
      <ul className="flex flex-1 flex-col gap-2 overflow-auto bg-[#f4f7fb] px-4 py-4">
        {messages.length === 0 ? <li className="m-auto text-sm text-muted">Aucun message. Écrivez le premier.</li> : null}
        {messages.map((message) => (
          <li
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
              message.internal ? "self-center bg-[#fff4d8] text-[#0e1a3d]" : message.mine ? "self-end bg-[#155dfc] text-white" : "self-start border border-line bg-white text-[#0e1a3d]"
            }`}
          >
            <p className={`text-[11px] ${message.mine && !message.internal ? "text-white/75" : "text-muted"}`}>
              {message.author} · {message.at}
            </p>
            {message.node ?? <p className="mt-1 whitespace-pre-wrap">{message.body}</p>}
            {message.internal ? <p className="mt-1 text-[11px] text-[#8a5a00]">Note interne</p> : null}
          </li>
        ))}
      </ul>
      <form
        className="grid gap-2 border-t border-line bg-white p-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!hideBar) onSend();
        }}
      >
        {extra}
        {hideBar ? null : (
          <div className="flex items-end gap-2">
            <textarea className="field min-h-12 flex-1" value={draft} onChange={(event) => onDraft(event.target.value)} placeholder="Écrire…" />
            <button className="btn btn-primary" type="submit">Envoyer</button>
          </div>
        )}
      </form>
    </section>
  );
}
