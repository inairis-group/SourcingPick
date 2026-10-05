import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHead, Shell } from "@/components/shell";
import { PaperView } from "@/components/paper";
import { Badge, useOps } from "@/components/ops-ui";
import { opsClients, opsCreateQuoteClient, opsEmails, opsInvoices, opsMarkQuoteSigned, opsQuote, opsQuoteActivity, opsQuoteBill, opsQuotes, opsSaveQuote, opsSendQuote } from "@/lib/ops.functions";
import { devisFromOps, openOpsQuote, signRows, syncOpsClient } from "@/lib/ops-paper";
import { isOldQuoteMail, quoteReceivedBody, refreshQuoteMail } from "@/lib/mail-templates";
import { clientLabel, lineAmount, percent, pricedLines, quoteMath, type CompanyHit, type OpsClient, type OpsEmail, type OpsInvoice, type OpsQuote, type QuoteLine } from "@/lib/ops.shared";
import { cnyCentsFromEur, eurCentsFromCny, formatMoney, formatRate, isYuan, rateWhen } from "@/lib/fx.shared";
import { useFxRate } from "@/lib/use-fx";
import { matchCompany, partyFromClient, partyFromHit, recoverCompany } from "@/lib/client-party";
import { RichField } from "@/components/marks";
import { CentsField, DecimalField } from "@/components/decimal-field";
import { LinePhotos, PieceIndex, linePhotoList } from "@/components/line-photos";
import { useAccount } from "@/lib/use-account";

export const Route = createFileRoute("/devis/nouveau")({
  validateSearch: (search: Record<string, unknown>): { id: string; modifier?: boolean } => ({
    id: typeof search.id === "string" ? search.id : "",
    ...(search.modifier === "1" || search.modifier === 1 || search.modifier === true ? { modifier: true } : {}),
  }),
  head: () => ({ meta: [{ title: "SourcingPick — Nouveau devis" }] }),
  component: Page,
});

const STEPS = ["1. Client et commande", "2. Lignes du devis", "3. Aperçu et envoi"];

function emptyLine(kind: QuoteLine["kind"]): QuoteLine {
  return { id: crypto.randomUUID(), kind, title: "", details: "", qty: 1, unitCents: 0 };
}

