import { getSql } from "@/lib/db";
import { authStamp } from "@/lib/read-cache";

// `__Host-` prefix: the browser refuses any same-named cookie carrying a
// `Domain` attribute, so a sibling subdomain cannot "toss" a session cookie
// onto this app. Requires Secure + Path=/ + no Domain — both already set on
// every write/delete of this cookie below. Renaming invalidates existing
// sessions once (acceptable for a back-office of a handful of users).
const COOKIE = "__Host-sp_admin";
const MONTH = 60 * 60 * 24 * 30;

export type Role = "admin" | "agent" | "client";

export type SessionUser = { id: string; name: string; email: string; role: Role };

async function cryptoKit() {
  const { scrypt, randomBytes, randomInt, timingSafeEqual, createHash } = await import("node:crypto");
  const { promisify } = await import("node:util");
  return { scrypt: promisify(scrypt), randomBytes, randomInt, timingSafeEqual, createHash };
}

function tokenHash(createHash: typeof import("node:crypto").createHash, token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  const { scrypt, randomBytes } = await cryptoKit();
  const salt = randomBytes(16).toString("hex");
  const buf = (await scrypt(password, salt, 32)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

export async function checkPassword(password: string, stored: string) {
  const { scrypt, timingSafeEqual } = await cryptoKit();
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const buf = (await scrypt(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  if (buf.length !== expected.length) return false;
  return timingSafeEqual(buf, expected);
}

async function cookieJar() {
  return import("@tanstack/react-start/server");
}

function secureCookie() {
  return true;
}

function asRole(value: string): Role {
  if (value === "agent" || value === "client") return value;
  return "admin";
}

async function currentToken() {
  const { getCookie } = await cookieJar();
  const token = getCookie(COOKIE);
  if (!token) return null;
  const { createHash } = await cryptoKit();
  return { token, hash: tokenHash(createHash, token) };
}

export async function readSession(): Promise<{ ready: boolean; user: SessionUser | null }> {
  const current = await currentToken();
  const key = current?.hash ?? "-";
  const stamp = authStamp();
  const hit = sessionMemo.get(key);
  if (hit && hit.stamp === stamp && Date.now() - hit.at < 20_000) return hit.value;
  const value = readSessionFresh(current).catch((error) => {
    const row = sessionMemo.get(key);
    if (row?.value === value) sessionMemo.delete(key);
    throw error;
  });
  sessionMemo.set(key, { at: Date.now(), stamp, value });
  if (sessionMemo.size > 200) sessionMemo.clear();
  return value;
}

const sessionMemo = new Map<string, { at: number; stamp: number; value: Promise<{ ready: boolean; user: SessionUser | null }> }>();

async function readSessionFresh(current: { hash: string } | null): Promise<{ ready: boolean; user: SessionUser | null }> {
  const sql = await getSql();
  const count = await sql<{ n: number }>`select count(*)::int as n from admin_users`;
  const ready = Number(count[0]?.n ?? 0) > 0;
  if (!current) return { ready, user: null };
  const rows = await sql<{ id: string; name: string; email: string; role: string; active: boolean }>`
    select u.id, u.name, u.email, u.role, u.active
    from admin_sessions s
    join admin_users u on u.id = s.user_id
    where s.token_hash = ${current.hash} and s.expires_at > now()`;
  const user = rows[0];
  if (!user || user.active === false) return { ready, user: null };
  return { ready, user: { id: user.id, name: user.name, email: user.email, role: asRole(user.role) } };
}

export async function requireUser() {
  const session = await readSession();
  if (!session.user) throw new Error("Connexion requise.");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Accès réservé à l'administration.");
  return user;
}

export async function openSession(userId: string) {
  const sql = await getSql();
  const { randomBytes, createHash } = await cryptoKit();
  const { setCookie, getRequest } = await cookieJar();
  const token = randomBytes(32).toString("hex");
  const request = getRequest();
  const agent = request?.headers.get("user-agent")?.slice(0, 240) ?? "";
  const forwarded = request?.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim().slice(0, 64) ?? "";
  await sql`insert into admin_sessions (id, token_hash, user_id, expires_at, user_agent, ip)
    values (${crypto.randomUUID()}, ${tokenHash(createHash, token)}, ${userId}, now() + interval '30 days', ${agent}, ${ip})`;
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: MONTH,
  });
}

export async function closeSession() {
  const { deleteCookie } = await cookieJar();
  const current = await currentToken();
  if (current) {
    const sql = await getSql();
    await sql`delete from admin_sessions where token_hash = ${current.hash}`;
  }
  deleteCookie(COOKIE, { path: "/", secure: secureCookie(), sameSite: "lax" });
}

export async function listUsers() {
  await requireAdmin();
  const sql = await getSql();
  return sql<{ id: string; name: string; email: string; role: string; active: boolean; created_at: string }>`
    select id, name, email, role, active, created_at::text as created_at
    from admin_users order by created_at asc`;
}

export async function saveUser(input: {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
}) {
  const actor = await requireAdmin();
  const sql = await getSql();
  const admins = await sql<{ id: string }>`select id from admin_users where role = 'admin' and active = true`;
  const existing = await sql<{ id: string }>`select id from admin_users where id = ${input.id}`;
  if (admins.length === 1 && admins[0]?.id === input.id && (input.role !== "admin" || !input.active)) {
    throw new Error("Il doit rester au moins un administrateur actif.");
  }
  const clash = await sql<{ id: string }>`select id from admin_users where email = ${input.email} and id <> ${input.id}`;
  if (clash[0]) throw new Error("Cet email est déjà utilisé.");
  if (existing[0]) {
    if (input.password) {
      const passwordHash = await hashPassword(input.password);
      await sql`update admin_users set name = ${input.name}, email = ${input.email}, role = ${input.role}, active = ${input.active}, password_hash = ${passwordHash}, email_verified = true where id = ${input.id}`;
      const current = await currentToken();
      if (actor.id === input.id && current) {
        await sql`delete from admin_sessions where user_id = ${input.id} and token_hash <> ${current.hash}`;
      } else {
        await sql`delete from admin_sessions where user_id = ${input.id}`;
      }
    } else {
      await sql`update admin_users set name = ${input.name}, email = ${input.email}, role = ${input.role}, active = ${input.active} where id = ${input.id}`;
      if (!input.active) await sql`delete from admin_sessions where user_id = ${input.id}`;
    }
  } else {
    if (!input.password) throw new Error("Choisissez un mot de passe pour le nouveau compte.");
    const passwordHash = await hashPassword(input.password);
    await sql`insert into admin_users (id, name, email, password_hash, role, active)
      values (${input.id}, ${input.name}, ${input.email}, ${passwordHash}, ${input.role}, ${input.active})`;
  }
  if (actor.id === input.id && !input.active) await closeSession();
}

export async function listSessions() {
  const actor = await requireUser();
  const sql = await getSql();
  const current = await currentToken();
  const rows = await sql<{
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    expires_at: string;
    user_agent: string;
    ip: string;
    token_hash: string;
  }>`select s.id, u.name, u.email, u.role, s.created_at::text as created_at, s.expires_at::text as expires_at,
      s.user_agent, s.ip, s.token_hash
    from admin_sessions s
    join admin_users u on u.id = s.user_id
    where s.expires_at > now() and (${actor.role} = 'admin' or s.user_id = ${actor.id})
    order by s.created_at desc`;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: asRole(row.role),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    agent: row.user_agent,
    ip: row.ip,
    current: current?.hash === row.token_hash,
  }));
}

