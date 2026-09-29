import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge, useOps } from "@/components/ops-ui";
import { clientFile, clientPortal } from "@/lib/ops.functions";
import { euros, quoteMath, type OpsOrder, type OpsQuote } from "@/lib/ops.shared";

export const STEPS = [
  "Demande reçue",
  "Agent assigné",
  "Devis envoyé",
  "Paiement en attente",
  "Paiement reçu",
  "Préparation terminée",
  "Expédié",
  "En transit",
  "Terminé",
] as const;

export function useClient() {
  return useOps(() => clientPortal(), "client-portal");
}

export function frDate(value: string) {
  if (!value || value === "reception") return value === "reception" ? "À réception" : "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return date.toLocaleDateString("fr-FR");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
}

export function stepIndex(state: string) {
  const index = STEPS.indexOf(state as (typeof STEPS)[number]);
  return index < 0 ? 0 : index;
}

export function isCommande(state: string) {
  return stepIndex(state) >= 4;
}

export const FILE_CAP = 40;

export async function readClientPieces(list: FileList | null, already: number) {
  const pieces: Array<{ name: string; mime: string; data: string }> = [];
  const errors: string[] = [];
  if (!list?.length) return { pieces, errors };
  for (const file of Array.from(list)) {
    if (already + pieces.length >= FILE_CAP) {
      errors.push("Quarante fichiers maximum par envoi.");
      break;
    }
    if (file.size > 8 * 1024 * 1024) {
      errors.push(`${file.name} dépasse 8 Mo.`);
      continue;
    }
    const data = file.type.startsWith("image/") ? await shrinkClientImage(file) : await readClientRaw(file);
    if (!data || data.length > 1_800_000) {
      errors.push(`${file.name} est trop lourd après préparation.`);
      continue;
    }
    pieces.push({ name: file.name, mime: file.type || "application/octet-stream", data });
  }
  return { pieces, errors };
}

async function shrinkClientImage(file: File) {
  const bmp = await createImageBitmap(file);
  const max = 960;
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.68);
}

function readClientRaw(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lecture impossible."));
    reader.readAsDataURL(file);
  });
}

export function ClientPiece({ id, title, mime, byteSize }: { id: string; title: string; mime: string; byteSize: number }) {
  const [src, setSrc] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const image = mime.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(title);

  async function load(download: boolean) {
    if (!byteSize) {
      setNote("Ce fichier n’est pas stocké.");
      return;
    }
    setBusy(true);
    setNote("");
    try {
      const file = await clientFile({ data: id });
      const binary = atob(file.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: file.mime || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const kind = file.mime || mime;
      if (!download && kind.startsWith("image/")) {
        setSrc((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        return;
      }
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName || title;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Téléchargement impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {src ? <img src={src} alt="" className="mb-2 max-h-52 w-full rounded-xl object-contain bg-[#eef3ff]" /> : null}
      <button className="font-semibold text-[#155DFC] disabled:opacity-50" type="button" disabled={busy || byteSize < 1} onClick={() => void load(false)}>
        {busy ? "Ouverture…" : image && byteSize > 0 ? "Voir" : byteSize > 0 ? "Télécharger" : "Indisponible"}
      </button>
      {image && byteSize > 0 ? (
        <button className="ml-3 font-semibold text-[#155DFC]" type="button" onClick={() => void load(true)}>
          Télécharger
        </button>
      ) : null}
      {note ? <p className="mt-1 text-xs text-[#8a1c1c]">{note}</p> : null}
    </div>
  );
}

export function orderHref(order: OpsOrder) {
  return stepIndex(order.state) <= 2 ? ("/espace/demandes/$id" as const) : ("/espace/commandes/$id" as const);
}

export function Filters({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((option) => (
        <button key={option} type="button" className={`btn ${value === option ? "btn-primary" : "btn-quiet"}`} onClick={() => onChange(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}

export function OrderTabs({ id, current }: { id: string; current: string }) {
  const tabs = [
    ["suivi", "Suivi"],
    ["photos", "Photos"],
    ["documents", "Documents"],
    ["messages", "Messages"],
    ["factures", "Factures"],
  ] as const;
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tabs.map(([key, label]) => (
        <Link
          key={key}
          to="/espace/commandes/$id"
          params={{ id }}
          search={{ onglet: key }}
          className={`btn ${current === key ? "btn-primary" : "btn-quiet"}`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export function Timeline({ state }: { state: string }) {
  const current = stepIndex(state);
  return (
    <ol className="flex flex-col gap-3">
      {STEPS.map((label, index) => {
        const done = index < current;
        const now = index === current;
        return (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${done || now ? "bg-[#155DFC]" : "bg-line"}`} />
            <span className={now ? "font-semibold" : "text-muted"}>{label}</span>
            {now ? <Badge value={state} /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function QuoteFigures({ quote }: { quote: OpsQuote }) {
  const math = quoteMath(quote.lines, quote.goodsBps, quote.freightBps, quote.depositBps);
  const rows = quote.lines.length
    ? [
        ["Total marchandise", math.goodsCents],
        ...(math.serviceCents ? [["Total prestations", math.serviceCents] as const] : []),
        ...(math.freightCents ? [["Total fret", math.freightCents] as const] : []),
        ...(math.includedFreightCents ? [["Fret imputé, non ajouté", math.includedFreightCents] as const] : []),
        [`Commission marchandise (${quote.goodsBps / 100} %)`, math.goodsCommissionCents],
        [`Commission fret (${quote.freightBps / 100} %)`, math.freightCommissionCents],
        ["Total du devis", math.totalCents],
        [`Acompte à la commande (${quote.depositBps / 100} %)`, math.depositCents],
        ["Solde avant expédition", math.balanceCents],
      ]
    : [
        ["Montant", quote.amountCents],
        ["Acompte à régler", Math.round((quote.amountCents * quote.depositBps) / 10000)],
        ["Solde après acompte", quote.amountCents - Math.round((quote.amountCents * quote.depositBps) / 10000)],
      ];
  return (
    <dl className="flex flex-col gap-2 text-sm">
      {rows.map(([label, cents]) => (
        <div key={String(label)} className="flex justify-between gap-4 border-b border-line py-2">
          <dt className="text-muted">{label}</dt>
          <dd className="mono font-semibold">{euros(Number(cents))}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Composer({ onSend }: { onSend: (body: string) => Promise<void> }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="mt-4 flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        void onSend(body)
          .then(() => setBody(""))
          .catch((err: unknown) => setError(err instanceof Error ? err.message : "Envoi impossible."))
          .finally(() => setBusy(false));
      }}
    >
      <textarea className="control min-h-24" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Votre message" />
      {error ? <p className="text-sm text-[#8a1c1c]">{error}</p> : null}
      <button className="btn btn-primary w-fit" type="submit" disabled={busy}>
        Envoyer
      </button>
    </form>
  );
}
