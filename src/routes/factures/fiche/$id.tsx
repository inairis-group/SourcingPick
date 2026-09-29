import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { PaperView } from "@/components/paper";
import { Badge, useOps } from "@/components/ops-ui";
import { opsClients, opsCredit, opsEmails, opsInvoice, opsInvoices, opsMarkPaid, opsQuotes, opsRemind, opsSaveInvoice, opsSaveSeries, opsSendInvoice } from "@/lib/ops.functions";
import { factureFromOps, openOpsInvoice, syncInvoiceClient } from "@/lib/ops-paper";
import { chargedAmount, clientLabel, DUE_ON_RECEIPT, dueIsReceipt, lineAmount, pricedLines, type CompanyHit, type OpsClient, type OpsInvoice, type QuoteLine } from "@/lib/ops.shared";
import { eurCentsFromCny, formatMoney, formatRate, isYuan, rateWhen } from "@/lib/fx.shared";
import { useFxRate } from "@/lib/use-fx";
import { partyFromHit, recoverCompany } from "@/lib/client-party";
import { AddressField } from "@/components/address-field";
import { BoldField } from "@/components/marks";
import { MailFrame } from "@/components/mail-frame";
import { LinePhotos, PieceIndex, linePhotoList } from "@/components/line-photos";
import { CentsField, DecimalField } from "@/components/decimal-field";

export const Route = createFileRoute("/factures/fiche/$id")({
  head: () => ({ meta: [{ title: "SourcingPick — Facture" }] }),
  component: Page,
});

function kindName(kind: QuoteLine["kind"]) {
  if (kind === "goods") return "Marchandise";
  if (kind === "freight") return "Fret";
  if (kind === "fee") return "Frais";
  if (kind === "discount") return "Remise";
  return "Prestation";
}