export async function revokeSession(id: string) {
  const actor = await requireUser();
  const sql = await getSql();
  const rows = await sql<{ token_hash: string; user_id: string }>`
    select token_hash, user_id from admin_sessions where id = ${id}`;
  const row = rows[0];
  if (!row) return { current: false };
  if (actor.role !== "admin" && row.user_id !== actor.id) throw new Error("Accès refusé.");
  await sql`delete from admin_sessions where id = ${id}`;
  const current = await currentToken();
  if (current?.hash === row.token_hash) {
    const { deleteCookie } = await cookieJar();
    deleteCookie(COOKIE, { path: "/", secure: secureCookie(), sameSite: "lax" });
    return { current: true };
  }
  return { current: false };
}

const PENDING = "sp_verify";
const QUARTER = 60 * 15;

function codeHash(createHash: typeof import("node:crypto").createHash, code: string) {
  return createHash("sha256").update(`sp-code:${code}`).digest("hex");
}

async function issueCode(userId: string) {
  const sql = await getSql();
  const { randomBytes, randomInt, createHash } = await cryptoKit();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const token = randomBytes(24).toString("hex");
  await sql`update admin_users set
      verify_code_hash = ${codeHash(createHash, code)},
      verify_token_hash = ${tokenHash(createHash, token)},
      verify_expires = now() + interval '15 minutes'
    where id = ${userId}`;
  const { setCookie } = await cookieJar();
  setCookie(PENDING, token, {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: QUARTER,
  });
  return code;
}

