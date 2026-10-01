import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { publicDocumentCode, publicDocumentOpen, publicDocumentSign } from "@/lib/ops.functions";
import { ContractView } from "@/components/contract-sheet";

export const Route = createFileRoute("/signer/$token")({
  head: () => ({ meta: [{ title: "SourcingPick — Signer un document" }] }),
  component: Page,
});

type Opened = Awaited<ReturnType<typeof publicDocumentOpen>>;

function Page() {
  const { token } = Route.useParams();
  const [step, setStep] = useState<"mail" | "code" | "read">("mail");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [opened, setOpened] = useState<Opened | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [done, setDone] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const ink = useRef(false);
  const preview = useRef("");

  useEffect(() => {
    return () => {
      if (preview.current) URL.revokeObjectURL(preview.current);
    };
  }, []);

  function fileUrl(file: Opened) {
    if (preview.current) return preview.current;
    const binary = atob(file.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    preview.current = URL.createObjectURL(new Blob([bytes], { type: file.mime || "application/octet-stream" }));
    return preview.current;
  }

  if (!opened) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef2f8] px-4">
        <form
          className="w-full max-w-md rounded-[22px] border border-[#e3e8f2] bg-white p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setNote("");
            setBusy(true);
            if (step !== "code") {
              void publicDocumentCode({ data: { token, email } })
                .then((result) => {
                  if (result.already) {
                    return publicDocumentOpen({ data: { token, email, code: "000000" } }).then((value) => {
                      setOpened(value);
                      setDone(true);
                    });
                  }
                  setStep("code");
                })
                .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Envoi du code impossible."))
                .finally(() => setBusy(false));
              return;
            }
            void publicDocumentOpen({ data: { token, email, code } })
              .then((value) => {
                setOpened(value);
                if (value.clientName) setCompany(value.clientName);
                if (value.signed) setDone(true);
              })
              .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Code refusé."))
              .finally(() => setBusy(false));
          }}
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-[#155dfc]">SOURCINGPICK</p>
          <h1 className="mt-2 text-2xl font-semibold">Signer un document</h1>
          <p className="mt-2 text-sm text-[#4a5878]">Indiquez l’email qui a reçu le lien. Le code arrive ensuite. Le fichier s’ouvre seulement après.</p>
          {step !== "code" ? (
            <label className="mt-4 block text-sm font-semibold">Email
              <input className="field mt-1 font-normal" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
          ) : (
            <label className="mt-4 block text-sm font-semibold">Code reçu par {email}
              <input className="field mt-1 font-normal tracking-[0.3em]" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} required />
            </label>
          )}
          {note ? <p className="mt-3 text-sm text-[#8a1c1c]">{note}</p> : null}
          <button className="btn btn-primary mt-4 w-full" type="submit" disabled={busy}>{busy ? "Vérification…" : step !== "code" ? "Recevoir le code" : "Ouvrir le document"}</button>
        </form>
      </main>
    );
  }

  const written = opened.text || "";
  const url = written ? "" : opened.data ? fileUrl(opened) : "";
  const image = !written && opened.mime.startsWith("image/");
  const pdf = !written && opened.mime.includes("pdf");
  const signed = opened.signed || done;
  const doc = opened;

  function saveCopy() {
    const href = written
      ? URL.createObjectURL(new Blob([written], { type: "text/plain;charset=utf-8" }))
      : url;
    if (!href) return;
    const link = document.createElement("a");
    link.href = href;
    link.download = doc.fileName || `${doc.title}.txt`;
    link.click();
    if (written) URL.revokeObjectURL(href);
  }

  return (
    <main className="min-h-screen bg-[#eef2f8] px-4 py-6 text-[#0e1a3d]">
      <div className="mx-auto grid max-w-[1180px] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className={written ? "" : "overflow-hidden rounded-[22px] border border-[#e3e8f2] bg-white"}>
          {written ? <ContractView title={opened.title} client={opened.clientName} body={written} /> : null}
          {image ? <img src={url} alt="" className="max-h-[78vh] w-full object-contain" /> : null}
          {pdf ? <iframe title={opened.title} src={url} className="h-[78vh] w-full" /> : null}
          {!written && !image && !pdf ? (
            <div className="grid min-h-64 place-items-center p-8 text-center">
              <div>
                <p className="font-semibold">{opened.fileName}</p>
                <a className="btn btn-primary mt-4" href={url} download={opened.fileName}>Télécharger pour lire</a>
              </div>
            </div>
          ) : null}
        </section>
        <aside className="rounded-[22px] border border-[#e3e8f2] bg-white p-5 lg:sticky lg:top-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-[#155dfc]">SOURCINGPICK</p>
          <h1 className="mt-2 text-2xl font-semibold">{opened.title}</h1>
          <p className="mt-2 text-sm text-[#4a5878]">{opened.clientName || "Document"} · {opened.fileName}</p>
          {signed ? (
            <div className="mt-5 rounded-2xl bg-[#f4f7fb] p-4 text-sm">
              <p className="font-semibold">Document signé</p>
              <p className="mt-2">{opened.signerName || `${first} ${last}`.trim()}</p>
              {opened.signerRole || role ? <p>{opened.signerRole || role}</p> : null}
              {opened.signedAt ? <p>{new Date(opened.signedAt).toLocaleString("fr-FR")}</p> : <p>À l’instant</p>}
              {opened.ip ? <p>IP {opened.ip}</p> : null}
              <p className="mt-2 text-[#4a5878]">Le fichier d’origine n’est pas modifié. La signature, le nom, la date et l’adresse IP sont conservés avec lui.</p>
              <button className="btn btn-primary mt-4 w-full" type="button" onClick={saveCopy}>Télécharger</button>
            </div>
          ) : (
            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                const name = `${first.trim()} ${last.trim()}`.trim();
                if (name.length < 2) {
                  setNote("Indiquez le prénom et le nom.");
                  return;
                }
                if (!accepted) {
                  setNote("Confirmez que vous signez ce document.");
                  return;
                }
                const imageData = mode === "type" ? typedSignature(name) : exportPad(canvas.current);
                if (mode === "draw" && !ink.current) {
                  setNote("Dessinez la signature, ou signez avec votre nom.");
                  return;
                }
                setBusy(true);
                void publicDocumentSign({ data: { token, email, code, name, role, company, image: imageData } })
                  .then(() => {
                    setOpened({ ...opened, signed: true, signerName: name, signerRole: role, signerCompany: company, signedAt: new Date().toISOString() });
                    setDone(true);
                  })
                  .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Signature impossible."))
                  .finally(() => setBusy(false));
              }}
            >
              <label className="text-sm font-semibold">Prénom
                <input className="field mt-1 font-normal" value={first} onChange={(event) => setFirst(event.target.value)} required />
              </label>
              <label className="text-sm font-semibold">Nom
                <input className="field mt-1 font-normal" value={last} onChange={(event) => setLast(event.target.value)} required />
              </label>
              <label className="text-sm font-semibold">Fonction
                <input className="field mt-1 font-normal" value={role} onChange={(event) => setRole(event.target.value)} />
              </label>
              <label className="text-sm font-semibold">Société
                <input className="field mt-1 font-normal" value={company} onChange={(event) => setCompany(event.target.value)} />
              </label>
              <div className="flex gap-2">
                <button className={`btn ${mode === "draw" ? "btn-primary" : "btn-quiet"}`} type="button" onClick={() => setMode("draw")}>Dessiner</button>
                <button className={`btn ${mode === "type" ? "btn-primary" : "btn-quiet"}`} type="button" onClick={() => setMode("type")}>Signer avec mon nom</button>
              </div>
              {mode === "draw" ? (
                <canvas
                  ref={canvas}
                  className="block h-36 w-full touch-none rounded-xl border border-dashed border-[#155dfc] bg-white"
                  onPointerDown={(event) => {
                    const ctx = drawContext(canvas.current);
                    const hit = point(canvas.current, event);
                    if (!ctx || !hit) return;
                    drawing.current = true;
                    ink.current = true;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    ctx.beginPath();
                    ctx.moveTo(hit.x, hit.y);
                  }}
                  onPointerMove={(event) => {
                    if (!drawing.current) return;
                    const ctx = canvas.current?.getContext("2d");
                    const hit = point(canvas.current, event);
                    if (!ctx || !hit) return;
                    ctx.lineTo(hit.x, hit.y);
                    ctx.stroke();
                  }}
                  onPointerUp={() => {
                    drawing.current = false;
                  }}
                />
              ) : (
                <p className="rounded-xl border border-dashed border-[#155dfc] bg-white px-4 py-8 text-center text-3xl" style={{ fontFamily: "\"Segoe Script\", \"Brush Script MT\", cursive" }}>
                  {`${first} ${last}`.trim() || "Votre nom"}
                </p>
              )}
              <label className="flex items-start gap-2 text-sm">
                <input className="mt-1" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
                Je signe le document « {opened.title} ».
              </label>
              {note ? <p className="text-sm text-[#8a1c1c]">{note}</p> : null}
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Signer le document"}</button>
            </form>
          )}
        </aside>
      </div>
    </main>
  );
}

function point(pad: HTMLCanvasElement | null, event: React.PointerEvent<HTMLCanvasElement>) {
  if (!pad) return null;
  const rect = pad.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function drawContext(pad: HTMLCanvasElement | null) {
  if (!pad) return null;
  const rect = pad.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (pad.width !== width || pad.height !== height) {
    pad.width = width;
    pad.height = height;
  }
  const ctx = pad.getContext("2d");
  if (!ctx) return null;
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#0e1a3d";
  return ctx;
}

function exportPad(pad: HTMLCanvasElement | null) {
  if (!pad) return "";
  const out = document.createElement("canvas");
  out.width = 640;
  out.height = 180;
  const ctx = out.getContext("2d");
  if (!ctx) return pad.toDataURL("image/png");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 640, 180);
  ctx.drawImage(pad, 0, 0, 640, 180);
  return out.toDataURL("image/png");
}

function typedSignature(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 640, 180);
  ctx.fillStyle = "#0e1a3d";
  ctx.font = "54px \"Segoe Script\", \"Brush Script MT\", cursive";
  ctx.fillText(name.slice(0, 42), 28, 108);
  return canvas.toDataURL("image/png");
}
