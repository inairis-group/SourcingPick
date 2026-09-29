import { createServerFn } from "@tanstack/react-start";

type Credentials = { name: string; email: string; password: string };

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

function emailOf(value: unknown) {
  const email = clean(value, 160).toLowerCase();
  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    throw new Error("Indiquez un email valide.");
  }
  return email;
}

function passwordOf(value: unknown) {
  const password = String(value ?? "");
  if (password.length < 8) throw new Error("Le mot de passe doit faire au moins 8 caractères.");
  if (password.length > 200) throw new Error("Mot de passe trop long.");
  return password;
}

export const adminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  const { readSession } = await import("@/lib/admin-auth.server");
  return readSession();
});

export const adminOnboard = createServerFn({ method: "POST" })
  .inputValidator((input: Credentials) => ({
    name: (() => {
      const name = clean(input?.name, 80);
      if (name.length < 2) throw new Error("Indiquez votre nom.");
      return name;
    })(),
    email: emailOf(input?.email),
    password: passwordOf(input?.password),
  }))
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { getSql } = await import("@/lib/db");
    const { hashPassword, openSession, readSession } = await import("@/lib/admin-auth.server");
    const current = await readSession();
    if (current.ready) throw new Error("Un compte existe déjà. Connectez-vous.");
    const sql = await getSql();
    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(data.password);
    await sql`insert into admin_users (id, name, email, password_hash, role, active)
      values (${id}, ${data.name}, ${data.email}, ${passwordHash}, 'admin', true)`;
    await openSession(id);
    return { ok: true as const };
  });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string }) => ({
    email: emailOf(input?.email),
    password: passwordOf(input?.password),
  }))
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { clientAddress, rateLimit } = await import("@/lib/guard.server");
    const ip = clientAddress();
    rateLimit(`login:${ip}`, 20, 10 * 60 * 1000);
    rateLimit(`login:${ip}:${data.email}`, 8, 10 * 60 * 1000);
    const { getSql } = await import("@/lib/db");
    const { checkPassword, openSession } = await import("@/lib/admin-auth.server");
    const { ensureOps } = await import("@/lib/ops.server");
    await ensureOps();
    const sql = await getSql();
    const rows = await sql<{ id: string; password_hash: string; active: boolean; role: string; email_verified: boolean }>`
      select id, password_hash, active, role, email_verified from admin_users where email = ${data.email}`;
    const user = rows[0];
    if (!user || !(await checkPassword(data.password, user.password_hash))) {
      throw new Error("Email ou mot de passe incorrect.");
    }
    if (user.active === false) throw new Error("Ce compte est désactivé.");
    if (user.email_verified === false) throw new Error("Confirmez d'abord votre email.");
    await openSession(user.id);
    const role = user.role === "agent" || user.role === "client" ? user.role : "admin";
    return { ok: true as const, role };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  const { closeSession } = await import("@/lib/admin-auth.server");
  await closeSession();
  return { ok: true as const };
});

export type Role = "admin" | "agent" | "client";

export const listAccounts = createServerFn({ method: "GET" }).handler(async () => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  const { listUsers } = await import("@/lib/admin-auth.server");
  const rows = await listUsers();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: (row.role === "agent" || row.role === "client" ? row.role : "admin") as Role,
    active: row.active !== false,
    createdAt: row.created_at,
  }));
});

export const saveAccount = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; name: string; email: string; password?: string; role: Role; active: boolean }) => {
    const role: Role = input?.role === "agent" || input?.role === "client" ? input.role : "admin";
    const name = clean(input?.name, 80);
    if (name.length < 2) throw new Error("Indiquez un nom.");
    return {
      id: clean(input?.id, 80) || crypto.randomUUID(),
      name,
      email: emailOf(input?.email),
      password: input?.password ? passwordOf(input.password) : "",
      role,
      active: input?.active !== false,
    };
  })
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { saveUser } = await import("@/lib/admin-auth.server");
    await saveUser(data);
    return { ok: true as const };
  });

