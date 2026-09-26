import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export type LeadInput = {
  kind: "devis" | "contact";
  name: string;
  email: string;
  subject: string;
  body: string;
  payload: Record<string, string>;
};

export type LeadRow = {
  id: string;
  kind: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  created_at: string;
};

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: LeadInput) => {
    const name = clean(input?.name, 120);
    const email = clean(input?.email, 160);
    const subject = clean(input?.subject, 180);
    const body = clean(input?.body, 8000);
    const kind = input?.kind === "contact" ? "contact" : "devis";
    if (name.length < 2) throw new Error("Indiquez votre nom.");
    if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
      throw new Error("Indiquez un email valide.");
    }
    if (body.length < 4) throw new Error("Le message est trop court.");
    const payload: Record<string, string> = {};
    for (const [key, value] of Object.entries(input?.payload ?? {})) {
      payload[clean(key, 40)] = clean(value, 2000);
    }
    return { kind, name, email, subject: subject || "Demande", body, payload } satisfies LeadInput;
  })
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`insert into leads (id, kind, name, email, subject, body, payload)
      values (${id}, ${data.kind}, ${data.name}, ${data.email}, ${data.subject}, ${data.body}, ${JSON.stringify(data.payload)}::jsonb)`;
    return { id };
  });

export const listLeads = createServerFn({ method: "GET" }).handler(async () => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  const sql = await getSql();
  const rows = await sql<LeadRow>`select id, kind, name, email, subject, body, created_at::text as created_at
      from leads order by created_at desc limit 100`;
  return rows;
});

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type AtelierSnapshot = {
  company: { [key: string]: Json };
  clients: Json[];
  docs: Json[];
  seq: { [key: string]: Json };
};

export const loadAtelier = createServerFn({ method: "GET" }).handler(async () => {
  const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
  assertSameSiteRequest();
  const sql = await getSql();
  const rows = await sql<{ payload: AtelierSnapshot }>`select payload from atelier_state where id = 'main'`;
  return rows[0]?.payload ?? null;
});

export const saveAtelier = createServerFn({ method: "POST" })
  .inputValidator((input: AtelierSnapshot) => {
    if (!input || !Array.isArray(input.docs) || !Array.isArray(input.clients) || !input.company || !input.seq) {
      throw new Error("État incomplet.");
    }
    if (input.docs.length > 400 || input.clients.length > 400) throw new Error("Trop de documents.");
    return input;
  })
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const sql = await getSql();
    const payload = JSON.stringify(data);
    await sql`insert into atelier_state (id, payload, updated_at)
      values ('main', ${payload}::jsonb, now())
      on conflict (id) do update set payload = excluded.payload, updated_at = now()`;
    return { ok: true };
  });