export async function registerClient(input: {
  name: string;
  email: string;
  password: string;
  kind: "pro" | "particulier";
  company: string;
  vat: string;
  country: string;
  phone: string;
}) {
  const sql = await getSql();
  const taken = await sql<{ id: string }>`select id from admin_users where email = ${input.email}`;
  if (taken[0]) throw new Error("Cet email est déjà utilisé. Connectez-vous.");
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(input.password);
  await sql`insert into admin_users
      (id, name, email, password_hash, role, active, kind, company, vat, country, phone, email_verified)
    values (${id}, ${input.name}, ${input.email}, ${passwordHash}, 'client', true,
      ${input.kind}, ${input.company}, ${input.vat}, ${input.country}, ${input.phone}, false)`;
  const code = await issueCode(id);
  return { email: input.email, code };
}

async function pendingUser() {
  const { getCookie } = await cookieJar();
  const token = getCookie(PENDING);
  if (!token) return null;
  const sql = await getSql();
  const { createHash } = await cryptoKit();
  const rows = await sql<{ id: string; email: string; verify_code_hash: string; verify_expires: string | null }>`
    select id, email, verify_code_hash, verify_expires::text as verify_expires
    from admin_users
    where verify_token_hash = ${tokenHash(createHash, token)} and email_verified = false`;
  return rows[0] ?? null;
}

export async function resendCode() {
  const user = await pendingUser();
  if (!user) throw new Error("Recommencez l'inscription pour recevoir un code.");
  const code = await issueCode(user.id);
  return { email: user.email, code };
}

export async function confirmCode(code: string) {
  const user = await pendingUser();
  if (!user) throw new Error("Ce code a expiré. Renvoyez-en un.");
  if (user.verify_expires && new Date(user.verify_expires).getTime() < Date.now()) {
    throw new Error("Ce code a expiré. Renvoyez-en un.");
  }
  const { createHash, timingSafeEqual } = await cryptoKit();
  const expected = Buffer.from(user.verify_code_hash);
  const actual = Buffer.from(codeHash(createHash, code));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("Code incorrect.");
  }
  const sql = await getSql();
  await sql`update admin_users set email_verified = true, verify_code_hash = '', verify_token_hash = '', verify_expires = null where id = ${user.id}`;
  const { deleteCookie } = await cookieJar();
  deleteCookie(PENDING, { path: "/", secure: secureCookie(), sameSite: "lax" });
  await openSession(user.id);
  return { role: "client" as const };
}

export async function requestPasswordReset(email: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string; name: string; active: boolean }>`
    select id, name, active from admin_users where email = ${email}`;
  const user = rows[0];
  if (!user || user.active === false) return { ok: true as const };
  const { randomInt, createHash } = await cryptoKit();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const hash = createHash("sha256").update(`sp-reset:${user.id}:${code}`).digest("hex");
  await sql`update admin_users set reset_code_hash = ${hash}, reset_expires = now() + interval '15 minutes' where id = ${user.id}`;
  const { deliverMail, mailError } = await import("@/lib/mail.server");
  const sent = await deliverMail(
    email,
    "Code pour changer votre mot de passe",
    [
      `Bonjour${user.name ? ` ${user.name}` : ""},`,
      "",
      "Utilisez ce code pour choisir un nouveau mot de passe sur SourcingPick.",
      "Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.",
    ].join("\n"),
    {
      badge: "MOT DE PASSE",
      title: "Votre code de réinitialisation",
      code,
      note: "Ce code expire dans 15 minutes. Ne le communiquez à personne.",
    },
  );
  if (!sent) throw new Error(mailError() || "Le code n’a pas pu être envoyé.");
  return { ok: true as const };
}

export async function confirmPasswordReset(email: string, code: string, password: string) {
  const sql = await getSql();
  const rows = await sql<{ id: string; reset_code_hash: string; reset_expires: string | null }>`
    select id, reset_code_hash, reset_expires::text as reset_expires from admin_users where email = ${email}`;
  const user = rows[0];
  if (!user?.reset_code_hash || !user.reset_expires || new Date(user.reset_expires).getTime() < Date.now()) {
    throw new Error("Code expiré. Demandez un nouvel envoi.");
  }
  const { createHash, timingSafeEqual } = await cryptoKit();
  const actual = Buffer.from(createHash("sha256").update(`sp-reset:${user.id}:${code}`).digest("hex"));
  const expected = Buffer.from(user.reset_code_hash);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error("Code incorrect.");
  const passwordHash = await hashPassword(password);
  await sql`update admin_users set password_hash = ${passwordHash}, reset_code_hash = '', reset_expires = null, email_verified = true where id = ${user.id}`;
  await sql`delete from admin_sessions where user_id = ${user.id}`;
  return { ok: true as const };
}


