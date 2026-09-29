import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Notice, Td, useOps } from "@/components/ops-ui";
import { opsCreateUser, opsDeleteUser, opsResetPassword, opsSuspend, opsUpdateUser, opsUsers, opsVerify } from "@/lib/ops.functions";
import type { OpsUser } from "@/lib/ops.shared";
import { useAccount } from "@/lib/use-account";

export const Route = createFileRoute("/utilisateurs")({
  head: () => ({ meta: [{ title: "SourcingPick — Utilisateurs" }] }),
  component: Page,
});

function Page() {
  const me = useAccount();
  const { data, error, reload } = useOps(() => opsUsers());
  const [selected, setSelected] = useState<OpsUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");

  function pick(user: OpsUser) {
    setSelected(user);
    setEditName(user.name);
    setEditCompany(user.company);
    setEditPassword("");
    setInfo("");
  }

  return (
    <Shell>
      <PageHead title="Utilisateurs">
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setLocalError("");
            void opsCreateUser({ data: { name, email, role, password } })
              .then(() => {
                setName("");
                setEmail("");
                setPassword("");
                setInfo(`Compte ${role} créé. Il peut se connecter tout de suite avec le mot de passe choisi.`);
                reload();
              })
              .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Création impossible."));
          }}
        >
          <label className="text-sm">Nom
            <input className="field mt-1" value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="text-sm">Email
            <input className="field mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="text-sm">Rôle
            <select className="field mt-1" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="agent">Agent</option>
              <option value="client">Client</option>
              <option value="admin">Administration</option>
            </select>
          </label>
          <label className="text-sm">Mot de passe
            <input className="field mt-1" type="text" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required autoComplete="new-password" />
          </label>
          <button className="btn btn-primary" type="submit">Créer le compte</button>
        </form>
      </PageHead>
      <Notice>
        Agent, client ou administration : le compte est utilisable tout de suite. Suspendre coupe la connexion. Supprimer retire le compte, pas les devis déjà émis.
      </Notice>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      {selected ? (
        <section className="card mb-4 grid gap-3 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">{selected.name}</h2>
          <p className="text-sm text-muted sm:col-span-2">
            {selected.email} · {selected.role === "agent" ? "Agent" : selected.role === "admin" ? "Administration" : "Client"}
            {selected.role === "agent" ? " · suit les commandes où son nom est l’agent" : ""}
            {" · "}dernière connexion {selected.lastSeen || "jamais"}
            {" · "}{selected.verification || "En attente"}
            {selected.active ? "" : " · suspendu"}
          </p>
          <label className="text-sm">Nom
            <input className="field mt-1" value={editName} onChange={(event) => setEditName(event.target.value)} />
          </label>
          <label className="text-sm">Société
            <input className="field mt-1" value={editCompany} onChange={(event) => setEditCompany(event.target.value)} />
          </label>
          <label className="text-sm">Nouveau mot de passe
            <input className="field mt-1" type="text" value={editPassword} placeholder="Laisser vide pour ne pas changer" onChange={(event) => setEditPassword(event.target.value)} autoComplete="new-password" />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button className="btn btn-primary" type="button" onClick={() => {
              setLocalError("");
              void opsUpdateUser({ data: { id: selected.id, name: editName, company: editCompany, password: editPassword } })
                .then(() => {
                  setInfo(editPassword ? "Fiche et mot de passe enregistrés." : "Fiche enregistrée.");
                  setEditPassword("");
                  reload();
                })
                .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Enregistrement impossible."));
            }}>Enregistrer</button>
            <button className="btn btn-quiet" type="button" onClick={() => {
              setLocalError("");
              void opsResetPassword({ data: selected.id })
                .then((value) => setInfo(`Mot de passe temporaire, à transmettre hors email : ${value}`))
                .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Réinitialisation impossible."));
            }}>Générer un mot de passe</button>
            {selected.verification !== "Vérifié" ? (
              <button className="btn btn-quiet" type="button" onClick={() => void opsVerify({ data: selected.id }).then(() => { setInfo("Vérification validée."); reload(); })}>Valider la vérification</button>
            ) : null}
            <button className="btn btn-quiet" type="button" onClick={() => void opsSuspend({ data: { id: selected.id, active: !selected.active } }).then(() => { setSelected({ ...selected, active: !selected.active }); setInfo(selected.active ? "Accès suspendu." : "Accès rétabli."); reload(); })}>
              {selected.active ? "Suspendre" : "Rétablir"}
            </button>
            {me?.id !== selected.id ? (
              <button className="btn btn-quiet text-[#8a1c1c]" type="button" onClick={() => {
                if (!window.confirm(`Supprimer le compte de ${selected.name} ?`)) return;
                setLocalError("");
                void opsDeleteUser({ data: selected.id })
                  .then(() => {
                    setSelected(null);
                    setInfo("Compte supprimé.");
                    reload();
                  })
                  .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Suppression impossible."));
              }}>Supprimer</button>
            ) : null}
          </div>
        </section>
      ) : null}
      <DataTable head={["Nom", "État", "Société", "Dernière connexion", "Vérification", "Actions"]}>
        {(data ?? []).map((user) => (
          <tr key={user.id}>
            <Td>
              <span className="font-semibold">{user.name}</span>
              <span className="mt-0.5 block text-xs text-muted">{user.email}</span>
            </Td>
            <Td className="capitalize">{user.role}{user.active ? "" : " · suspendu"}</Td>
            <Td>{user.company || "—"}</Td>
            <Td>{user.lastSeen || "—"}</Td>
            <Td><Badge value={user.verification || "En attente"} /></Td>
            <Td>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <button className="font-semibold text-brand" type="button" onClick={() => pick(user)}>Ouvrir</button>
              <button className="font-semibold text-brand" type="button" onClick={() => void opsSuspend({ data: { id: user.id, active: !user.active } }).then(() => { setInfo(user.active ? `${user.name} est suspendu.` : `${user.name} est rétabli.`); if (selected?.id === user.id) setSelected({ ...user, active: !user.active }); reload(); })}>
                {user.active ? "Suspendre" : "Rétablir"}
              </button>
              {me?.id !== user.id ? (
                <button className="font-semibold text-[#8a1c1c]" type="button" onClick={() => {
                  if (!window.confirm(`Supprimer ${user.name} ?`)) return;
                  void opsDeleteUser({ data: user.id }).then(() => { if (selected?.id === user.id) setSelected(null); setInfo("Compte supprimé."); reload(); }).catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Suppression impossible."));
                }}>Supprimer</button>
              ) : null}
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
    </Shell>
  );
}
