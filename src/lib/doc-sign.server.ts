import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { deliverMail, mailError } from "@/lib/mail.server";
import { readDocumentFile, writeTextDocument } from "@/lib/ops.server";

function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

function maskEmail(email: string) {
  const [name, domain] = String(email ?? "").split("@");
  if (!domain) return "";
  return `${name.slice(0, 1)}•••@${domain}`;
}

async function codeKit() {
  const { createHash, randomBytes, randomInt, timingSafeEqual } = await import("node:crypto");
  return { createHash, randomBytes, randomInt, timingSafeEqual };
}

function hashCode(createHash: typeof import("node:crypto").createHash, token: string, code: string) {
  return createHash("sha256").update(`sp-doc:${token}:${code}`).digest("hex");
}

export async function ensureDocSigns() {
  const sql = await getSql();
  await sql`create table if not exists ops_doc_signs (
    document_id text primary key,
    token text not null unique,
    email text not null,
    status text not null default 'sent',
    otp_hash text not null default '',
    otp_expires timestamptz,
    signer_name text not null default '',
    signer_role text not null default '',
    signer_company text not null default '',
    signature text not null default '',
    signed_at timestamptz,
    ip text not null default '',
    ua text not null default '',
    sent_at timestamptz not null default now()
  )`;
  await sql`create table if not exists ops_contracts (
    document_id text primary key,
    body text not null
  )`;
}

async function journal(action: string, actor: string, ref: string) {
  const sql = await getSql();
  const at = new Date().toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  await sql`insert into ops_journal (id, at_label, actor, action, object_ref) values (${uid("jr")}, ${at}, ${actor}, ${action}, ${ref})`;
}

export async function sendDocumentToSign(input: { documentId: string; email: string; message: string; actor: string }) {
  await ensureDocSigns();
  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Indiquez l’email du signataire.");
  const message = input.message.trim().slice(0, 2000);
  if (message.length < 2) throw new Error("Écrivez le message qui accompagne le document.");
  const sql = await getSql();
  const docs = await sql<{ id: string; title: string; client_name: string; byte_size: number }>`
    select id, title, client_name, byte_size from ops_documents where id = ${input.documentId}`;
  const doc = docs[0];
  if (!doc) throw new Error("Document introuvable.");
  const contract = doc.byte_size === 0
    ? await sql<{ body: string }>`select body from ops_contracts where document_id = ${doc.id}`
    : [];
  if (!Number(doc.byte_size) && !contract[0]?.body) throw new Error("Ce document n’a pas de fichier à signer.");
  const current = await sql<{ token: string; status: string }>`select token, status from ops_doc_signs where document_id = ${doc.id}`;
  if (current[0]?.status === "signed") throw new Error("Ce document est déjà signé.");
  const { randomBytes } = await codeKit();
  const token = current[0]?.token || randomBytes(18).toString("hex");
  if (current[0]) {
    await sql`update ops_doc_signs set email = ${email}, token = ${token}, status = 'sent', sent_at = now(), otp_hash = '', otp_expires = null where document_id = ${doc.id}`;
  } else {
    await sql`insert into ops_doc_signs (document_id, token, email, status) values (${doc.id}, ${token}, ${email}, ${"sent"})`;
  }
  const link = `https://sourcingpick.com/signer/${token}`;
  const text = `${message}\n\nDocument : ${doc.title}${doc.client_name ? ` · ${doc.client_name}` : ""}.`;
  const sent = await deliverMail(email, `Document à signer — ${doc.title}`, text, {
    badge: "SIGNATURE",
    title: doc.title,
    ctaLabel: "Lire et signer",
    ctaHref: link,
    note: "Le lien s’ouvre avec votre email, puis un code. Le fichier n’est pas dans ce message.",
  });
  await journal(sent ? "Document envoyé pour signature" : "Échec d’envoi pour signature", input.actor, doc.title);
  if (!sent) throw new Error(mailError() || "L’email n’est pas parti.");
  return { ok: true as const, email };
}