function Page() {
  const { id, modifier } = Route.useSearch();
  const navigate = useNavigate();
  const account = useAccount();
  const fx = useFxRate();
  const [step, setStep] = useState(1);
  const [quote, setQuote] = useState<OpsQuote | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [dispatch, setDispatch] = useState<{ link: string; sent: boolean; email: string; code: string } | null>(null);
  const [clients, setClients] = useState<OpsClient[]>([]);
  const [search, setSearch] = useState("");
  const [temporary, setTemporary] = useState("");
  const [hits, setHits] = useState<CompanyHit[]>([]);
  const [party, setParty] = useState<"pro" | "particulier">("pro");
  const [templates, setTemplates] = useState<OpsEmail[]>([]);
  const filled = useRef("");
  const { data: bills } = useOps(() => opsInvoices(), "invoices");
  const { data: allQuotes } = useOps(() => opsQuotes(), "quotes");

  useEffect(() => {
    void opsClients().then(setClients).catch(() => setClients([]));
    void opsEmails().then((data) => setTemplates(data.templates)).catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    if (quote?.status === "Devis envoyé" && !modifier) setStep(3);
  }, [quote?.id, quote?.status, modifier]);

  useEffect(() => {
    if (!quote?.clientUserId || !clients.length || filled.current === quote.id) return;
    const client = clients.find((item) => item.id === quote.clientUserId);
    if (!client) return;
    filled.current = quote.id;
    if (quote.clientCompany && quote.clientAddress && quote.clientSiret) return;
    setQuote((value) =>
      value
        ? {
            ...value,
            clientName: value.clientName || client.name,
            clientEmail: value.clientEmail || client.email,
            clientCompany: value.clientCompany || client.company,
            clientAddress: value.clientAddress || client.address,
            clientVat: value.clientVat || client.vat,
            clientCountry: value.clientCountry || client.country,
            clientSiren: value.clientSiren || client.siren,
            clientSiret: value.clientSiret || client.siret,
            clientNaf: value.clientNaf || client.naf,
          }
        : value,
    );
  }, [quote, clients]);

  useEffect(() => {
    if (!id) return;
    void opsQuote({ data: id })
      .then((value) => {
        if (!value) return;
        const cannedSubject = `Votre devis ${value.number}`;
        const cannedBody = "Bonjour,\n\nveuillez trouver votre devis.";
        const nextBody = isOldQuoteMail(value.emailBody) ? quoteReceivedBody() : value.emailBody;
        setQuote({
          ...value,
          emailSubject: value.emailSubject === cannedSubject ? "" : refreshQuoteMail(value.emailSubject, value),
          emailBody: nextBody === cannedBody ? "" : refreshQuoteMail(nextBody, value),
        });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Lecture impossible."));
  }, [id]);

  useEffect(() => {
    setQuote((value) => {
      if (!value?.emailBody && !value?.emailSubject) return value;
      const emailBody = refreshQuoteMail(value.emailBody || "", value);
      const emailSubject = refreshQuoteMail(value.emailSubject || "", value);
      if (emailBody === (value.emailBody || "") && emailSubject === (value.emailSubject || "")) return value;
      return { ...value, emailBody, emailSubject };
    });
  }, [quote?.validityDays, quote?.depositBps, quote?.goodsBps, quote?.freightBps, quote?.incoterm, quote?.clientName, quote?.number, quote?.lines, quote?.emailBody, quote?.emailSubject]);

  useLayoutEffect(() => {
    if (quote) syncOpsClient(quote);
  }, [quote]);

  if (!quote) {
    return (
      <Shell>
        <PageHead title="Nouveau devis" />
        <p className="text-sm text-muted">{error || "Chargement…"}</p>
      </Shell>
    );
  }

  const current = quote;
  const money = (cents: number) => formatMoney(cents, current.currency);
  const sealed = current.status === "Devis signé" || current.status === "Devis refusé";
  if (sealed) {
    const draft = devisFromOps(current);
    return (
      <Shell>
        <PageHead title={`Devis ${current.number}`}>
          <Badge value={current.status} />
          {current.status === "Devis envoyé" ? (
            <button className="btn btn-quiet" type="button" onClick={() => void navigate({ to: "/devis/nouveau", search: { id: current.id, modifier: true } })}>
              Modifier
            </button>
          ) : null}
          <button className="btn btn-primary" type="button" onClick={() => void openOpsQuote(current)}>Ouvrir le PDF</button>
        </PageHead>
        <p className="mb-4 text-sm text-muted">
          Document finalisé. La ligne ouvre la lecture et les actions. La modification n’est proposée que tant que le devis n’est pas signé.
        </p>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-auto rounded-[22px] border border-line bg-[#eef2f8] p-3">
            <PaperView doc={draft} onFont={(font) => patch({ font })} />
          </section>
          <aside className="card grid gap-2">
            <p className="font-semibold">{current.clientCompany || current.clientName || "Client"}</p>
            <p className="text-sm text-muted">{money(current.amountCents)} · acompte {percent(current.depositBps)}</p>
            {isYuan(current.currency) ? <p className="text-sm font-semibold">À verser en euros : {formatMoney(eurCentsFromCny(current.amountCents, fx.cnyPerEur), "EUR")}</p> : <p className="text-sm text-muted">Équivalent {formatMoney(cnyCentsFromEur(current.amountCents, fx.cnyPerEur), "CNY")}</p>}
            {current.signerName ? (
              <div className="grid gap-2 rounded-2xl bg-canvas p-3">
                <p className="font-semibold">Signature électronique</p>
                {signRows(current).map((row) => (
                  <p key={row.label} className="text-sm">
                    <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">{row.label}</span>
                    <span className="break-words">{row.value}</span>
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">En attente de signature.</p>
            )}
            <Linked quote={current} invoices={bills ?? []} quotes={allQuotes ?? []} />
            <QuoteTrail id={current.id} />
            {current.status === "Devis signé" && account?.role === "admin" ? (
              <BillActions quote={current} invoices={bills ?? []} onError={setError} error={error} signed />
            ) : null}
            {current.status === "Devis envoyé" ? (
              <button className="btn btn-primary" type="button" onClick={() => void navigate({ to: "/devis/nouveau", search: { id: current.id, modifier: true } })}>
                Ouvrir la modification
              </button>
            ) : null}
          </aside>
        </div>
      </Shell>
    );
  }
  const math = quoteMath(current.lines, current.goodsBps, current.freightBps, current.depositBps);
  const draft = devisFromOps(current);

  function patch(partial: Partial<OpsQuote>) {
    setQuote((value) => {
      if (!value) return value;
      const next = { ...value, ...partial };
      return { ...next, lines: pricedLines(next.lines ?? [], next.goodsBps) };
    });
  }

  function setLine(index: number, partial: Partial<QuoteLine>) {
    patch({ lines: current.lines.map((item, i) => (i === index ? { ...item, ...partial } : item)) });
  }

  async function persist() {
    const payload = {
      ...current,
      validityDays: Math.max(0, Math.round(Number(current.validityDays) || 0)),
      goodsBps: Math.max(0, Math.round(Number(current.goodsBps) || 0)),
      freightBps: Math.max(0, Math.round(Number(current.freightBps) || 0)),
      depositBps: Math.max(0, Math.round(Number(current.depositBps) || 0)),
    };
    const saved = await opsSaveQuote({ data: payload });
    setQuote(saved);
    setInfo("Brouillon enregistré.");
    setError("");
    return saved;
  }

  function go(next: number) {
    void persist()
      .then(() => setStep(next))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Enregistrement impossible.");
        setStep(next);
      });
  }

  async function send() {
    try {
      setError("");
      const missing = quoteGaps(current, uniqueClients(clients));
      if (missing.length) throw new Error(`Avant d’envoyer, renseignez ${missing.join(", ")}.`);
      const saved = await persist();
      const result = await opsSendQuote({ data: { id: saved.id, email: saved.clientEmail, message: saved.emailBody } });
      setQuote({ ...saved, status: "Devis envoyé" });
      setDispatch(result);
      setStep(3);
      setInfo(`Email envoyé à ${result.email}. Vous pouvez le renvoyer avec un autre message.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    }
  }

  function chooseClient(userId: string) {
    const client = clients.find((item) => item.id === userId);
    if (!client) {
      patch({ clientUserId: "" });
      setHits([]);
      return;
    }
    const next = partyFromClient(client);
    const person = client.kind === "particulier";
    setParty(person ? "particulier" : "pro");
    patch(person ? { ...next, clientCompany: "", clientVat: "", clientSiren: "", clientSiret: "", clientNaf: "" } : next);
    setTemporary("");
    setHits([]);
  }

  function applyHit(hit: CompanyHit) {
    patch(partyFromHit(hit, { userId: current.clientUserId, name: current.clientName, email: current.clientEmail, country: current.clientCountry }));
    setHits([]);
    setInfo(`Entreprise récupérée : ${hit.name}.`);
  }

  function lookup() {
    const query = current.clientSiret || current.clientSiren || current.clientCompany || current.clientName;
    setError("");
    void recoverCompany(query)
      .then((found) => {
        if (!found.length) {
          setError("Aucune entreprise trouvée dans l’annuaire. Vérifiez la dénomination ou le SIRET.");
          setHits([]);
          return;
        }
        const hit = matchCompany(found, { company: current.clientCompany, name: current.clientName, siren: current.clientSiren, siret: current.clientSiret });
        if (hit && found.length === 1) applyHit(hit);
        else setHits(found);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Annuaire indisponible."));
  }

  async function attachAccount() {
    try {
      setError("");
      const created = await opsCreateQuoteClient({
        data: {
          name: current.clientName,
          email: current.clientEmail,
          company: current.clientCompany,
          address: current.clientAddress,
          vat: current.clientVat,
          country: current.clientCountry,
          siren: party === "particulier" ? "" : current.clientSiren,
          siret: party === "particulier" ? "" : current.clientSiret,
          naf: party === "particulier" ? "" : current.clientNaf,
          kind: party,
        },
      });
      const next = { ...current, clientUserId: created.id };
      const saved = await opsSaveQuote({ data: next });
      setQuote(saved);
      setTemporary(created.temporary);
      setClients(await opsClients());
      setInfo(created.temporary ? "Compte créé et devis rattaché." : "Compte existant rattaché à ce devis.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rattachement impossible.");
    }
  }

  const roster = uniqueClients(clients);
  const needle = search.trim().toLowerCase();
  const known = roster.filter((client) => `${client.name} ${client.company} ${client.email}`.toLowerCase().includes(needle));
  const selected = roster.find((client) => client.id === quote.clientUserId);
  const options = selected && !known.some((client) => client.id === selected.id) ? [selected, ...known] : known;
  const orphan = Boolean(quote.clientUserId) && !selected;
  const sendGaps = quoteGaps(current, roster);
  const sent = current.status === "Devis envoyé" || current.status === "Devis signé" || Boolean(dispatch);
  const mailFields = (
    <>
      <label className="mt-3 block text-sm font-semibold">Client
        <select className="field mt-1 font-normal" value={selected ? quote.clientUserId : ""} onChange={(event) => chooseClient(event.target.value)}>
          <option value="">Choisir un client</option>
          {roster.map((client) => (
            <option key={client.id} value={client.id}>{clientLabel(client)} — {client.email}</option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-sm text-muted">{selected ? selected.email : "Seuls les clients enregistrés et actifs apparaissent."}</p>
      <label className="mt-3 block text-sm font-semibold">Gabarit
        <select
          className="field mt-1 font-normal"
          defaultValue=""
          onChange={(event) => {
            const template = templates.find((item) => item.id === event.target.value);
            if (!template) return;
            patch({
              emailSubject: refreshQuoteMail(template.subject, quote),
              emailBody: refreshQuoteMail(template.body, quote),
            });
          }}
        >
          <option value="">Choisir un de vos messages</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
      </label>
      <label className="mt-3 block text-sm font-semibold">Objet de l’email
        <input className="field mt-1 font-normal" value={quote.emailSubject || ""} placeholder="Écrivez l’objet" onChange={(event) => patch({ emailSubject: event.target.value })} />
      </label>
      <div className="mt-3">
        <p className="mb-1 text-sm font-semibold">Message d’accompagnement</p>
        <RichField value={quote.emailBody} onChange={(emailBody) => patch({ emailBody })} placeholder="Bonjour, voici le devis." minHeight="8rem" />
      </div>
      {sendGaps.length ? <p className="mt-3 text-sm text-[#8a1c1c]">Avant d’envoyer, renseignez {sendGaps.join(", ")}.</p> : null}
      <button className="btn btn-primary mt-3 w-full" type="button" disabled={sendGaps.length > 0} onClick={() => void send()}>{sent ? "Renvoyer le devis" : "Envoyer au client"}</button>
      <p className="mt-2 text-xs leading-relaxed text-muted">Le message explique le devis et les étapes de signature. Une copie part automatiquement à contact@sourcingpick.com. Le code n’est pas dans l’email : le client le reçoit après avoir indiqué son adresse.</p>
      {error ? <p className="mt-2 text-sm text-[#8a1c1c]">{error}</p> : null}
      {dispatch ? (
        <div className="mt-3 rounded-2xl bg-canvas p-3 text-xs leading-relaxed">
          <p className="font-semibold">{dispatch.sent ? "Email parti. Le devis est marqué envoyé." : "À transmettre"}</p>
          <p className="mt-1 break-all">{dispatch.link}</p>
        </div>
      ) : null}
    </>
  );

  return (
    <Shell>
      <PageHead title="Nouveau devis">
        <button className="btn btn-quiet" type="button" onClick={() => void persist()}>Enregistrer le brouillon</button>
        {step === 3 ? (
          <>
            <button className="btn btn-quiet" type="button" onClick={() => void openOpsQuote(quote)}>Télécharger le PDF</button>
            <button className="btn btn-primary" type="button" disabled={sendGaps.length > 0} onClick={() => void send()}>Envoyer au client</button>
          </>
        ) : null}
      </PageHead>
      {quote.orderRef || quote.clientName ? (
        <p className="-mt-3 mb-4 text-sm text-muted">{[quote.orderRef, quote.clientName].filter(Boolean).join(" · ")}</p>
      ) : null}
      <ol className="sp-steps">
        {STEPS.map((label, index) => (
          <li key={label}>
            {index > 0 ? <i /> : null}
            <button type="button" aria-current={step === index + 1 ? "step" : undefined} onClick={() => go(index + 1)}>
              {label}
            </button>
          </li>
        ))}
      </ol>
      {info ? <p className="mb-3 text-sm text-[#0e9f6e]">{info}</p> : null}
      {error ? <p className="mb-3 text-sm text-[#8a1c1c]">{error}</p> : null}
      {account?.role === "admin" && quote.status !== "Devis signé" && quote.status !== "Devis refusé" ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3">
          <p className="text-sm">Signer à la place du client, sans email. L’acompte se crée ensuite, ici, sans envoi.</p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              setError("");
              void opsMarkQuoteSigned({ data: quote.id })
                .then(() => {
                  setQuote((value) => value ? {
                    ...value,
                    status: "Devis signé",
                    signerName: account?.name || "Administration",
                    signedAt: new Date().toISOString(),
                    signMeta: JSON.stringify({ name: account?.name || "Administration", role: "Administration", manual: true }),
                  } : value);
                })
                .catch((err: unknown) => setError(err instanceof Error ? err.message : "Marquage impossible."));
            }}
          >
            Marquer comme signé
          </button>
        </div>
      ) : null}

      {step === 1 ? (
        <>
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="card flex flex-col gap-3">
              <h2 className="display text-lg">1. Client et commande</h2>
              <label className="block text-sm font-semibold">
                Compte client
                <input className="field mt-1 font-normal" value={search} placeholder="Rechercher par nom, société ou email" onChange={(event) => setSearch(event.target.value)} />
                <select className="field mt-2 font-normal" value={selected ? quote.clientUserId : ""} onChange={(event) => chooseClient(event.target.value)}>
                  <option value="">Pas encore de compte</option>
                  {options.map((client) => (
                    <option key={client.id} value={client.id}>
                      {clientLabel(client) + " — " + client.email + (client.kind === "particulier" ? " · particulier" : "")}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-sm text-muted">
                {orphan
                  ? "Ce devis pointe vers un compte qui n’existe plus ou qui n’est plus actif. Choisissez un client enregistré."
                  : quote.clientUserId
                    ? "Le devis est lié à ce compte actif. Sans l’email de ce compte, l’envoi est bloqué."
                    : "Seuls les clients enregistrés et actifs sont listés. Choisissez-en un, ou créez le compte après avoir saisi son email."}
              </p>
              <div className="flex gap-2">
                {(["pro", "particulier"] as const).map((value) => (
                  <button
                    key={value}
                    className={`btn ${party === value ? "btn-primary" : "btn-quiet"}`}
                    type="button"
                    onClick={() => {
                      setParty(value);
                      if (value === "particulier") patch({ clientCompany: "", clientVat: "", clientSiren: "", clientSiret: "", clientNaf: "" });
                    }}
                  >
                    {value === "pro" ? "Professionnel" : "Particulier"}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={party === "particulier" ? "Nom et prénom" : "Nom du client"} value={quote.clientName || ""} placeholder="Nom et prénom" onChange={(clientName) => patch({ clientName })} />
                {party === "pro" ? <Field label="Dénomination" value={quote.clientCompany || ""} placeholder="Raison sociale" onChange={(clientCompany) => patch({ clientCompany })} /> : null}
                <Field label="Email" value={quote.clientEmail || ""} placeholder={party === "particulier" ? "prenom@email.com" : "client@societe.com"} onChange={(clientEmail) => patch({ clientEmail })} />
                {party === "pro" ? <Field label="SIRET" value={quote.clientSiret || ""} placeholder="14 chiffres" onChange={(clientSiret) => patch({ clientSiret })} /> : null}
                {party === "pro" ? <Field label="SIREN" value={quote.clientSiren || ""} placeholder="9 chiffres" onChange={(clientSiren) => patch({ clientSiren })} /> : null}
                {party === "pro" ? <Field label="TVA" value={quote.clientVat || ""} placeholder="FR…" onChange={(clientVat) => patch({ clientVat })} /> : null}
                {party === "pro" ? <Field label="NAF" value={quote.clientNaf || ""} placeholder="Ex. 46.90Z" onChange={(clientNaf) => patch({ clientNaf })} /> : null}
                <Field label="Adresse" value={quote.clientAddress || ""} placeholder={party === "particulier" ? "Adresse de facturation" : "Adresse du siège"} onChange={(clientAddress) => patch({ clientAddress })} />
                <Field label="Pays" value={quote.clientCountry || ""} placeholder="France" onChange={(clientCountry) => patch({ clientCountry })} />
              </div>
              {party === "pro" ? <button className="btn btn-quiet w-fit" type="button" onClick={lookup}>Récupérer la dénomination, le SIRET et l’adresse</button> : null}
              {hits.length ? (
                <div className="grid gap-2">
                  <p className="text-sm font-semibold">Annuaire — ce ne sont pas vos clients enregistrés</p>
                  {hits.map((hit) => (
                    <button key={hit.siret || hit.siren} className="rounded-2xl border border-line bg-canvas px-3 py-2 text-left text-sm" type="button" onClick={() => applyHit(hit)}>
                      <b>{hit.name}</b>
                      <span className="mt-1 block text-muted">{[hit.address, hit.siret ? `SIRET ${hit.siret}` : "", hit.siren ? `SIREN ${hit.siren}` : ""].filter(Boolean).join(" · ")}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              {quote.clientUserId ? null : (
                <button className="btn btn-quiet w-fit" type="button" onClick={() => void attachAccount()}>Créer le compte et rattacher</button>
              )}
              {temporary ? <p className="text-sm font-semibold">Mot de passe provisoire : {temporary}</p> : null}
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_120px]">
                <Field label="Référence de la commande" value={quote.orderRef || ""} onChange={(orderRef) => patch({ orderRef })} />
                <label className="block text-sm font-semibold">
                  Langue du document
                  <select className="field mt-1 font-normal" value={quote.lang === "en" ? "en" : "fr"} onChange={(event) => patch({ lang: event.target.value })}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <Field label="Devise" value={quote.currency} onChange={(currency) => patch({ currency })} />
              </div>
              <p className="text-xs text-muted">EUR ou CNY. Le taux BCE est relu en direct : un devis en yuan affiche tout de suite la somme à verser en euros.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Incoterm" value={quote.incoterm} onChange={(incoterm) => patch({ incoterm })} />
                <Field label="Port d’arrivée" value={quote.port} onChange={(port) => patch({ port })} />
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="block w-[200px] text-sm font-semibold">
                  Validité
                  <div className="mt-1 flex">
                    <input className="field rounded-r-none font-normal" inputMode="numeric" value={String(quote.validityDays ?? "")} onChange={(event) => patch({ validityDays: Math.max(0, Math.round(Number(event.target.value.replace(/[^\d]/g, "")) || 0)) })} />
                    <span className="inline-flex items-center rounded-r-xl border border-l-0 border-line bg-canvas px-3 text-sm font-normal text-muted">jours</span>
                  </div>
                </label>
                <Percent label="Taux d’acompte" value={quote.depositBps / 100} onChange={(value) => patch({ depositBps: Math.round(value * 100) })} />
              </div>
            </section>
            <section className="card flex flex-col gap-3">
              <h2 className="display text-lg">Commissions</h2>
              <p className="text-sm leading-relaxed text-muted">La commission marchandise se calcule sur les marchandises. La commission fret se calcule sur le fret, qu’il soit ajouté au total ou imputé dans les prix. À zéro, la ligne disparaît du devis.</p>
              <div className="flex flex-wrap items-end gap-2">
                <Percent label={`Commission marchandise (${percent(quote.goodsBps)} %)`} value={quote.goodsBps / 100} onChange={(value) => patch({ goodsBps: Math.round(value * 100) })} />
                <button className="btn btn-quiet" type="button" onClick={() => patch({ goodsBps: 0 })}>Retirer</button>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <Percent label={`Commission fret (${percent(quote.freightBps)} %)`} value={quote.freightBps / 100} onChange={(value) => patch({ freightBps: Math.round(value * 100) })} />
                <button className="btn btn-quiet" type="button" onClick={() => patch({ freightBps: 0 })}>Retirer</button>
              </div>
            </section>
          </div>
          <button className="btn btn-primary mt-4" type="button" onClick={() => go(2)}>Suivant</button>
        </>
      ) : null}

      {step === 2 ? (
        <section className="card">
          <h2 className="display mb-1 text-lg">2. Lignes du devis</h2>
          <p className="mb-4 text-sm text-muted">Chaque ligne a un titre, une description mise en forme, et autant de photos que vous voulez (8 maximum). Le gras, l’italique et le surlignage se voient tout de suite, y compris sur le devis.</p>
          <div className="mb-4 flex flex-wrap gap-2">
            <button className="btn btn-quiet" type="button" onClick={() => patch({ lines: [...quote.lines, emptyLine("goods")] })}>Ajouter une marchandise</button>
            <button className="btn btn-quiet" type="button" onClick={() => patch({ lines: [...quote.lines, emptyLine("service")] })}>Ajouter une prestation</button>
            <button className="btn btn-quiet" type="button" onClick={() => patch({ lines: [...quote.lines, emptyLine("freight")] })}>Ajouter un fret</button>
            <button className="btn btn-quiet" type="button" onClick={() => patch({ lines: [...quote.lines, emptyLine("fee")] })}>Ajouter un frais</button>
            <button className="btn btn-quiet" type="button" onClick={() => patch({ lines: [...quote.lines, { ...emptyLine("discount"), title: quote.lang === "en" ? "Exceptional discount" : "Remise exceptionnelle" }] })}>Remise exceptionnelle</button>
          </div>
          <div className="grid gap-4">
            {(quote.lines ?? []).map((line, index) => (
              <article key={line.id} className="grid gap-3 rounded-2xl border border-line bg-white p-4 lg:grid-cols-[160px_minmax(0,1fr)_220px]">
                <div>
                  <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">{kindName(line.kind)}</p>
                  <LinePhotos
                    images={linePhotoList(line)}
                    onChange={(images) => setLine(index, { images, image: images[0] || "" })}
                  />
                </div>
                <div className="grid content-start gap-2">
                  <input className="field" value={line.title || ""} onChange={(event) => setLine(index, { title: event.target.value })} placeholder={kindName(line.kind)} />
                  <RichField value={line.details || ""} onChange={(details) => setLine(index, { details })} placeholder="Description. Sélectionnez un mot, puis Gras, Italique ou Surligner. Un second clic enlève le style." />
                </div>
                <div className="grid content-start gap-2">
                  {line.kind === "freight" ? (
                    <label className="text-sm font-semibold">
                      {quote.lang === "en" ? "Percent of the order" : "Pourcentage de la commande"}
                      <DecimalField className="field mt-1 font-normal" value={(line.rateBps || 0) / 100} onChange={(value) => setLine(index, { rateBps: Math.min(10000, Math.max(0, Math.round(value * 100))), qty: 1 })} />
                    </label>
                  ) : null}
                  {line.kind === "freight" ? null : (
                    <label className="text-sm font-semibold">Quantité
                      <DecimalField className="field mt-1 font-normal" fraction={0} value={line.qty} onChange={(qty) => setLine(index, { qty })} />
                    </label>
                  )}
                  {line.kind === "freight" && (line.rateBps || 0) > 0 ? (
                    <p className="text-sm">Fret imputé <span className="mono font-semibold">{money(lineAmount(line))}</span>
                      <span className="mt-1 block text-xs font-normal text-muted">Pourcentage de la commande. Il s’affiche, il ne s’ajoute pas au total. Pour l’ajouter, mettez le pourcentage à zéro et saisissez un montant.</span>
                    </p>
                  ) : (
                    <label className="text-sm font-semibold">Prix unitaire
                      <CentsField className="field mt-1" cents={line.unitCents} onChange={(unitCents) => setLine(index, { unitCents, rateBps: 0 })} />
                    </label>
                  )}
                  <p className="text-sm">Total <span className="mono font-semibold">{money(lineAmount(line))}</span></p>
                  <button className="text-left text-sm font-semibold text-[#8a1c1c]" type="button" onClick={() => patch({ lines: quote.lines.filter((item) => item.id !== line.id) })}>Retirer la ligne</button>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-4">
            <PieceIndex
              lines={quote.lines ?? []}
              onRemove={(lineId, photo) => {
                const next = (quote.lines ?? []).map((item) => {
                  if (item.id !== lineId) return item;
                  const images = linePhotoList(item).filter((_, index) => index !== photo);
                  return { ...item, images, image: images[0] || "" };
                });
                patch({ lines: next });
              }}
            />
          </div>
          <ul className="mt-4 ml-auto grid max-w-md gap-1 text-sm">
            <Sum label="Total marchandise" value={money(math.goodsCents)} />
            {(quote.lines ?? []).some((item) => item.kind === "service") ? <Sum label="Total prestations" value={money(math.serviceCents)} /> : null}
            {(quote.lines ?? []).some((item) => item.kind === "freight" && !(item.rateBps && item.rateBps > 0)) ? <Sum label="Total fret" value={money(math.freightCents)} /> : null}
            {math.includedFreightCents ? <Sum label="Fret imputé, non ajouté" value={money(math.includedFreightCents)} /> : null}
            {math.feeCents ? <Sum label="Frais" value={money(math.feeCents)} /> : null}
            {math.goodsCommissionCents ? <Sum label={`Commission marchandise (${percent(quote.goodsBps)} %)`} value={money(math.goodsCommissionCents)} /> : null}
            {math.freightCommissionCents || quote.freightBps > 0 ? <Sum label={`Commission fret (${percent(quote.freightBps)} %)`} value={money(math.freightCommissionCents)} /> : null}
            {quote.freightBps > 0 && !math.freightCents && !math.includedFreightCents ? <li className="text-xs text-muted">Ajoutez une ligne fret pour que ces {percent(quote.freightBps)} % apparaissent sur le devis.</li> : null}
            {math.discountCents ? <Sum label="Remise exceptionnelle" value={money(-math.discountCents)} /> : null}
            <Sum label="Total du devis" value={money(math.totalCents)} strong />
            {isYuan(quote.currency) ? (
              <>
                <Sum label="À verser en euros" value={formatMoney(eurCentsFromCny(math.totalCents, fx.cnyPerEur), "EUR")} strong />
                {math.depositCents ? <Sum label="Acompte à verser en euros" value={formatMoney(eurCentsFromCny(math.depositCents, fx.cnyPerEur), "EUR")} /> : null}
                <Sum label="Solde à verser en euros" value={formatMoney(eurCentsFromCny(math.balanceCents, fx.cnyPerEur), "EUR")} />
                <li className="text-xs text-muted">1 € = {formatRate(fx.cnyPerEur)} CNY · {fx.source === "ecb" ? "BCE" : fx.source === "label" ? "repli" : "indicatif"}{rateWhen(fx.fetchedAt) ? ` · en direct ${rateWhen(fx.fetchedAt)}` : ""}.</li>
              </>
            ) : (
              <Sum label="Équivalent en yuans" value={formatMoney(cnyCentsFromEur(math.totalCents, fx.cnyPerEur), "CNY")} />
            )}
            <Sum label={`Acompte à la commande (${percent(quote.depositBps)} %)`} value={money(math.depositCents)} />
            <Sum label="Solde avant expédition" value={money(math.balanceCents)} />
          </ul>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-quiet" type="button" onClick={() => setStep(1)}>Retour</button>
            <button className="btn btn-primary" type="button" onClick={() => go(3)}>Suivant</button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="display text-lg">Aperçu du document</h2>
              <div className="flex gap-2">
                <button type="button" className={`btn ${quote.lang !== "en" ? "btn-primary" : "btn-quiet"}`} onClick={() => patch({ lang: "fr" })}>Version française</button>
                <button type="button" className={`btn ${quote.lang === "en" ? "btn-primary" : "btn-quiet"}`} onClick={() => patch({ lang: "en" })}>Version anglaise</button>
              </div>
            </div>
            <div className="overflow-hidden rounded-[22px] border border-line bg-[#eef2f8] p-3 sm:p-4">
              <PaperView doc={draft} onFont={(font) => patch({ font })} />
            </div>
          </section>
          <aside className="card">
            {sent ? (
              <>
                <h2 className="display text-lg">Actions</h2>
                <button className="btn btn-primary mt-3 w-full" type="button" onClick={() => setStep(2)}>Modifier les lignes</button>
                {account?.role === "admin" && quote.status !== "Devis signé" && quote.status !== "Devis refusé" ? (
                  <button
                    className="btn btn-primary mt-3 w-full"
                    type="button"
                    onClick={() => {
                      setError("");
                      void opsMarkQuoteSigned({ data: quote.id })
                        .then(() => {
                          setQuote((value) => value ? {
                            ...value,
                            status: "Devis signé",
                            signerName: account?.name || "Administration",
                            signedAt: new Date().toISOString(),
                            signMeta: JSON.stringify({ name: account?.name || "Administration", role: "Administration", manual: true }),
                          } : value);
                          setInfo("Devis marqué signé. Aucun email n’a été envoyé. Tu peux créer l’acompte ci-dessous.");
                        })
                        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Marquage impossible."));
                    }}
                  >
                    Marquer comme signé
                  </button>
                ) : null}
                {account?.role === "admin" ? <BillActions quote={quote} invoices={bills ?? []} onError={setError} error={error} signed={quote.status === "Devis signé"} /> : null}
                <QuoteTrail id={quote.id} />
                <Linked quote={quote} invoices={bills ?? []} quotes={allQuotes ?? []} />
                <details className="mt-3 rounded-2xl border border-line p-3">
                  <summary className="cursor-pointer text-sm font-semibold">Client, gabarit et message</summary>
                  {mailFields}
                </details>
              </>
            ) : (
              <>
                <h2 className="display text-lg">Client</h2>
                {mailFields}
                <Linked quote={quote} invoices={bills ?? []} quotes={allQuotes ?? []} />
                <button className="btn btn-quiet mt-2 w-full" type="button" onClick={() => setStep(2)}>Modifier les lignes</button>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </Shell>
  );
}

function quoteDeposits(quote: OpsQuote, invoices: OpsInvoice[]) {
  return invoices.filter((invoice) => {
    if (invoice.kind !== "deposit" || invoice.status === "Annulée") return false;
    if (quote.orderRef && invoice.orderRef === quote.orderRef) return true;
    return invoice.lines.some((line) => `${line.title} ${line.details}`.includes(quote.number));
  });
}

function BillActions({ quote, invoices, onError, error, signed }: { quote: OpsQuote; invoices: OpsInvoice[]; onError: (message: string) => void; error: string; signed: boolean }) {
  const navigate = useNavigate();
  const deposits = quoteDeposits(quote, invoices);
  const modes = deposits.length ? (["deposit", "full", "balance"] as const) : (["deposit", "full"] as const);
  return (
    <div className="mt-3 grid gap-2">
      {modes.map((mode) => (
        <button
          key={mode}
          className="btn btn-quiet w-full"
          type="button"
          onClick={() => {
            onError("");
            void opsQuoteBill({ data: { id: quote.id, mode } })
              .then((invoiceId) => navigate({ to: "/factures/fiche/$id", params: { id: invoiceId } }))
              .catch((err: unknown) => onError(err instanceof Error ? err.message : "Facture impossible."));
          }}
        >
          {mode === "deposit" ? "Créer la facture d’acompte" : mode === "balance" ? "Créer la facture de solde" : "Créer la facture intégrale"}
        </button>
      ))}
      {deposits.length === 0 ? <p className="text-xs leading-relaxed text-muted">La facture intégrale reprend tout le devis. La facture de solde n’apparaît qu’après une facture d’acompte.</p> : null}
      {signed ? null : <p className="text-xs leading-relaxed text-muted">Ces factures se créent une fois le devis signé. La création n’envoie pas d’email.</p>}
      {error ? <p className="text-sm text-[#8a1c1c]">{error}</p> : null}
      {signed ? <p className="text-xs leading-relaxed text-muted">La facture est créée ici. Aucun email n’est envoyé au client.</p> : null}
    </div>
  );
}

function QuoteTrail({ id }: { id: string }) {
  const { data } = useOps(() => opsQuoteActivity({ data: id }), `quote-activity-${id}`);
  const rows = data ?? [];
  return (
    <div className="mt-3 grid gap-2 rounded-2xl bg-canvas p-3">
      <p className="font-semibold">Parcours du client</p>
      {rows.length === 0 ? <p className="text-sm text-muted">Aucune ouverture, téléchargement ou signature enregistré pour ce devis.</p> : null}
      <ul className="grid gap-2">
        {rows.map((row) => (
          <li key={row.id} className="text-sm">
            <span className="block text-[11px] font-semibold tracking-wide text-muted uppercase">{row.atLabel}</span>
            <span>{row.action}</span>
            {row.actor ? <span className="text-muted"> · {row.actor}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function kindName(kind: QuoteLine["kind"]) {
  if (kind === "goods") return "Marchandise";
  if (kind === "freight") return "Fret";
  if (kind === "fee") return "Frais";
  if (kind === "discount") return "Remise";
  return "Prestation";
}

function uniqueClients(rows: OpsClient[]) {
  const byEmail = new Map<string, OpsClient>();
  for (const client of rows) {
    const email = client.email.trim().toLowerCase();
    if (!email.includes("@")) continue;
    if (!byEmail.has(email)) byEmail.set(email, { ...client, email });
  }
  return [...byEmail.values()].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name, "fr"));
}

function quoteGaps(quote: OpsQuote, roster: OpsClient[]) {
  const account = roster.find((client) => client.id === quote.clientUserId);
  return [
    !account ? "un client enregistré et actif" : "",
    !quote.clientName.trim() ? "le nom du client" : "",
    !(account?.email.includes("@") && quote.clientEmail.includes("@")) ? "l’email du client" : "",
    !(quote.lines ?? []).some((line) => line.title.trim()) ? "au moins une ligne" : "",
    !(quote.emailSubject || "").trim() ? "l’objet de l’email" : "",
    !(quote.emailBody || "").trim() ? "le message envoyé au client" : "",
  ].filter(Boolean);
}

function pieceKind(kind: string) {
  if (kind === "credit") return "Avoir";
  if (kind === "deposit") return "Facture d’acompte";
  if (kind === "balance") return "Facture de solde";
  return "Facture";
}

function Linked({ quote, invoices, quotes }: { quote: OpsQuote; invoices: OpsInvoice[]; quotes: OpsQuote[] }) {
  const sameOrder = (ref: string) => Boolean(quote.orderRef && ref && ref === quote.orderRef);
  const otherQuotes = quotes.filter(
    (item) => item.id !== quote.id && (sameOrder(item.orderRef) || (!quote.orderRef && quote.clientUserId && item.clientUserId === quote.clientUserId)),
  );
  const related = invoices.filter((invoice) => {
    if (sameOrder(invoice.orderRef)) return true;
    if (quote.number && invoice.method.includes(quote.number)) return true;
    if (!quote.orderRef && quote.clientUserId && invoice.clientUserId === quote.clientUserId) return true;
    return false;
  });
  const bills = related.filter((invoice) => invoice.kind !== "credit");
  const credits = related.filter((invoice) => invoice.kind === "credit");
  return (
    <div className="mt-4 rounded-2xl border border-line bg-canvas p-3">
      <p className="text-sm font-semibold">Pièces liées</p>
      <ul className="mt-2 grid gap-1 text-sm">
        <li className="flex items-center justify-between gap-2"><span>Devis · {quote.status}</span><b className="mono">{quote.number}</b></li>
        {otherQuotes.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-2">
            <span>Devis</span>
            <Link className="mono font-semibold text-brand" to="/devis/nouveau" search={{ id: item.id }}>{item.number}</Link>
          </li>
        ))}
        {bills.length === 0 ? <li className="text-muted">Aucune facture liée.</li> : null}
        {bills.map((invoice) => (
          <li key={invoice.id} className="flex items-center justify-between gap-2">
            <span>{pieceKind(invoice.kind)} · {invoice.status}</span>
            <Link className="mono font-semibold text-brand" to="/factures/fiche/$id" params={{ id: invoice.id }}>{invoice.number}</Link>
          </li>
        ))}
        {credits.length === 0 ? <li className="text-muted">Aucun avoir lié.</li> : null}
        {credits.map((invoice) => (
          <li key={invoice.id} className="flex items-center justify-between gap-2">
            <span>Avoir · {invoice.status}</span>
            <Link className="mono font-semibold text-brand" to="/avoirs/$id" params={{ id: invoice.id }}>{invoice.number}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input className="field mt-1 font-normal" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Percent({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block min-w-[180px] flex-1 text-sm font-semibold">
      {label}
      <div className="mt-1 flex">
        <DecimalField className="field rounded-r-none font-normal" value={value} onChange={onChange} />
        <span className="inline-flex items-center rounded-r-xl border border-l-0 border-line bg-canvas px-3 text-sm font-normal text-muted">%</span>
      </div>
    </label>
  );
}

function Sum({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <li className={`flex justify-between gap-4 ${strong ? "border-t border-line pt-2 font-semibold" : ""}`}>
      <span>{label}</span>
      <b className="mono">{value}</b>
    </li>
  );
}
