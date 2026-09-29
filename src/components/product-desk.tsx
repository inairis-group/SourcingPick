import { useEffect, useState } from "react";
import { PageHead, Shell } from "@/components/shell";
import { Badge, DataTable, Notice, Td, useOps } from "@/components/ops-ui";
import { opsAddFollow, opsBids, opsDeleteMarket, opsFollow, opsMarket, opsPrefs, opsSaveMarket, opsSavePrefs, opsShip } from "@/lib/commerce.functions";
import type { MarketItem } from "@/lib/commerce.server";

const STAGES = ["Brouillon", "En stock", "En ligne", "Réservé", "Vendu", "Expédié"] as const;

function cents(raw: string) {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0) throw new Error("Montant invalide.");
  return Math.round(n * 100);
}

function money(centsValue: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((Number(centsValue) || 0) / 100);
}

export function ProductDesk({ kind }: { kind: "sale" | "auction" }) {
  const auction = kind === "auction";
  const { data, error, reload } = useOps(() => opsMarket({ data: kind }), `desk-${kind}`);
  const prefs = useOps(() => opsPrefs(), "commerce-prefs");
  const items = data ?? [];
  const [open, setOpen] = useState<MarketItem | null>(null);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("Tous");
  const [minDefault, setMinDefault] = useState("1");
  const [autoShip, setAutoShip] = useState(true);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    price: "",
    sku: "",
    qty: "1",
    min: "1",
    location: "",
    clientName: "",
    clientEmail: "",
    ends: "",
    stage: "En stock",
  });

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setNote("");
    try {
      await opsSaveMarket({
        data: {
          title: form.title,
          summary: form.summary,
          priceCents: cents(form.price),
          status: form.stage === "En ligne" || form.stage === "Réservé" ? "live" : "draft",
          kind,
          endsAt: form.ends,
          sku: form.sku,
          qty: Number(form.qty) || 0,
          minQty: Number(form.min) || 0,
          location: form.location,
          clientName: form.clientName,
          clientEmail: form.clientEmail,
          stage: form.stage,
        },
      });
      setForm({ title: "", summary: "", price: "", sku: "", qty: "1", min: minDefault || "1", location: "", clientName: "", clientEmail: "", ends: "", stage: "En stock" });
      setNote("Fiche créée. Le suivi est ouvert.");
      reload();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Enregistrement impossible.");
    }
  }

  const live = items.filter((item) => item.status === "live").length;
  const low = items.filter((item) => item.qty <= item.minQty && item.stage !== "Expédié" && item.stage !== "Vendu");
  const toShip = items.filter((item) => item.stage === "Vendu");
  const needle = query.trim().toLowerCase();
  const shown = items.filter((item) => {
    if (stageFilter !== "Tous" && item.stage !== stageFilter) return false;
    if (!needle) return true;
    return `${item.title} ${item.sku} ${item.clientName} ${item.location}`.toLowerCase().includes(needle);
  });

  async function saveAlertSettings(event: React.FormEvent) {
    event.preventDefault();
    setNote("");
    try {
      await opsSavePrefs({ data: { minQty: Number(minDefault) || 0, autoShip } });
      setNote("Réglages enregistrés.");
      prefs.reload();
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Réglage impossible.");
    }
  }

  useEffect(() => {
    if (!prefs.data) return;
    setMinDefault(String(prefs.data.minQty));
    setAutoShip(prefs.data.autoShip);
  }, [prefs.data]);

  return (
    <Shell>
      <PageHead title={auction ? "Enchères" : "Marketplace"} />
      <Notice>
        {auction
          ? "Chaque lot a une fiche : client intéressé, emplacement, étape, et l’historique des offres. L’enchère publique n’est visible que lorsque l’étape est « En ligne »."
          : "Chaque produit a une fiche : référence, quantité, seuil d’alerte, emplacement, client et journal. Il n’apparaît sur le site que lorsque vous le mettez en ligne."}
      </Notice>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Fiches" value={String(items.length)} />
        <Metric label="En ligne" value={String(live)} />
        <Metric label="À expédier" value={String(toShip.length)} />
      </div>
      {low.length > 0 ? (
        <div className="mb-4 rounded-2xl border border-[#f3c7c7] bg-[#fde8e8] px-4 py-3 text-sm text-[#8a1c1c]">
          <p className="font-semibold">Stock bas</p>
          <ul className="mt-1">
            {low.map((item) => (
              <li key={item.id}>{item.title} — {item.qty} en stock, seuil {item.minQty}{item.location ? ` · ${item.location}` : ""}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {toShip.length > 0 ? (
        <div className="mb-4 rounded-2xl border border-[#ead7a8] bg-[#fff8e8] px-4 py-3 text-sm">
          <p className="font-semibold">À expédier</p>
          <ul className="mt-2 grid gap-2">
            {toShip.map((item) => (
              <ShipRow key={item.id} item={item} onDone={() => reload()} />
            ))}
          </ul>
        </div>
      ) : null}
      <details className="card mb-4 px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold">Alertes et expéditions</summary>
        <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={(event) => void saveAlertSettings(event)}>
          <label className="grid gap-1">
            <span className="text-xs text-muted">Seuil par défaut</span>
            <input className="field w-28" inputMode="numeric" value={minDefault} onChange={(event) => setMinDefault(event.target.value)} />
          </label>
          <label className="flex items-center gap-2 pb-3">
            <input type="checkbox" checked={autoShip} onChange={(event) => setAutoShip(event.target.checked)} />
            Clôturer automatiquement les enchères échues et les mettre en file d’expédition
          </label>
          <button className="btn btn-quiet mb-1 h-11 min-h-11 px-3" type="submit">Enregistrer</button>
        </form>
      </details>
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      <form className="card mb-5 grid gap-3 p-4 md:grid-cols-2" onSubmit={(event) => void create(event)}>
        <p className="md:col-span-2 text-sm font-semibold">Nouveau produit</p>
        <input className="field" placeholder="Nom du produit" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input className="field" placeholder="Référence" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
        <input className="field" inputMode="decimal" placeholder={auction ? "Mise de départ €" : "Prix €"} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
        <input className="field" inputMode="numeric" placeholder="Quantité" value={form.qty} onChange={(event) => setForm({ ...form, qty: event.target.value })} />
        <input className="field" inputMode="numeric" placeholder="Seuil d’alerte" value={form.min} onChange={(event) => setForm({ ...form, min: event.target.value })} />
        <input className="field" placeholder="Emplacement entrepôt" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
        <select className="field" value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>
          {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
        </select>
        <input className="field" placeholder="Client lié" value={form.clientName} onChange={(event) => setForm({ ...form, clientName: event.target.value })} />
        <input className="field" type="email" placeholder="Email du client" value={form.clientEmail} onChange={(event) => setForm({ ...form, clientEmail: event.target.value })} />
        {auction ? <input className="field md:col-span-2" type="datetime-local" value={form.ends} onChange={(event) => setForm({ ...form, ends: event.target.value })} required /> : null}
        <textarea className="field min-h-24 md:col-span-2" placeholder="Description visible par le client" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
        <div className="md:col-span-2 flex items-center gap-3">
          <button className="btn btn-primary" type="submit">Créer la fiche</button>
          {note ? <p className="text-sm">{note}</p> : null}
        </div>
      </form>
      <div className="mb-3 flex flex-wrap gap-2">
        <input className="field max-w-xs" placeholder="Rechercher un produit, un client, une réf." value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="field w-auto" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)}>
          <option>Tous</option>
          {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
        </select>
      </div>
      <DataTable head={["Produit", "Réf.", "Étape", "Client", auction ? "Mise" : "Prix", ""]}>
        {shown.map((item) => (
          <tr key={item.id} className="cursor-pointer" onDoubleClick={() => setOpen(item)}>
            <Td>
              <span className="block font-semibold">{item.title}</span>
              <span className="text-xs text-muted">{item.location || "Sans emplacement"} · {item.qty} {item.qty > 1 ? "pièces" : "pièce"}</span>
            </Td>
            <Td className="mono">{item.sku || "—"}</Td>
            <Td>
              <span className="inline-flex flex-wrap gap-1">
                <Badge value={item.stage} />
                {item.qty <= item.minQty && item.stage !== "Expédié" && item.stage !== "Vendu" ? <Badge value="Stock bas" /> : null}
              </span>
            </Td>
            <Td>{item.clientName || "—"}</Td>
            <Td className="mono">{money(Math.max(item.bidCents, item.priceCents))}</Td>
            <Td>
              <button className="btn btn-quiet h-9 min-h-9 px-3" type="button" onClick={() => setOpen(item)}>Ouvrir</button>
            </Td>
          </tr>
        ))}
      </DataTable>
      {items.length === 0 ? <p className="mt-3 text-sm text-muted">Aucune fiche. Le tableau se remplit dès le premier produit.</p> : null}
      {items.length > 0 && shown.length === 0 ? <p className="mt-3 text-sm text-muted">Aucun produit ne correspond à cette recherche.</p> : null}
      {open ? <File item={open} auction={auction} onClose={() => setOpen(null)} onChange={() => { setOpen(null); reload(); }} onSaved={() => reload()} /> : null}
    </Shell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="display mt-1 text-3xl">{value}</p>
    </article>
  );
}

function File({ item, auction, onClose, onChange, onSaved }: { item: MarketItem; auction: boolean; onClose: () => void; onChange: () => void; onSaved: () => void }) {
  const { data, reload } = useOps(() => opsFollow({ data: item.id }), `follow-${item.id}`);
  const bids = useOps(() => opsBids({ data: item.id }), `bids-desk-${item.id}`);
  const [stage, setStage] = useState(item.stage);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  async function follow(event: React.FormEvent) {
    event.preventDefault();
    try {
      await opsAddFollow({ data: { itemId: item.id, note: text, stage } });
      setText("");
      setMsg("Suivi enregistré.");
      reload();
      onSaved();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Suivi impossible.");
    }
  }

  async function publish(status: string) {
    await opsSaveMarket({
      data: {
        id: item.id,
        title: item.title,
        summary: item.summary,
        priceCents: item.priceCents,
        status,
        kind: auction ? "auction" : "sale",
        endsAt: item.endsAt,
        sku: item.sku,
        qty: item.qty,
        minQty: item.minQty,
        location: item.location,
        clientName: item.clientName,
        clientEmail: item.clientEmail,
        stage: status === "live" ? "En ligne" : status === "sold" ? "Vendu" : stage,
      },
    });
    onChange();
  }

  return (
    <div className="sp-shade fixed inset-0 z-50 flex justify-end bg-navy/40" onClick={onClose}>
      <aside className="sp-drawer sp-drawer-end h-full w-full max-w-md overflow-y-auto bg-paper p-5 shadow-card" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.sku || item.id}</p>
            <h2 className="display text-2xl">{item.title}</h2>
          </div>
          <button className="btn btn-quiet h-9 min-h-9 px-3" type="button" onClick={onClose}>Fermer</button>
        </div>
        <p className="text-sm leading-6 text-muted">{item.summary || "Pas de description."}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Info k="Prix" v={money(item.priceCents)} />
          <Info k="Mise" v={money(item.bidCents)} />
          <Info k="Quantité" v={String(item.qty)} />
          <Info k="Lieu" v={item.location || "—"} />
          <Info k="Seuil" v={String(item.minQty)} />
          <Info k="Client" v={item.clientName || "—"} />
          <Info k="Email" v={item.clientEmail || "—"} />
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primary h-10 min-h-10 px-3" type="button" onClick={() => void publish("live")}>Mettre en ligne</button>
          <button className="btn btn-quiet h-10 min-h-10 px-3" type="button" onClick={() => void publish("sold")}>Marquer vendu</button>
          <button className="btn btn-quiet h-10 min-h-10 px-3" type="button" onClick={() => void opsDeleteMarket({ data: item.id }).then(onChange)}>Retirer</button>
        </div>
        <form className="mt-5 grid gap-2" onSubmit={(event) => void follow(event)}>
          <p className="text-sm font-semibold">Suivi</p>
          <select className="field" value={stage} onChange={(event) => setStage(event.target.value)}>
            {STAGES.map((value) => <option key={value}>{value}</option>)}
          </select>
          <textarea className="field min-h-20" placeholder="Note : appel client, photo, réserve, expédition…" value={text} onChange={(event) => setText(event.target.value)} />
          <button className="btn btn-primary w-fit" type="submit">Ajouter au journal</button>
          {msg ? <p className="text-sm">{msg}</p> : null}
        </form>
        <ol className="mt-4 grid gap-2">
          {(data ?? []).map((event) => (
            <li key={event.id} className="rounded-2xl border border-line bg-white px-3 py-2">
              <p className="text-xs text-muted">{event.at} · {event.author} · {event.stage}</p>
              <p className="text-sm">{event.note}</p>
            </li>
          ))}
        </ol>
        {auction && (bids.data ?? []).length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">Offres</p>
            <ul className="grid gap-1 text-sm">
              {(bids.data ?? []).map((bid) => (
                <li key={bid.id}>{bid.at} · {bid.name} · {money(bid.amountCents)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function ShipRow({ item, onDone }: { item: MarketItem; onDone: () => void }) {
  const [carrier, setCarrier] = useState("");
  const [tracking, setTracking] = useState("");
  const [msg, setMsg] = useState("");
  async function send(event: React.FormEvent) {
    event.preventDefault();
    setMsg("");
    try {
      await opsShip({ data: { id: item.id, carrier, tracking } });
      onDone();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Expédition impossible.");
    }
  }
  return (
    <li>
      <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => void send(event)}>
        <span className="min-w-36 font-semibold">{item.title}</span>
        <input className="field h-10 min-h-10 w-36" placeholder="Transporteur" value={carrier} onChange={(event) => setCarrier(event.target.value)} />
        <input className="field h-10 min-h-10 w-44" placeholder="Numéro de suivi" value={tracking} onChange={(event) => setTracking(event.target.value)} />
        <button className="btn btn-primary h-10 min-h-10 px-3" type="submit">Expédier</button>
        {msg ? <span className="text-[#8a1c1c]">{msg}</span> : null}
      </form>
    </li>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