function Page() {
  const { id } = Route.useParams();
  const modifier = useRouterState({
    select: (state) => {
      const search = state.location.search as { modifier?: unknown };
      return search?.modifier === true || search?.modifier === "1" || search?.modifier === 1;
    },
  });
  const navigate = useNavigate();
  const { data, error, reload } = useOps(() => opsInvoice({ data: id }), `invoice:${id}`);
  const [method, setMethod] = useState("Wise");
  const [receivedOn, setReceivedOn] = useState(new Date().toISOString().slice(0, 10));
  const [receivedCents, setReceivedCents] = useState(0);
  const [feesCents, setFeesCents] = useState(0);
  const [lines, setLines] = useState<QuoteLine[]>([]);
  const [docLang, setDocLang] = useState("fr");
  const [docCurrency, setDocCurrency] = useState("EUR");
  const fx = useFxRate();
  const [clientName, setClientName] = useState("");
  const [clientUserId, setClientUserId] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientVat, setClientVat] = useState("");
  const [clientSiren, setClientSiren] = useState("");
  const [clientSiret, setClientSiret] = useState("");
  const [clientNaf, setClientNaf] = useState("");
  const [hits, setHits] = useState<CompanyHit[]>([]);
  const [party, setParty] = useState<"pro" | "particulier">("pro");
  const [mailText, setMailText] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailTo, setMailTo] = useState("");
  const [extraMail, setExtraMail] = useState("");
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; subject: string; body: string }>>([]);
  const [orderRef, setOrderRef] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [dueOn, setDueOn] = useState("");
  const [remindersOn, setRemindersOn] = useState(true);
  const [accounts, setAccounts] = useState<OpsClient[]>([]);
  const [clientQuery, setClientQuery] = useState("");
  const [info, setInfo] = useState("");
  const [localError, setLocalError] = useState("");
  const invoice = data;
  useEffect(() => {
    setLines((current) => {
      const next = pricedLines(current, 0);
      return next.every((line, index) => line === current[index]) ? current : next;
    });
  }, [lines]);
  const shown = invoice
    ? {
        ...invoice,
        number: docNumber || invoice.number,
        clientName,
        clientUserId,
        clientEmail,
        clientCompany,
        clientAddress,
        clientVat,
        clientSiren,
        clientSiret,
        clientNaf,
        orderRef,
        lines,
        lang: docLang,
        currency: docCurrency,
        amountCents: lines.reduce((total, line) => total + chargedAmount(line), 0),
      }
    : null;
  const draft = shown ? factureFromOps(shown) : null;
  useLayoutEffect(() => {
    if (shown) syncInvoiceClient(shown);
  }, [invoice?.id, clientName, clientCompany, clientAddress, clientEmail, clientVat, clientSiren, clientSiret, clientNaf, orderRef]);
  useEffect(() => {
    void opsClients().then(setAccounts).catch(() => setAccounts([]));
    void opsEmails().then((data) => setTemplates(data.templates)).catch(() => setTemplates([]));
  }, []);
  const matches = accounts.filter((client) => {
    if (!client.email.includes("@")) return false;
    const hay = `${client.name} ${client.company} ${client.email}`.toLowerCase();
    return !clientQuery.trim() || hay.includes(clientQuery.trim().toLowerCase());
  });
  const visible = matches.some((client) => client.id === clientUserId) || !clientUserId
    ? matches
    : [...accounts.filter((client) => client.id === clientUserId), ...matches];
  const seen = useRef("");
  useLayoutEffect(() => {
    if (!invoice || seen.current === invoice.id) return;
    seen.current = invoice.id;
    syncInvoiceClient(invoice);
    setClientName(invoice.clientName || "");
    setClientUserId(invoice.clientUserId || "");
    setClientEmail(invoice.clientEmail || "");
    setMailTo(invoice.clientEmail || "");
    setMailSubject(`Votre facture ${invoice.number}`);
    setClientCompany(invoice.clientCompany || "");
    setClientAddress(invoice.clientAddress || "");
    setClientVat(invoice.clientVat || "");
    setClientSiren(invoice.clientSiren || "");
    setClientSiret(invoice.clientSiret || "");
    setClientNaf(invoice.clientNaf || "");
    setOrderRef(invoice.orderRef);
    setDocNumber(invoice.number);
    setDueOn(dueIsReceipt(invoice.dueOn) ? "" : invoice.dueOn);
    setRemindersOn(invoice.remindersOn);
    setLines(invoice.lines.length ? invoice.lines : [{ id: crypto.randomUUID(), kind: "service", title: "", details: "", qty: 1, unitCents: 0 }]);
    setDocLang(invoice.lang === "en" ? "en" : "fr");
    setDocCurrency(invoice.currency || "EUR");
    setParty(!invoice.clientCompany && !invoice.clientSiret && invoice.clientName ? "particulier" : "pro");
    setReceivedCents(invoice.amountCents);
    setFeesCents(invoice.feesCents || 0);
  }, [invoice]);

  function applyParty(party: { name: string; email: string; company: string; address: string; vat: string; siren: string; siret: string; naf: string; userId?: string }) {
    if (party.userId != null) setClientUserId(party.userId);
    setClientName(party.name);
    setClientEmail(party.email);
    setClientCompany(party.company);
    setClientAddress(party.address);
    setClientVat(party.vat);
    setClientSiren(party.siren);
    setClientSiret(party.siret);
    setClientNaf(party.naf);
  }

  function chooseClient(userId: string) {
    setClientUserId(userId);
    const client = accounts.find((item) => item.id === userId);
    if (!client) return;
    if (client.kind === "particulier") {
      setParty("particulier");
      applyParty({ userId: client.id, name: client.name || "", email: client.email || "", company: "", address: client.address || "", vat: "", siren: "", siret: "", naf: "" });
      setHits([]);
      return;
    }
    setParty("pro");
    applyParty({
      userId: client.id,
      name: client.name || "",
      email: client.email || "",
      company: client.company || "",
      address: client.address || "",
      vat: client.vat || "",
      siren: client.siren || "",
      siret: client.siret || "",
      naf: client.naf || "",
    });
    setHits([]);
  }

  function lookup() {
    const query = clientSiret || clientSiren || clientCompany || clientName;
    setLocalError("");
    void recoverCompany(query)
      .then((found) => {
        if (!found.length) {
          setLocalError("Aucune entreprise trouvée. Vérifiez la dénomination ou le SIRET.");
          setHits([]);
          return;
        }
        if (found.length === 1) {
          const party = partyFromHit(found[0], { userId: clientUserId, name: clientName, email: clientEmail });
          applyParty({ userId: clientUserId, name: party.clientName, email: party.clientEmail, company: party.clientCompany, address: party.clientAddress, vat: party.clientVat, siren: party.clientSiren, siret: party.clientSiret, naf: party.clientNaf });
          setHits([]);
          setInfo(`Entreprise récupérée : ${found[0].name}.`);
          return;
        }
        setHits(found);
      })
      .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Annuaire indisponible."));
  }

  function saveBody() {
    const amountCents = lines.reduce((total, line) => total + chargedAmount(line), 0);
    return { id: invoice!.id, number: docNumber, clientName, orderRef, amountCents, clientUserId, clientEmail, clientCompany, clientAddress, clientVat, clientSiren, clientSiret, clientNaf, lines, dueOn: dueOn || DUE_ON_RECEIPT, remindersOn, lang: docLang, currency: docCurrency };
  }

  function addLine(kind: QuoteLine["kind"]) {
    setLines((current) => [...current, { id: crypto.randomUUID(), kind, title: "", details: "", qty: 1, unitCents: 0 }]);
  }

  function setLine(index: number, patch: Partial<QuoteLine>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  return (
    <Shell>
      <PageHead title={invoice ? `Facture ${invoice.number}` : "Facture"}>
        {invoice ? (
          <button className="btn btn-primary" type="button" onClick={() => void openOpsInvoice(shown ?? invoice).catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "PDF impossible."))}>
            Télécharger le PDF
          </button>
        ) : null}
      </PageHead>
      {error || localError ? <p className="mb-3 text-sm text-[#8a1c1c]">{error || localError}</p> : null}
      {!invoice ? <p className="text-sm text-muted">Chargement…</p> : (invoice.status !== "Brouillon" && !modifier) || invoice.kind === "credit" || invoice.status === "Annulée" || invoice.status === "Payée" ? (
        <InvoiceGlance
          invoice={invoice}
          onEdit={() => void navigate({ to: "/factures/fiche/$id", params: { id: invoice.id }, search: { modifier: true } as never })}
          onReload={reload}
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            {orderRef || "Sans commande"} · {clientCompany || clientName || "Client à choisir"} · <Badge value={invoice.status} /> · {formatMoney(shown?.amountCents || invoice.amountCents, docCurrency)}
            <EuroDue cents={shown?.amountCents || invoice.amountCents} currency={docCurrency} />
          </p>
          {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,42%)]">
            <section className="card lg:col-start-1">
              <h2 className="font-semibold">Facture</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm">Numéro
                  <input className="field mt-1" value={docNumber} onChange={(event) => setDocNumber(event.target.value)} />
                </label>
                <label className="text-sm">Devise
                  <input className="field mt-1" value={docCurrency} placeholder="EUR ou CNY" onChange={(event) => setDocCurrency(event.target.value)} />
                </label>
                <label className="text-sm sm:col-span-2">Client
                  <input className="field mt-1" value={clientQuery} placeholder="Nom, société ou email" onChange={(event) => setClientQuery(event.target.value)} />
                  <select className="field mt-2" value={clientUserId} onChange={(event) => chooseClient(event.target.value)}>
                    <option value="">Choisir un compte client</option>
                    {visible.map((client) => (
                      <option key={client.id} value={client.id}>{clientLabel(client)} — {client.email}{client.kind === "particulier" ? " · particulier" : ""}</option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-2 sm:col-span-2">
                  {(["pro", "particulier"] as const).map((value) => (
                    <button
                      key={value}
                      className={`btn ${party === value ? "btn-primary" : "btn-quiet"}`}
                      type="button"
                      onClick={() => {
                        setParty(value);
                        if (value === "particulier") {
                          setClientCompany("");
                          setClientVat("");
                          setClientSiren("");
                          setClientSiret("");
                          setClientNaf("");
                        }
                      }}
                    >
                      {value === "pro" ? "Professionnel" : "Particulier"}
                    </button>
                  ))}
                </div>
                <label className="text-sm">{party === "particulier" ? "Nom et prénom" : "Nom"}
                  <input className="field mt-1" value={clientName} onChange={(event) => setClientName(event.target.value)} />
                </label>
                {party === "pro" ? (
                  <label className="text-sm">Dénomination
                    <input className="field mt-1" value={clientCompany} onChange={(event) => setClientCompany(event.target.value)} />
                  </label>
                ) : null}
                <label className="text-sm">Email
                  <input className="field mt-1" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} />
                </label>
                {party === "pro" ? (
                  <>
                    <label className="text-sm">SIRET
                      <input className="field mt-1" value={clientSiret} onChange={(event) => setClientSiret(event.target.value)} />
                    </label>
                    <label className="text-sm">SIREN
                      <input className="field mt-1" value={clientSiren} onChange={(event) => setClientSiren(event.target.value)} />
                    </label>
                    <label className="text-sm">TVA
                      <input className="field mt-1" value={clientVat} onChange={(event) => setClientVat(event.target.value)} />
                    </label>
                    <label className="text-sm">NAF
                      <input className="field mt-1" value={clientNaf} onChange={(event) => setClientNaf(event.target.value)} />
                    </label>
                  </>
                ) : null}
                <label className="text-sm sm:col-span-2">Adresse
                  <AddressField value={clientAddress} onChange={setClientAddress} />
                </label>
                <label className="text-sm sm:col-span-2">Commande liée
                  <input className="field mt-1" value={orderRef} placeholder="Facultatif" onChange={(event) => setOrderRef(event.target.value)} />
                </label>
              </div>
              {party === "pro" ? <button className="btn btn-quiet mt-3" type="button" onClick={lookup}>Récupérer la dénomination, le SIRET et l’adresse</button> : null}
              {hits.length ? (
                <div className="mt-3 grid gap-2">
                  {hits.map((hit) => (
                    <button
                      key={hit.siret || hit.siren}
                      className="rounded-2xl border border-line bg-canvas px-3 py-2 text-left text-sm"
                      type="button"
                      onClick={() => {
                        const party = partyFromHit(hit, { userId: clientUserId, name: clientName, email: clientEmail });
                        applyParty({ userId: clientUserId, name: party.clientName, email: party.clientEmail, company: party.clientCompany, address: party.clientAddress, vat: party.clientVat, siren: party.clientSiren, siret: party.clientSiret, naf: party.clientNaf });
                        setHits([]);
                      }}
                    >
                      <b>{hit.name}</b>
                      <span className="mt-1 block text-muted">{[hit.address, hit.siret ? `SIRET ${hit.siret}` : ""].filter(Boolean).join(" · ")}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <h3 className="display mt-2 text-lg">Désignations</h3>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={`btn ${docLang !== "en" ? "btn-primary" : "btn-quiet"}`} onClick={() => setDocLang("fr")}>Version française</button>
                <button type="button" className={`btn ${docLang === "en" ? "btn-primary" : "btn-quiet"}`} onClick={() => setDocLang("en")}>Version anglaise</button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-quiet" type="button" onClick={() => addLine("goods")}>Ajouter une marchandise</button>
                <button className="btn btn-quiet" type="button" onClick={() => addLine("service")}>Ajouter une prestation</button>
                <button className="btn btn-quiet" type="button" onClick={() => addLine("freight")}>Ajouter un fret</button>
                <button className="btn btn-quiet" type="button" onClick={() => addLine("fee")}>Ajouter un frais</button>
                <button className="btn btn-quiet" type="button" onClick={() => setLines((current) => [...current, { id: crypto.randomUUID(), kind: "discount", title: docLang === "en" ? "Exceptional discount" : "Remise exceptionnelle", details: "", qty: 1, unitCents: 0 }])}>Remise exceptionnelle</button>
              </div>
              <div className="grid gap-3">
                {lines.map((line, index) => (
                  <article key={line.id} className="rounded-2xl border border-line p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">{kindName(line.kind)}</span>
                      <button className="text-sm font-semibold text-[#8a1c1c]" type="button" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}>Retirer</button>
                    </div>
                    <input className="field text-base font-semibold" value={line.title || ""} placeholder="Désignation" onChange={(event) => setLine(index, { title: event.target.value })} />
                    <div className="mt-2">
                      <BoldField value={line.details || ""} onChange={(details) => setLine(index, { details })} placeholder="Description. Sélectionnez un mot, puis Gras, Italique ou Surligner." />
                    </div>
                    <div className="mt-3">
                      <LinePhotos images={linePhotoList(line)} onChange={(images) => setLine(index, { images, image: images[0] || "" })} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      {line.kind === "freight" ? (
                        <label className="text-sm">
                          {docLang === "en" ? "Percent of the order" : "Pourcentage de la commande"}
                          <DecimalField className="field mt-1 w-28" value={(line.rateBps || 0) / 100} onChange={(value) => setLine(index, { rateBps: Math.min(10000, Math.max(0, Math.round(value * 100))), qty: 1 })} />
                        </label>
                      ) : (
                        <label className="text-sm">Qté
                          <DecimalField className="field mt-1 w-20" fraction={0} value={line.qty} onChange={(qty) => setLine(index, { qty })} />
                        </label>
                      )}
                      {line.kind === "freight" && (line.rateBps || 0) > 0 ? (
                        <p className="mb-2 text-sm">Fret imputé <span className="mono font-semibold">{formatMoney(lineAmount(line), docCurrency)}</span>
                          <span className="mt-1 block text-xs text-muted">Non ajouté au total. Pour l’ajouter, mettez le pourcentage à 0 et saisissez un montant.</span>
                        </p>
                      ) : (
                        <label className="text-sm">Prix unitaire
                          <CentsField className="field mt-1 w-28" cents={line.unitCents} onChange={(unitCents) => setLine(index, { unitCents, rateBps: 0 })} />
                        </label>
                      )}
                      <p className="mb-2 ml-auto text-sm">Total <span className="mono font-semibold">{formatMoney(lineAmount(line), docCurrency)}</span></p>
                    </div>
                  </article>
                ))}
              </div>
              <PieceIndex
                lines={lines}
                onRemove={(lineId, photo) => {
                  setLines((current) => current.map((item) => {
                    if (item.id !== lineId) return item;
                    const images = linePhotoList(item).filter((_, index) => index !== photo);
                    return { ...item, images, image: images[0] || "" };
                  }));
                }}
              />
              <p className="text-right text-sm font-semibold">Total de la facture {formatMoney(lines.reduce((total, line) => total + chargedAmount(line), 0), docCurrency)}
                <EuroDue cents={lines.reduce((total, line) => total + chargedAmount(line), 0)} currency={docCurrency} />
              </p>
              <button
                className="btn btn-quiet mt-3"
                type="button"
                onClick={() => {
                  void opsSaveInvoice({ data: saveBody() })
                    .then(() => {
                      setInfo("Facture enregistrée.");
                      reload();
                    })
                    .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Enregistrement impossible."));
                }}
              >
                Enregistrer la facture
              </button>
            </section>
            <section className="card lg:col-start-1">
              <h2 className="font-semibold">Envoyer la facture</h2>
              <p className="mt-1 text-sm text-muted">Le brouillon se finalise à l’envoi. Les gabarits ne sont pas modifiés : ils remplissent seulement ce message.</p>
              <label className="mt-3 block text-sm">Gabarit
                <select
                  className="field mt-1"
                  defaultValue=""
                  onChange={(event) => {
                    const template = templates.find((item) => item.id === event.target.value);
                    if (!template) return;
                    const fill = (text: string) =>
                      text
                        .split("{{client}}").join(clientName || "")
                        .split("{{numero}}").join(docNumber || invoice.number)
                        .split("{{societe}}").join(clientCompany || clientName || "");
                    setMailSubject(fill(template.subject));
                    setMailText(fill(template.body));
                  }}
                >
                  <option value="">Choisir un de vos messages</option>
                  {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
              </label>
              <div className="mt-3">
                <p className="mb-1 text-sm">Destinataires</p>
                <div className="flex flex-wrap gap-2">
                  {mailTo.split(/[,\s;]+/).map((item) => item.trim()).filter((item, index, all) => item.includes("@") && all.indexOf(item) === index).map((email) => (
                    <button
                      key={email}
                      type="button"
                      className="rounded-full bg-canvas px-3 py-1 text-sm"
                      onClick={() => setMailTo(mailTo.split(/[,\s;]+/).map((item) => item.trim()).filter((item) => item.includes("@") && item !== email).join(", "))}
                    >
                      {email} ×
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input className="field" value={extraMail} placeholder="ajouter un email" onChange={(event) => setExtraMail(event.target.value)} onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    const email = extraMail.trim().toLowerCase();
                    if (!email.includes("@")) return;
                    const current = mailTo.split(/[,\s;]+/).map((item) => item.trim()).filter((item) => item.includes("@"));
                    if (!current.includes(email)) setMailTo([...current, email].join(", "));
                    setExtraMail("");
                  }} />
                  <button className="btn btn-quiet" type="button" onClick={() => {
                    const email = extraMail.trim().toLowerCase();
                    if (!email.includes("@")) return;
                    const current = mailTo.split(/[,\s;]+/).map((item) => item.trim()).filter((item) => item.includes("@"));
                    if (!current.includes(email)) setMailTo([...current, email].join(", "));
                    setExtraMail("");
                  }}>Ajouter</button>
                </div>
              </div>
              <label className="mt-3 block text-sm">Objet
                <input className="field mt-1" value={mailSubject} onChange={(event) => setMailSubject(event.target.value)} />
              </label>
              <div className="mt-3">
                <p className="mb-1 text-sm">Message</p>
                <BoldField value={mailText} onChange={setMailText} placeholder="Bonjour {{client}}, veuillez trouver la facture {{numero}}." />
              </div>
              <div className="mt-3">
                <MailFrame
                  subject={mailSubject || `Votre facture ${docNumber || invoice.number}`}
                  text={mailText}
                  dress={{
                    badge: "FACTURE",
                    title: mailSubject || `Facture ${docNumber || invoice.number}`,
                    amount: isYuan(docCurrency)
                      ? `${formatMoney(invoice.amountCents, docCurrency)} · ${formatMoney(eurCentsFromCny(invoice.amountCents, fx.cnyPerEur), "EUR")}`
                      : formatMoney(invoice.amountCents, docCurrency),
                    amountLabel: isYuan(docCurrency) ? "Yuan · euros à verser" : "Montant",
                    ctaLabel: "Ouvrir mes factures",
                    ctaHref: "https://sourcingpick.com/espace/facturation",
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">{"{{client}}"}, {"{{numero}}"} et {"{{societe}}"} sont remplacés à l’affichage du gabarit. Le bouton et le RIB partent avec le mail.</p>
              <button
                className="btn btn-primary mt-3"
                type="button"
                onClick={() => {
                  setLocalError("");
                  const first = mailTo.split(/[,\s;]+/).find((item) => item.includes("@")) || clientEmail;
                  void opsSaveInvoice({ data: { ...saveBody(), clientEmail: first } })
                    .then(() => opsSendInvoice({ data: { id: invoice.id, message: mailText, to: mailTo || clientEmail, subject: mailSubject } }))
                    .then((result) => {
                      setInfo(`Facture envoyée à ${result.email}.`);
                      reload();
                    })
                    .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Envoi impossible."));
                }}
              >
                Envoyer la facture
              </button>
              {invoice.kind === "credit" ? <p className="mt-3 text-sm text-muted">Avoir finalisé. {invoice.method}. Il reste dans les factures et dans les documents.</p> : null}
              {invoice.status === "Annulée" ? <p className="mt-3 text-sm text-muted">Facture annulée. L’avoir correspondant est finalisé et la facture n’a pas été effacée.</p> : null}
              {invoice.status === "Brouillon" && invoice.kind !== "credit" ? <p className="mt-3 text-sm text-muted">Pas encore envoyée. Supprimer ne l’efface pas : un avoir finalisé est créé.</p> : null}
              {invoice.kind !== "credit" && invoice.status !== "Annulée" ? (
              <div className="mt-3">
                <button
                  className="btn btn-quiet text-[#8a1c1c]"
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Supprimer ${invoice.number} ? Un avoir finalisé sera créé. La facture reste visible, marquée annulée.`)) return;
                    void opsCredit({ data: invoice.id })
                      .then((note) => {
                        setInfo(`Avoir ${note.number} finalisé. ${invoice.number} est annulée.`);
                        reload();
                      })
                      .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Avoir impossible."));
                  }}
                >
                  Supprimer
                </button>
              </div>
              ) : null}
              {invoice.status !== "Brouillon" && invoice.status !== "Annulée" && invoice.kind !== "credit" ? (
              <>
              <h3 className="mt-6 font-semibold">Encaissement</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm">Moyen
                  <select className="field mt-1" value={method} onChange={(event) => setMethod(event.target.value)}>
                    <option>Wise</option>
                    <option>Stripe</option>
                    <option>Virement</option>
                  </select>
                </label>
                <label className="text-sm">Reçu le
                  <input className="field mt-1" type="date" value={receivedOn} onChange={(event) => setReceivedOn(event.target.value)} />
                </label>
                <label className="text-sm">Montant reçu €
                  <CentsField className="field mt-1" cents={receivedCents} onChange={setReceivedCents} />
                </label>
                <label className="text-sm">Frais bancaires €
                  <CentsField className="field mt-1" cents={feesCents} onChange={setFeesCents} />
                </label>
              </div>
              <button
                className="btn btn-primary mt-4"
                type="button"
                onClick={() => {
                  void opsMarkPaid({ data: { id: invoice.id, method, receivedOn, receivedCents: receivedCents || invoice.amountCents, feesCents } })
                    .then(() => {
                      setInfo("Paiement reçu. La commande passe en préparation et le client est prévenu.");
                      reload();
                    })
                    .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Encaissement impossible."));
                }}
              >
                Marquer comme payée
              </button>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn btn-quiet" type="button" onClick={() => void opsRemind({ data: invoice.id }).then(() => { setInfo("Relance envoyée par email."); reload(); }).catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Relance impossible."))}>Relancer maintenant</button>
                <button className="btn btn-quiet" type="button" onClick={() => void opsCredit({ data: invoice.id }).then((note) => navigate({ to: "/avoirs/$id", params: { id: note.id } })).catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Avoir impossible."))}>Créer un avoir</button>
                <button
                  className="btn btn-quiet"
                  type="button"
                  onClick={() => {
                    const next = new Date();
                    next.setMonth(next.getMonth() + 1);
                    const nextOn = next.toISOString().slice(0, 10);
                    void opsSaveSeries({
                      data: {
                        label: lines.find((line) => line.title.trim())?.title || `Facture ${docNumber}`,
                        clientUserId,
                        clientName,
                        clientEmail,
                        clientCompany,
                        clientAddress,
                        clientVat,
                        orderRef,
                        lines,
                        cadence: "month",
                        nextOn,
                        endOn: "",
                      },
                    })
                      .then(() => navigate({ to: "/factures/recurrentes" }))
                      .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Récurrence impossible."));
                  }}
                >
                  Rendre mensuelle
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm">Échéance
                  <input className="field mt-1" type="date" value={dueOn} onChange={(event) => setDueOn(event.target.value)} />
                  <span className="mt-1 block text-xs text-muted">{dueOn ? "Date choisie. Vide, l’échéance redevient à réception." : "À réception de la facture."}</span>
                </label>
                <label className="mt-6 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={remindersOn} onChange={(event) => setRemindersOn(event.target.checked)} />
                  Relances automatiques
                </label>
              </div>
              <p className="mt-2 text-sm text-muted">
                {remindersOn
                  ? `Rappel 7 jours après l’échéance, relance à 15 jours, dernier rappel à 30 jours.${invoice.reminderLevel ? ` Dernier envoi : niveau ${invoice.reminderLevel}${invoice.reminderOn ? ` le ${invoice.reminderOn.split("-").reverse().join("/")}` : ""}.` : " Aucun envoi pour l’instant."}`
                  : "Les relances automatiques sont coupées pour cette facture. Le bouton ci-dessus envoie quand même un email."}
              </p>
              {invoice.receivedCents != null ? (
                <p className="mt-3 text-sm text-muted">Déjà reçu {formatMoney(invoice.receivedCents || 0, docCurrency)} via {invoice.method || "—"}{invoice.receivedOn ? ` le ${invoice.receivedOn.split("-").reverse().join("/")}` : ""}{invoice.feesCents ? ` · frais ${formatMoney(invoice.feesCents, docCurrency)}` : ""}.</p>
              ) : null}
              </>
              ) : null}
            </section>
            <aside className="sticky top-24 hidden overflow-hidden rounded-[22px] border border-line bg-[#eef2f8] p-3 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block">
              <h2 className="mb-2 px-1 text-sm font-semibold">Aperçu</h2>
              {draft ? <PaperView doc={draft} /> : null}
            </aside>
          </div>
        </>
      )}
    </Shell>
  );
}

function pieceKind(kind: string) {
  if (kind === "credit") return "Avoir";
  if (kind === "deposit") return "Facture d’acompte";
  if (kind === "balance") return "Facture de solde";
  return "Facture";
}

function EuroDue({ cents, currency }: { cents: number; currency?: string }) {
  const fx = useFxRate();
  if (!isYuan(currency) || !(fx.cnyPerEur > 0)) return null;
  return (
    <span className="mt-1 block text-sm font-semibold">
      À verser en euros : {formatMoney(eurCentsFromCny(cents, fx.cnyPerEur), "EUR")}
      <span className="mt-0.5 block text-xs font-normal text-muted">1 € = {formatRate(fx.cnyPerEur)} CNY · {fx.source === "ecb" ? "BCE" : "indicatif"}{rateWhen(fx.fetchedAt) ? ` · en direct ${rateWhen(fx.fetchedAt)}` : ""}</span>
    </span>
  );
}

function InvoiceGlance({ invoice, onEdit, onReload }: { invoice: OpsInvoice; onEdit: () => void; onReload: () => void }) {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState("");
  const { data: quotes } = useOps(() => opsQuotes(), "quotes");
  const { data: invoices } = useOps(() => opsInvoices(), "invoices");
  const relatedQuotes = (quotes ?? []).filter(
    (quote) => (invoice.orderRef && quote.orderRef === invoice.orderRef) || invoice.method.includes(quote.number),
  );
  const relatedBills = (invoices ?? []).filter((other) => {
    if (other.id === invoice.id) return false;
    if (invoice.orderRef && other.orderRef === invoice.orderRef) return true;
    if (other.method.includes(invoice.number) || invoice.method.includes(other.number)) return true;
    return false;
  });
  const closed = invoice.status === "Annulée" || invoice.kind === "credit" || invoice.status === "Payée";
  const draft = factureFromOps(invoice);
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="overflow-auto rounded-[22px] border border-line bg-[#eef2f8] p-3">
        <PaperView doc={draft} />
      </section>
      <aside className="card grid gap-2">
        <Badge value={invoice.status} />
        <p className="font-semibold">{clientLabel({ name: invoice.clientName, company: invoice.clientCompany })}</p>
        <p className="mono text-lg">{formatMoney(invoice.amountCents, invoice.currency)}</p>
        <EuroDue cents={invoice.amountCents} currency={invoice.currency} />
        <p className="text-sm text-muted">Document finalisé. Les champs ne s’ouvrent qu’avec Modifier.</p>
        <div className="rounded-xl bg-canvas p-3 text-sm">
          <p className="font-semibold">Pièces liées</p>
          <ul className="mt-2 grid gap-1">
            {relatedQuotes.length === 0 ? <li className="text-muted">Aucun devis lié.</li> : null}
            {relatedQuotes.map((quote) => (
              <li key={quote.id} className="flex items-center justify-between gap-2">
                <span>Devis</span>
                <Link className="mono font-semibold text-brand" to="/devis/nouveau" search={{ id: quote.id }}>{quote.number}</Link>
              </li>
            ))}
            <li className="flex items-center justify-between gap-2">
              <span>{pieceKind(invoice.kind)}</span>
              <b className="mono">{invoice.number}</b>
            </li>
            {relatedBills.map((other) => (
              <li key={other.id} className="flex items-center justify-between gap-2">
                <span>{pieceKind(other.kind)}</span>
                <Link className="mono font-semibold text-brand" to={other.kind === "credit" ? "/avoirs/$id" : "/factures/fiche/$id"} params={{ id: other.id }}>
                  {other.number}
                </Link>
              </li>
            ))}
            {relatedBills.length === 0 ? <li className="text-muted">Pas d’autre facture ni d’avoir sur ce dossier.</li> : null}
          </ul>
        </div>
        {note ? <p className="text-sm text-[#0e9f6e]">{note}</p> : null}
        {problem ? <p className="text-sm text-[#8a1c1c]">{problem}</p> : null}
        <button className="btn btn-primary" type="button" onClick={() => void openOpsInvoice(invoice).catch((err: unknown) => setProblem(err instanceof Error ? err.message : "PDF impossible."))}>Ouvrir le PDF</button>
        {invoice.kind !== "credit" && invoice.status !== "Annulée" && invoice.status !== "Payée" ? (
          <button className="btn btn-quiet" type="button" onClick={onEdit}>Modifier</button>
        ) : null}
        {!closed ? (
          <>
            <button className="btn btn-quiet" type="button" onClick={() => void opsMarkPaid({ data: { id: invoice.id, method: invoice.method || "Virement", receivedOn: new Date().toISOString().slice(0, 10), receivedCents: invoice.amountCents, feesCents: 0 } }).then(() => { setNote("Paiement enregistré."); onReload(); }).catch((err: unknown) => setProblem(err instanceof Error ? err.message : "Encaissement impossible."))}>Marquer comme payée</button>
            <button className="btn btn-quiet" type="button" onClick={() => void opsRemind({ data: invoice.id }).then(() => setNote("Relance envoyée.")).catch((err: unknown) => setProblem(err instanceof Error ? err.message : "Relance impossible."))}>Relancer</button>
          </>
        ) : null}
        {invoice.kind !== "credit" && invoice.status !== "Annulée" ? (
          <button className="btn btn-quiet text-[#8a1c1c]" type="button" onClick={() => {
            if (!window.confirm(`Supprimer ${invoice.number} ? Un avoir finalisé sera créé.`)) return;
            void opsCredit({ data: invoice.id })
              .then((created) => navigate({ to: "/avoirs/$id", params: { id: created.id } }))
              .catch((err: unknown) => setProblem(err instanceof Error ? err.message : "Avoir impossible."));
          }}>Supprimer (avoir)</button>
        ) : null}
      </aside>
    </div>
  );
}
