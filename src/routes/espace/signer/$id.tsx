import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { QuoteFigures, useClient } from "@/components/client-ui";
import { clientSign, clientSignCode } from "@/lib/ops.functions";

export const Route = createFileRoute("/espace/signer/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Signature" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, error } = useClient();
  const quote = data?.quotes.find((item) => item.id === id || item.number === id);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [signer, setSigner] = useState("");
  const [role, setRole] = useState("");
  const [ok, setOk] = useState(false);
  const [cgvOk, setCgvOk] = useState(false);
  const [note, setNote] = useState("");
  const [signed, setSigned] = useState("");
  const [code, setCode] = useState("");
  const [codeNote, setCodeNote] = useState("");
  const drawing = useRef(false);
  const ink = useRef(false);

  useEffect(() => {
    if (data?.name) setSigner((current) => current || data.name);
  }, [data?.name]);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !canvas.current) return null;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * canvas.current.width) / rect.width;
    const y = ((event.clientY - rect.top) * canvas.current.height) / rect.height;
    return { ctx, x, y };
  }

  if (!quote) return <Shell><p>{error || "Chargement…"}</p></Shell>;
  return (
    <Shell>
      <PageHead title="Signature électronique" />
      <p className="mb-4 text-sm text-muted">
        En signant, vous acceptez le devis {quote.number} et les{" "}
        <a href="/cgv" target="_blank" rel="noreferrer" className="font-semibold text-brand underline">
          conditions générales de vente et d’utilisation
        </a>{" "}
        (version du 30 septembre 2026).
      </p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form
          className="card flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!ok) {
              setNote("Confirmez que vous pouvez engager la société.");
              return;
            }
            if (!cgvOk) {
              setNote("Acceptez les conditions générales de vente et d’utilisation pour signer.");
              return;
            }
            if (!ink.current) {
              setNote("Signez dans le cadre avant d’envoyer.");
              return;
            }
            if (data?.otpSign && code.replace(/\D/g, "").length !== 6) {
              setNote("Demandez le code email, puis saisissez les 6 chiffres.");
              return;
            }
            const image = canvas.current?.toDataURL("image/png") || "";
            void clientSign({ data: { id: quote.id, signer: role ? `${signer}, ${role}` : signer, image, code, cgv: cgvOk } })
              .then((result) => setSigned(result.invoiceId || "ok"))
              .catch((err: unknown) => setNote(err instanceof Error ? err.message : "Signature impossible."));
          }}
        >
          <label className="text-sm font-semibold">Nom du signataire<input className="control mt-1" value={signer} onChange={(event) => setSigner(event.target.value)} required /></label>
          <label className="text-sm font-semibold">Fonction<input className="control mt-1" value={role} onChange={(event) => setRole(event.target.value)} /></label>
          <p className="text-sm font-semibold">Espace de signature électronique</p>
          <p className="text-xs text-muted">Signez dans le cadre. Le trait est enregistré sur le devis, avec la date et votre nom.</p>
          <canvas
            ref={canvas}
            width={640}
            height={180}
            className="w-full rounded-xl border border-dashed border-[#155dfc] bg-white"
            style={{ touchAction: "none" }}
            onPointerDown={(event) => {
              drawing.current = true;
              ink.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              const hit = point(event);
              hit?.ctx.beginPath();
              hit?.ctx.moveTo(hit.x, hit.y);
            }}
            onPointerMove={(event) => {
              if (!drawing.current) return;
              const hit = point(event);
              if (!hit) return;
              hit.ctx.lineWidth = 2;
              hit.ctx.lineCap = "round";
              hit.ctx.strokeStyle = "#0e1a3d";
              hit.ctx.lineTo(hit.x, hit.y);
              hit.ctx.stroke();
            }}
            onPointerUp={() => {
              drawing.current = false;
            }}
            onPointerLeave={() => {
              drawing.current = false;
            }}
          />
          <button
            className="btn btn-quiet w-fit"
            type="button"
            onClick={() => {
              const ctx = canvas.current?.getContext("2d");
              if (canvas.current && ctx) {
                ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
                ink.current = false;
              }
            }}
          >
            Effacer
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={ok} onChange={(event) => setOk(event.target.checked)} />
            Je confirme être habilité à engager la société.
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input className="mt-1" type="checkbox" checked={cgvOk} onChange={(event) => setCgvOk(event.target.checked)} />
            <span>
              J’accepte les{" "}
              <a href="/cgv" target="_blank" rel="noreferrer" className="font-semibold text-brand underline">
                conditions générales de vente et d’utilisation
              </a>{" "}
              (version du 30 septembre 2026) et je demande l’exécution immédiate des prestations.
            </span>
          </label>
          {data?.otpSign ? (
            <div className="rounded-2xl border border-line bg-canvas p-3">
              <p className="text-sm font-semibold">Code email</p>
              <p className="mt-1 text-xs text-muted">Un code à 6 chiffres part sur {data.email}. Il est valable 10 minutes. Si l’envoi échoue, le message s’affiche ici — la signature sans code reste possible tant que l’option est coupée dans Paramètres.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  className="control w-36"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  placeholder="000000"
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <button
                  className="btn btn-quiet"
                  type="button"
                  onClick={() => {
                    setCodeNote("");
                    void clientSignCode()
                      .then(() => setCodeNote("Code envoyé. Regardez votre boîte mail."))
                      .catch((err: unknown) => setCodeNote(err instanceof Error ? err.message : "Envoi impossible."));
                  }}
                >
                  Recevoir le code
                </button>
              </div>
              {codeNote ? <p className="mt-2 text-sm">{codeNote}</p> : null}
            </div>
          ) : null}
          {note ? <p className="text-sm text-[#8a1c1c]">{note}</p> : null}
          <button className="btn btn-primary w-fit" type="submit">Signer et envoyer</button>
          {signed ? (
            <div className="rounded-2xl border border-line bg-canvas p-4 text-sm">
              <p className="font-semibold">Devis signé</p>
              <p className="mt-1">{signed === "ok" ? "Merci. Votre signature est enregistrée et horodatée. Ce devis n’a pas d’acompte." : "Merci. Votre signature est enregistrée et horodatée. La facture d’acompte est dans votre espace, et votre agent est prévenu."}</p>
              <div className="mt-3 flex gap-2">
                {signed !== "ok" ? (
                  <Link className="btn btn-primary" to="/espace/payer/$id" params={{ id: signed }}>Payer maintenant</Link>
                ) : null}
                <button className="btn btn-quiet" type="button" onClick={() => void navigate({ to: "/espace/facturation" })}>Ouvrir</button>
              </div>
            </div>
          ) : null}
          <p className="text-xs text-muted">La signature est horodatée et conservée avec le document.</p>
        </form>
        <aside className="card">
          <QuoteFigures quote={quote} />
        </aside>
      </div>
    </Shell>
  );
}