export const listActiveSessions = createServerFn({ method: "GET" }).handler(async () => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  const { listSessions } = await import("@/lib/admin-auth.server");
  return listSessions();
});

export const revokeActiveSession = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => {
    const id = clean(input?.id, 80);
    if (!id) throw new Error("Session inconnue.");
    return { id };
  })
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { revokeSession } = await import("@/lib/admin-auth.server");
    return revokeSession(data.id);
  });

export const registerClient = createServerFn({ method: "POST" })
  .inputValidator((input: {
    name: string;
    email: string;
    password: string;
    kind?: string;
    company?: string;
    vat?: string;
    country?: string;
    phone?: string;
    accepted?: boolean;
  }) => {
    if (!input?.accepted) throw new Error("Acceptez les conditions pour créer le compte.");
    const password = passwordOf(input?.password);
    if (!/\d/.test(password)) throw new Error("Le mot de passe doit contenir un chiffre.");
    const kind = input?.kind === "particulier" ? "particulier" : "pro";
    const company = clean(input?.company, 160);
    if (kind === "pro" && company.length < 2) throw new Error("Indiquez l'entreprise.");
    return {
      name: (() => {
        const name = clean(input?.name, 80);
        if (name.length < 2) throw new Error("Indiquez votre nom.");
        return name;
      })(),
      email: emailOf(input?.email),
      password,
      kind: kind as "pro" | "particulier",
      company,
      vat: clean(input?.vat, 40),
      country: clean(input?.country, 80),
      phone: (() => {
        const phone = clean(input?.phone, 40);
        const digits = phone.replace(/\D/g, "");
        if (digits.length < 8 || digits.length > 15) throw new Error("Indiquez un numéro de téléphone valide.");
        return phone;
      })(),
    };
  })
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { clientAddress, rateLimit } = await import("@/lib/guard.server");
    rateLimit(`signup:${clientAddress()}`, 6, 60 * 60 * 1000);
    const { registerClient: create } = await import("@/lib/admin-auth.server");
    return create(data);
  });

export const resendVerification = createServerFn({ method: "POST" }).handler(async () => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  const { resendCode } = await import("@/lib/admin-auth.server");
  return resendCode();
});

export const confirmVerification = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string }) => {
    const code = String(input?.code ?? "").replace(/\D/g, "");
    if (code.length !== 6) throw new Error("Saisissez les six chiffres.");
    return { code };
  })
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { clientAddress, rateLimit } = await import("@/lib/guard.server");
    rateLimit(`verify:${clientAddress()}`, 8, 10 * 60 * 1000);
    const { confirmCode } = await import("@/lib/admin-auth.server");
    return confirmCode(data.code);
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string }) => ({ email: emailOf(input?.email) }))
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { clientAddress, rateLimit } = await import("@/lib/guard.server");
    const ip = clientAddress();
    rateLimit(`reset:${ip}`, 8, 15 * 60 * 1000);
    rateLimit(`reset:${data.email}`, 4, 15 * 60 * 1000);
    const { ensureOps } = await import("@/lib/ops.server");
    await ensureOps();
    const { requestPasswordReset: send } = await import("@/lib/admin-auth.server");
    return send(data.email);
  });

export const confirmPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; code: string; password: string }) => {
    const password = passwordOf(input?.password);
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      throw new Error("Le mot de passe doit contenir une lettre et un chiffre.");
    }
    const code = String(input?.code ?? "").replace(/\D/g, "");
    if (code.length !== 6) throw new Error("Saisissez les six chiffres.");
    return { email: emailOf(input?.email), code, password };
  })
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { clientAddress, rateLimit } = await import("@/lib/guard.server");
    rateLimit(`reset-try:${clientAddress()}:${data.email}`, 8, 15 * 60 * 1000);
    const { confirmPasswordReset: apply } = await import("@/lib/admin-auth.server");
    return apply(data.email, data.code, data.password);
  });


