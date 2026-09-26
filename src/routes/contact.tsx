import { useState } from "react";
import { submitLead } from "@/lib/backend.functions";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageIntro } from "@/components/site-layout";

export const Route = createFileRoute("/contact")({ component: Page });

function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Demande de devis");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <SiteLayout>
      <PageIntro title="Une question ? Écrivez-nous." lead="Pour un devis, le suivi d’une commande ou toute autre demande." />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 lg:grid-cols-2">
        <article className="card text-sm leading-relaxed">
          <p className="font-semibold">Email</p>
          <p>contact@sourcingpick.com</p>
          <p className="mt-3 font-semibold">Entrepôt</p>
          <p>113 Kanghai Beilu, Changyaoling, Zhongluotan, Baiyun, Guangzhou</p>
          <p className="mt-3 font-semibold">Horaires</p>
          <p>9 h – 23 h, heure de Chine (UTC+8)</p>
          <p className="mt-3 font-semibold">Téléphone</p>
          <p>+86 195 5817 9800 · WhatsApp</p>
          <p className="mt-3 font-semibold">Langues</p>
          <p>Français, mandarin, anglais</p>
        </article>
        <form
          className="card grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !email.includes("@") || !message.trim()) return;
            setPending(true);
            setError("");
            void submitLead({
              data: { kind: "contact", name, email, subject: topic, body: message, payload: { topic } },
            })
              .then(() => setSent(true))
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Envoi impossible."))
              .finally(() => setPending(false));
          }}
        >
          <label className="text-sm font-semibold">Nom<input className="field mt-1 font-normal" value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="text-sm font-semibold">Email<input className="field mt-1 font-normal" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="text-sm font-semibold">Sujet
            <select className="field mt-1 font-normal" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {["Demande de devis", "Suivi d’une commande", "Partenariat", "Autre"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">Message<textarea className="field mt-1 min-h-32 py-3 font-normal" value={message} onChange={(e) => setMessage(e.target.value)} /></label>
          <button className="btn btn-primary w-fit" type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Envoyer"}</button>
          {error ? <p className="text-sm text-[#8a1c1c]">{error}</p> : null}
          {sent ? <p className="text-sm text-muted">Message enregistré. Nous le lisons et vous répondons.</p> : <p className="text-sm text-muted">Nous lisons chaque message.</p>}
        </form>
      </div>
    </SiteLayout>
  );
}
