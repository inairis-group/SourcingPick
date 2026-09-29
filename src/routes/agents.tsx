import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Notice, Td, useOps } from "@/components/ops-ui";
import { opsInvite, opsSuspend, opsUsers } from "@/lib/ops.functions";

export const Route = createFileRoute("/agents")({
  head: () => ({ meta: [{ title: "SourcingPick — Agents" }] }),
  component: Page,
});

function Page() {
  const { data, error, reload } = useOps(() => opsUsers());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");
  const agents = (data ?? []).filter((user) => user.role === "agent");

  return (
    <Shell>
      <PageHead title="Agents" />
      <Notice>Un agent qualifie, chiffre, fait avancer l’état et répond aux messages. Il n’accède ni aux paramètres, ni aux gabarits, ni aux invitations.</Notice>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      <form
        className="card mb-4 grid max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void opsInvite({ data: { name, email } })
            .then(() => {
              setName("");
              setEmail("");
              setInfo("Lien d’activation valable 48 heures. Aucun mot de passe n’est envoyé par email.");
              reload();
            })
            .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Invitation impossible."));
        }}
      >
        <h2 className="font-semibold">Inviter un agent</h2>
        <label className="text-sm">Nom
          <input className="field mt-1" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="text-sm">Email
          <input className="field mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <button className="btn btn-primary" type="submit">Envoyer l’invitation</button>
      </form>
      <DataTable head={["Agent", "Email", "Dernière connexion", "Vérification", ""]}>
        {agents.map((agent) => (
          <tr key={agent.id}>
            <Td className="font-semibold">{agent.name}</Td>
            <Td>{agent.email}</Td>
            <Td>{agent.lastSeen || "—"}</Td>
            <Td><Badge value={agent.active ? agent.verification : "Suspendu"} /></Td>
            <Td>
              <button className="font-semibold text-brand" type="button" onClick={() => void opsSuspend({ data: { id: agent.id, active: !agent.active } }).then(reload)}>
                {agent.active ? "Suspendre" : "Rétablir"}
              </button>
            </Td>
          </tr>
        ))}
      </DataTable>
    </Shell>
  );
}