const CONTRACT_TEMPLATE = `CONTRAT DE PRESTATION

Entre SourcingPick (Hangzhou Qiyuan Ying Technology Information Co., Ltd.) et le client nommé sur ce document.

1. Objet
SourcingPick réceptionne, contrôle, consolide et expédie les marchandises convenues. Le client reste l’acheteur auprès du fournisseur et l’importateur des marchandises.

2. Prix
Le prix, l’acompte et le solde sont ceux du devis accepté ou des factures liées. Les sommes versées sont affectées à la commande. Elles ne constituent pas un séquestre.

3. Exécution
Les photos d’étape sont versées au dossier. Un écart de quantité, de référence ou d’état est signalé avant consolidation. Les délais de port et de douane ne sont pas garantis.

4. Signature
La signature électronique identifie le signataire : nom, fonction, société, email vérifié par code, date et adresse IP. Elle vaut acceptation de ce contrat et des conditions générales publiées sur sourcingpick.com.`;

export function contractTemplate() {
  return CONTRACT_TEMPLATE;
}

export async function readContract(id: string) {
  await ensureDocSigns();
  const sql = await getSql();
  const docs = await sql<{ id: string; title: string; client_name: string; sign_status: string; sign_email: string; signer_name: string }>`
    select d.id, d.title, d.client_name, coalesce(s.status, '') as sign_status, coalesce(s.email, '') as sign_email, coalesce(s.signer_name, '') as signer_name
    from ops_documents d
    left join ops_doc_signs s on s.document_id = d.id
    where d.id = ${id} and d.category = ${"Contrats"}`;
  const doc = docs[0];
  if (!doc) throw new Error("Contrat introuvable.");
  const stored = await sql<{ body: string }>`select body from ops_contracts where document_id = ${id}`;
  let body = stored[0]?.body || "";
  if (!body) {
    try {
      const file = await readDocumentFile(id);
      body = Buffer.from(file.data, "base64").toString("utf8");
    } catch {
      body = "";
    }
  }
  return {
    id: doc.id,
    title: doc.title,
    clientName: doc.client_name,
    body,
    signStatus: doc.sign_status,
    signEmail: doc.sign_email,
    signerName: doc.signer_name,
  };
}

export async function saveContract(input: { id: string; clientName: string; title: string; body: string; actor: string }) {
  await ensureDocSigns();
  const title = input.title.trim().slice(0, 180);
  const clientName = input.clientName.trim().slice(0, 160);
  const body = input.body.trim();
  if (title.length < 2) throw new Error("Nommez le contrat.");
  if (clientName.length < 2) throw new Error("Choisissez le client.");
  if (body.length < 20) throw new Error("Le contrat est trop court.");
  const sql = await getSql();
  let id = input.id.trim();
  if (id) {
    const signed = await sql<{ status: string }>`select status from ops_doc_signs where document_id = ${id}`;
    if (signed[0]?.status === "signed") throw new Error("Ce contrat est signé. Il n’est plus modifiable.");
    const size = await writeTextDocument(id, body);
    await sql`update ops_documents set client_name = ${clientName}, title = ${title}, file_name = ${`${title}.txt`}, mime = ${"text/plain"}, byte_size = ${size}, category = ${"Contrats"} where id = ${id}`;
  } else {
    id = uid("doc");
    const size = await writeTextDocument(id, body);
    const issued = new Date().toISOString().slice(0, 10);
    await sql`insert into ops_documents (id, client_name, category, title, order_ref, issued_on, file_name, mime, byte_size)
      values (${id}, ${clientName}, ${"Contrats"}, ${title}, ${""}, ${issued}, ${`${title}.txt`}, ${"text/plain"}, ${size})`;
  }
  await sql`insert into ops_contracts (document_id, body) values (${id}, ${body})
    on conflict (document_id) do update set body = ${body}`;
  await journal(input.id ? "Contrat modifié" : "Contrat créé", input.actor, title);
  return { id };
}

async function rowByToken(token: string) {
  await ensureDocSigns();
  const sql = await getSql();
  const rows = await sql<{
    document_id: string;
    token: string;
    email: string;
    status: string;
    otp_hash: string;
    otp_expires: string | null;
    signer_name: string;
    signer_role: string;
    signer_company: string;
    signed_at: string | null;
    ip: string;
    title: string;
    client_name: string;
    file_name: string;
    mime: string;
  }>`select s.document_id, s.token, s.email, s.status, s.otp_hash, s.otp_expires, s.signer_name, s.signer_role, s.signer_company, s.signed_at, s.ip,
      d.title, d.client_name, d.file_name, d.mime
    from ops_doc_signs s join ops_documents d on d.id = s.document_id
    where s.token = ${token}`;
  return rows[0];
}

