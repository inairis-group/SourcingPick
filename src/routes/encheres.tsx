import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CommercePage, money } from "@/components/commerce-public";
import { useOps } from "@/components/ops-ui";
import { publicAuctions, publicBid } from "@/lib/commerce.functions";

import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/encheres")({
  head: () => seoHead("/encheres"),
  component: Page,
});

function Page() {
  const { data, error, reload } = useOps(() => publicAuctions(), "public-auctions");
  const items = data ?? [];
  return (
    <CommercePage
      kicker="Enchères · engagement ferme"
      title="Enchères"
      lede="L’offre la plus haute à la clôture emporte la vente. Elle est ferme et irrévocable, dans les conditions générales. L’encaissement XTransfer sera branché dès que la clé API sera en place."
    >
      {error ? <p className="mb-4 text-sm text-[#8a1c1c]">{error}</p> : null}
      {items.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#b7c5e6] bg-white px-6 py-12 text-center">
          <h2 className="text-xl font-semibold">Aucune enchère ouverte</h2>
          <p className="mt-2 text-sm text-[#4a5578]">Les lots passés « En ligne » dans l’administration s’affichent ici.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {items.map((item) => (
            <BidCard key={item.id} item={item} onDone={() => reload()} />
          ))}
        </div>
      )}
    </CommercePage>
  );
}

function BidCard({
  item,
  onDone,
}: {
  item: { id: string; title: string; summary: string; sku: string; priceCents: number; bidCents: number; endsAt: string };
  onDone: () => void;
}) {
  const floor = Math.max(item.bidCents, item.priceCents);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  async function send(event: React.FormEvent) {
    event.preventDefault();
    const value = Math.round(Number(amount.replace(/\s/g, "").replace(",", ".")) * 100);
    setNote("Envoi…");
    try {
      await publicBid({ data: { itemId: item.id, name, email, amountCents: value } });
      setNote("Offre enregistrée. Elle vous engage.");
      setAmount("");
      onDone();
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Offre refusée.");
    }
  }
  return (
    <article className="grid gap-6 rounded-[22px] border border-[#dce3f2] bg-white p-6 shadow-[0_18px_40px_-32px_rgba(14,26,61,0.55)] lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#155dfc]">{item.sku || "Lot"}</p>
        <h2 className="mt-2 text-[28px] leading-tight font-semibold tracking-[-0.03em]" style={{ fontFamily: "Unbounded, Trebuchet MS, sans-serif" }}>{item.title}</h2>
        <p className="mt-3 text-[15.5px] leading-7 text-[#4a5578]">{item.summary}</p>
        <p className="mt-4 text-sm text-[#4a5578]">
          Mise actuelle <strong className="text-[#0e1a3d]">{money(floor)}</strong>
          {item.endsAt ? ` · clôture ${new Date(item.endsAt).toLocaleString("fr-FR")}` : ""}
          {" · "}
          <Link to="/cgv" className="font-semibold text-[#155dfc]">Conditions</Link>
        </p>
      </div>
      <form className="grid content-start gap-2 rounded-2xl bg-[#f5f7fc] p-4" onSubmit={(event) => void send(event)}>
        <p className="text-sm font-semibold">Déposer une offre</p>
        <input className="field" placeholder="Nom" value={name} onChange={(event) => setName(event.target.value)} required />
        <input className="field" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <input className="field" inputMode="decimal" placeholder="Montant €" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        <button className="btn btn-primary" type="submit">Enchérir</button>
        {note ? <p className="text-sm">{note}</p> : null}
      </form>
    </article>
  );
}
