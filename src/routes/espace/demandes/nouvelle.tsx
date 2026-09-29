import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ImagePlus, Plus, Search, Send, ShieldCheck, Trash2, Truck, X } from "lucide-react";
import { Shell } from "@/components/shell";
import { PlaceField } from "@/components/address-field";
import { FILE_CAP, readClientPieces, useClient } from "@/components/client-ui";
import { clientAttach, clientCreate } from "@/lib/ops.functions";
import { useUi } from "@/lib/ui-lang";

export const Route = createFileRoute("/espace/demandes/nouvelle")({
  head: () => ({ meta: [{ title: "SourcingPick — Nouvelle demande" }] }),
  component: Page,
});

type Product = { id: string; name: string; qty: string; note: string; compare: string; target: string };
type Piece = { name: string; mime: string; data: string };

const STEPS = [
  { id: "besoin", label: "Besoin" },
  { id: "marchandises", label: "Marchandises" },
  { id: "destination", label: "Destination" },
  { id: "pieces", label: "Photos et fichiers" },
];

function freshProduct(): Product {
  return { id: crypto.randomUUID(), name: "", qty: "", note: "", compare: "", target: "" };
}

function Page() {
  const navigate = useNavigate();
  const { t } = useUi();
  const { data: account } = useClient();
  const [need, setNeed] = useState("Logistique seule");
  const [phone, setPhone] = useState("");
  const [products, setProducts] = useState<Product[]>([freshProduct()]);
  const [volume, setVolume] = useState("");
  const [value, setValue] = useState("");
  const [suppliers, setSuppliers] = useState("");
  const [cities, setCities] = useState("");
  const [country, setCountry] = useState("France");
  const [port, setPort] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [files, setFiles] = useState<Piece[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function patchProduct(id: string, patch: Partial<Product>) {
    setProducts((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  useEffect(() => {
    if (account?.phone) setPhone((current) => current || account.phone);
  }, [account?.phone]);

  async function addFiles(list: FileList | null) {
    const { pieces, errors } = await readClientPieces(list, files.length);
    if (errors[0]) setError(t(errors[0]));
    if (pieces.length) setFiles((rows) => [...rows, ...pieces].slice(0, FILE_CAP));
  }

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        <header className="max-w-3xl">
          <p className="mono text-[12px] font-semibold tracking-[0.08em] text-brand uppercase">{t("Demande de devis")}</p>
          <h1 className="display mt-3 text-[clamp(2rem,3vw,2.75rem)] leading-[1.08]">{t("Décrivez votre envoi")}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            {t("Ce n’est pas encore une commande. Vous envoyez une demande : elle devient une commande quand le devis est signé et l’acompte reçu.")}
          </p>
        </header>

        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label={t("Étapes")}>
          {STEPS.map((step, index) => (
            <a key={step.id} href={`#${step.id}`} className="btn btn-quiet shrink-0">
              <span className="mono mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF1FF] text-xs text-[#155DFC]">{index + 1}</span>
              {t(step.label)}
            </a>
          ))}
        </nav>

        <form
          className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_320px]"
          onSubmit={(event) => {
            event.preventDefault();
            const clean = products
              .map((row) => ({
                name: row.name.trim(),
                qty: row.qty.trim(),
                note: row.note.trim(),
                compare: row.compare.trim(),
                target: row.target.trim(),
              }))
              .filter((row) => row.name);
            if (!clean.length) {
              setError(t("Ajoutez au moins un produit."));
              return;
            }
            if (phone.replace(/\D/g, "").length < 8) {
              setError(t("Indiquez un numéro de téléphone."));
              return;
            }
            setBusy(true);
            setError("");
            void clientCreate({
              data: {
                need,
                product: clean.map((row) => row.name).join(", "),
                qty: clean.map((row) => row.qty).filter(Boolean).join(" · "),
                volume,
                value,
                suppliers,
                cities,
                country,
                port,
                address,
                date,
                phone,
                products: clean,
                files: [],
              },
            })
              .then(async (created) => {
                const failed: string[] = [];
                for (let index = 0; index < files.length; index += 1) {
                  setError(t(`Envoi du fichier ${index + 1} sur ${files.length}…`));
                  try {
                    await clientAttach({ data: { orderId: created.id, ...files[index] } });
                  } catch {
                    failed.push(files[index].name);
                  }
                }
                if (failed.length) window.sessionStorage.setItem("sp-file-note", failed.join(", "));
                else window.sessionStorage.removeItem("sp-file-note");
                await navigate({ to: "/espace/demandes/$id", params: { id: created.id }, search: { envoyee: true } });
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : t("Envoi impossible.")))
              .finally(() => setBusy(false));
          }}
        >
          <div className="flex flex-col gap-5">
            <section className="card">
              <h2 className="display mb-1 text-lg">{t("Pour vous joindre")}</h2>
              <p className="mb-4 text-sm text-muted">{t("L’email du compte et le téléphone sont joints automatiquement à la demande.")}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-semibold">
                  {t("Email")}
                  <input className="control mt-2" type="email" value={account?.email || ""} readOnly />
                </label>
                <label className="text-sm font-semibold">
                  {t("Téléphone")}
                  <input className="control mt-2" type="tel" value={phone} required autoComplete="tel" placeholder="+33 6 12 34 56 78" onChange={(event) => setPhone(event.target.value)} />
                </label>
              </div>
            </section>
            <section id="besoin" className="card scroll-mt-24">
              <h2 className="display mb-4 text-lg">{t("Votre besoin")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { id: "Logistique seule", title: t("Logistique"), hint: t("J’ai déjà mes fournisseurs. Photos, packing list, factures : autant de fichiers que vous voulez."), icon: Truck },
                  { id: "Sourcing + logistique", title: t("Sourcing + logistique"), hint: t("Je cherche encore un fournisseur. Décrivez chaque produit, joignez des photos et des références."), icon: Search },
                ] as const).map((choice) => {
                  const on = need === choice.id;
                  const Glyph = choice.icon;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setNeed(choice.id)}
                      className={`flex items-start gap-3 rounded-2xl border bg-white p-4 text-left ${on ? "border-brand shadow-[0_0_0_3px_#EAF1FF]" : "border-line"}`}
                    >
                      <Glyph size={18} className="mt-0.5 shrink-0 text-brand" />
                      <span>
                        <span className="block text-base font-semibold">{choice.title}</span>
                        <span className="mt-1 block text-sm leading-snug text-muted">{choice.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section id="marchandises" className="card scroll-mt-24">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="display text-lg">{t("Vos marchandises")}</h2>
                <button className="btn btn-quiet" type="button" onClick={() => setProducts((rows) => [...rows, freshProduct()])}>
                  <Plus size={16} /> {t("Ajouter un produit")}
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {products.map((product, index) => (
                  <div key={product.id} className="rounded-2xl border border-line bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{t("Produit")} {index + 1}</p>
                      {products.length > 1 ? (
                        <button className="btn btn-quiet" type="button" onClick={() => setProducts((rows) => rows.filter((row) => row.id !== product.id))}>
                          <Trash2 size={14} /> {t("Retirer")}
                        </button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="text-sm font-semibold md:col-span-2">
                        {t("Désignation")}
                        <input className="control mt-2" value={product.name} required={index === 0} placeholder={t("Ex. lampe de bureau LED")} onChange={(event) => patchProduct(product.id, { name: event.target.value })} />
                      </label>
                      <label className="text-sm font-semibold">
                        {t("Quantité")}
                        <input className="control mt-2" value={product.qty} placeholder={t("Ex. 2 400 unités")} onChange={(event) => patchProduct(product.id, { qty: event.target.value })} />
                      </label>
                      <label className="text-sm font-semibold">
                        {t("Précision")}
                        <input className="control mt-2" value={product.note} placeholder={t("Matière, coloris, lien, référence")} onChange={(event) => patchProduct(product.id, { note: event.target.value })} />
                      </label>
                      <label className="text-sm font-semibold md:col-span-2">
                        {t("Comparatif")}
                        <textarea className="control mt-2 min-h-20" value={product.compare} placeholder={t("Produit à comparer : lien Amazon, 1688, concurrent, ou ce qui doit être mis en face")} onChange={(event) => patchProduct(product.id, { compare: event.target.value })} />
                      </label>
                      <label className="text-sm font-semibold">
                        {t("Prix cible")}
                        <input className="control mt-2" value={product.target} placeholder={t("Ex. 4,50 € / unité")} onChange={(event) => patchProduct(product.id, { target: event.target.value })} />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label={t("Volume ou poids estimé")} value={volume} onChange={setVolume} placeholder={t("Ex. 12 m³ ou 1 800 kg")} />
                <Field label={t("Valeur des marchandises")} value={value} onChange={setValue} placeholder={t("Ex. 18 000 €")} />
                <Field label={t("Nombre de fournisseurs")} value={suppliers} onChange={setSuppliers} placeholder={t("Ex. 3")} />
                <Field label={t("Villes des fournisseurs")} value={cities} onChange={setCities} placeholder={t("Ex. Guangzhou, Foshan")} />
              </div>
            </section>

            <section id="destination" className="card scroll-mt-24">
              <h2 className="display mb-1 text-lg">{t("Destination")}</h2>
              <p className="mb-4 text-sm text-muted">{t("La ville, le port et l’adresse sont proposés par l’annuaire public des adresses françaises, plus les grands ports.")}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("Pays")} value={country} onChange={setCountry} />
                <label className="text-sm font-semibold">
                  {t("Ville ou port d’arrivée")}
                  <PlaceField mode="port" value={port} onChange={setPort} placeholder={t("Ex. Le Havre")} />
                </label>
                <label className="text-sm font-semibold md:col-span-2">
                  {t("Adresse de livraison")}
                  <PlaceField mode="address" value={address} onChange={setAddress} placeholder={t("Numéro, rue, code postal, ville")} />
                </label>
                <label className="text-sm font-semibold md:col-span-2">
                  {t("Arrivée souhaitée")}
                  <input className="control mt-2" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                </label>
              </div>
            </section>

            <section id="pieces" className="card scroll-mt-24">
              <h2 className="display mb-1 text-lg">{t("Photos et fichiers")}</h2>
              <p className="mb-4 text-sm text-muted">{t("Autant de photos, PDF ou tableurs que nécessaire : produit, carton, facture fournisseur, packing list. Quarante fichiers par envoi, vous pourrez en ajouter ensuite.")}</p>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-[#155DFC] bg-white px-4 py-8 text-center text-sm">
                <ImagePlus size={22} className="text-[#155DFC]" />
                <span className="font-semibold">{t("Ajouter des photos ou des fichiers")}</span>
                <span className="text-muted">{t("Images, PDF, Excel, Word · 8 Mo par fichier")}</span>
                <input
                  className="sr-only"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.xls,.xlsx,.doc,.docx,.csv,.txt"
                  onChange={(event) => {
                    void addFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
              {files.length ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {files.map((file) => (
                    <li key={`${file.name}-${file.data.length}`} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2">
                      {file.mime.startsWith("image/") ? <img src={file.data} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span className="mono flex h-12 w-12 items-center justify-center rounded-lg bg-canvas text-[10px]">PDF</span>}
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{file.name}</span>
                      <button className="btn btn-quiet" type="button" onClick={() => setFiles((rows) => rows.filter((row) => row !== file))} aria-label={t("Retirer")}>
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            {error ? <p className="text-sm text-[#8a1c1c]">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary h-12 px-6 text-base" type="submit" disabled={busy}>
                {busy ? t("Envoi…") : t("Envoyer ma demande")} <Send size={18} />
              </button>
              <Link to="/espace/demandes" className="btn btn-quiet h-12 px-5">
                {t("Annuler")}
              </Link>
            </div>
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-24">
            <div className="flex flex-col gap-4 rounded-3xl bg-[#162456] p-6 text-white">
              <h2 className="display text-xl">{t("Et ensuite ?")}</h2>
              {[
                t("Votre demande arrive dans la file. Ce n’est pas encore une commande."),
                t("Un agent la qualifie et vous envoie un devis sous 24 à 72 heures."),
                t("Vous signez le devis et réglez l’acompte : la demande devient une commande."),
              ].map((line, index) => (
                <p key={line} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mono inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span>{line}</span>
                </p>
              ))}
            </div>
            <p className="flex items-start gap-3 rounded-2xl bg-[#E3F6EC] p-4 text-sm leading-relaxed text-[#145C38]">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              {t("Vos informations et vos fichiers servent uniquement à établir votre devis.")}
            </p>
          </aside>
        </form>
      </div>
    </Shell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input className="control mt-2" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