function sameMail(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export async function requestDocumentCode(token: string, email: string) {
  const row = await rowByToken(token);
  if (!row) throw new Error("Lien invalide.");
  if (!sameMail(email, row.email)) throw new Error("Cet email ne correspond pas au destinataire.");
  if (row.status === "signed") {
    return { ok: true as const, already: true as const, emailMasked: maskEmail(row.email) };
  }
  const { createHash, randomInt } = await codeKit();
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const sql = await getSql();
  await sql`update ops_doc_signs set otp_hash = ${hashCode(createHash, row.token, code)}, otp_expires = now() + interval '30 minutes' where document_id = ${row.document_id}`;
  const sent = await deliverMail(row.email, `Code pour signer ${row.title}`, `Voici le code pour signer « ${row.title} ». Il est valable 30 minutes.`, {
    badge: "CODE DE SIGNATURE",
    title: "Confirmez que c’est bien vous",
    code,
    note: "Si vous n’êtes pas en train de signer ce document, ignorez ce message.",
  });
  if (!sent) throw new Error(mailError() || "Le code n’a pas pu être envoyé.");
  return { ok: true as const, already: false as const, emailMasked: maskEmail(row.email) };
}

export async function openDocumentToSign(token: string, email: string, code: string) {
  const row = await rowByToken(token);
  if (!row) throw new Error("Lien invalide.");
  if (!sameMail(email, row.email)) throw new Error("Cet email ne correspond pas au destinataire.");
  if (row.status !== "signed") {
    if (!row.otp_hash || !row.otp_expires || new Date(row.otp_expires).getTime() < Date.now()) throw new Error("Le code a expiré. Demandez-en un nouveau.");
    const { createHash, timingSafeEqual } = await codeKit();
    const expected = Buffer.from(row.otp_hash);
    const actual = Buffer.from(hashCode(createHash, row.token, code));
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Code incorrect.");
    const sql = await getSql();
    await sql`update ops_doc_signs set otp_expires = now() + interval '30 minutes' where document_id = ${row.document_id}`;
  }
  let file: { fileName: string; mime: string; data: string };
  try {
    file = await readDocumentFile(row.document_id);
  } catch (error) {
    const sql = await getSql();
    const stored = await sql<{ body: string }>`select body from ops_contracts where document_id = ${row.document_id}`;
    if (!stored[0]?.body) throw error;
    file = { fileName: `${row.title}.txt`, mime: "text/plain", data: Buffer.from(stored[0].body, "utf8").toString("base64") };
  }
  const text = file.mime.startsWith("text/") ? Buffer.from(file.data, "base64").toString("utf8") : "";
  return {
    title: row.title,
    clientName: row.client_name,
    fileName: file.fileName,
    mime: file.mime,
    data: text ? "" : file.data,
    text,
    signed: row.status === "signed",
    signerName: row.signer_name,
    signerRole: row.signer_role,
    signerCompany: row.signer_company,
    signedAt: row.signed_at || "",
    ip: row.ip,
  };
}

export async function signDocument(input: { token: string; email: string; code: string; name: string; role: string; company: string; image: string; ip: string }) {
  const row = await rowByToken(input.token);
  if (!row) throw new Error("Lien invalide.");
  if (row.status === "signed") throw new Error("Ce document est déjà signé.");
  if (!sameMail(input.email, row.email)) throw new Error("Cet email ne correspond pas au destinataire.");
  if (!row.otp_hash || !row.otp_expires || new Date(row.otp_expires).getTime() < Date.now()) throw new Error("Le code a expiré. Demandez-en un nouveau.");
  const { createHash, timingSafeEqual } = await codeKit();
  const expected = Buffer.from(row.otp_hash);
  const actual = Buffer.from(hashCode(createHash, row.token, input.code));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Code incorrect.");
  const request = getRequest();
  const ua = String(request?.headers.get("user-agent") || "").slice(0, 240);
  const sql = await getSql();
  await sql`update ops_doc_signs set
    status = 'signed', signer_name = ${input.name}, signer_role = ${input.role}, signer_company = ${input.company},
    signature = ${input.image}, signed_at = now(), ip = ${input.ip.slice(0, 80)}, ua = ${ua}, otp_hash = ''
    where document_id = ${row.document_id}`;
  await journal("Document signé", input.name, row.title);
  await deliverMail(row.email, `Document signé — ${row.title}`, `Votre signature de « ${row.title} » est enregistrée. Le fichier d’origine est conservé avec le nom du signataire, la date et l’adresse IP.`, {
    badge: "DOCUMENT SIGNÉ",
    title: row.title,
  });
  return { ok: true as const };
}
