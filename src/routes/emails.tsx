import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { DataTable, Td, useOps } from "@/components/ops-ui";
import { opsEmails, opsSaveEmail } from "@/lib/ops.functions";
import { opsMailLog } from "@/lib/commerce.functions";
import type { OpsEmail } from "@/lib/ops.shared";
import { RichField } from "@/components/marks";
import { MailFrame } from "@/components/mail-frame";

export const Route = createFileRoute("/emails")({
  head: () => ({ meta: [{ title: "SourcingPick — Emails" }] }),
  component: Page,
});

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function Page() {
  const { data, error, reload } = useOps(() => opsEmails());
  const mails = useOps(() => opsMailLog(), "mails");
  const [draft, setDraft] = useState<OpsEmail | null>(null);
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");
  const templates = data?.templates ?? [];

  return (
    <Shell>
      <PageHead title="Emails" />
      <p className="-mt-3 mb-4 max-w-3xl text-sm leading-relaxed text-muted">
        Cliquez un gabarit pour le modifier et voir le rendu. Les décorations sont ajoutées à l’envoi, pas dans la liste.
      </p>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      {draft ? (
        <form
          className="mb-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]"
          onSubmit={(event) => {
            event.preventDefault();
            void opsSaveEmail({ data: draft })
              .then(() => {
                setInfo("Gabarit enregistré.");
                setDraft(null);
                reload();
              })
              .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Enregistrement impossible."));
          }}
        >
          <section className="card grid gap-3">
            <h2 className="font-semibold">{draft.name}</h2>
            <p className="text-sm text-muted">{draft.category} · {draft.triggerLabel}</p>
            <label className="text-sm">Objet
              <input className="field mt-1" value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} />
            </label>
            <div>
              <p className="mb-1 text-sm font-semibold">Message</p>
              <RichField value={draft.body} onChange={(body) => setDraft({ ...draft, body })} minHeight="12rem" />
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" type="submit">Enregistrer</button>
              <button className="btn btn-quiet" type="button" onClick={() => setDraft(null)}>Fermer</button>
            </div>
          </section>
          <MailPreview subject={draft.subject} text={draft.body} />
        </form>
      ) : null}
      <h2 className="display mb-3 text-lg">Suivi des envois</h2>
      <p className="-mt-2 mb-3 max-w-3xl text-sm text-muted">Seulement les clients. Les essais envoyés à l’administration ne sont pas dans ce tableau. Reçu = accepté par le serveur. Ouvert = les images du mail ont été chargées. Clics = nombre d’ouvertures du lien.</p>
      <DataTable head={["Quand", "Destinataire", "Sujet", "Reçu", "Ouvert", "Clics"]}>
        {(mails.data ?? []).map((row) => (
          <tr key={row.id}>
            <Td>{row.at}</Td>
            <Td>{row.to}</Td>
            <Td>{row.subject}</Td>
            <Td>{row.accepted ? "Oui" : "Non"}</Td>
            <Td>{row.opens ? `${row.opens} fois · ${row.opened}` : "Pas encore"}</Td>
            <Td>{row.clicks ? `${row.clicks} fois · ${row.clicked}` : "Pas encore"}</Td>
          </tr>
        ))}
      </DataTable>
      {mails.data && mails.data.length === 0 ? <p className="mt-3 mb-4 text-sm text-muted">Les prochains mails seront suivis ici.</p> : <div className="mb-4" />}
      <h2 className="display mb-3 text-lg">Derniers envois</h2>
      <DataTable head={["Quand", "Destinataire", "Sujet", "Résultat"]}>
        {(data?.outbox ?? []).map((row) => (
          <tr key={row.id}>
            <Td>{when(row.at)}</Td>
            <Td>{row.to}</Td>
            <Td>{row.subject}</Td>
            <Td>{row.sent ? "Parti" : "Refusé"}</Td>
          </tr>
        ))}
      </DataTable>
      {(data && data.outbox.length === 0) ? <p className="mt-3 mb-4 text-sm text-muted">Aucun envoi enregistré pour le moment.</p> : <div className="mb-4" />}
      <h2 className="display mb-3 text-lg">Gabarits</h2>
      <DataTable head={["Gabarit", "Catégorie", "Déclenchement", ""]}>
        {templates.map((email) => (
          <tr key={email.id}>
            <Td className="font-semibold">{email.name}</Td>
            <Td>{email.category}</Td>
            <Td>{email.triggerLabel}</Td>
            <Td>
              <button className="font-semibold text-brand" type="button" onClick={() => { setDraft(email); setInfo(""); }}>Modifier</button>
            </Td>
          </tr>
        ))}
      </DataTable>
    </Shell>
  );
}

function MailPreview({ subject, text }: { subject: string; text: string }) {
  return (
    <MailFrame
      subject={subject || "Sourcing Pick"}
      text={text}
      dress={{ badge: "APERÇU", title: subject || "Message", ctaLabel: "Ouvrir", ctaHref: "https://sourcingpick.com" }}
    />
  );
}
