"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { AttachmentContext, NotificationType, Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { writeAuditLog } from "@/lib/audit/log";
import { emitNotificationToMany } from "@/lib/notifications/emit";
import { generateUniqueReference } from "@/lib/sourcing/reference";
import { appLocaleFor, defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { parseQuoteRequest, type QuoteRequestError } from "./parse";
import { validateQuoteFiles, type FileRejection } from "./files";
import { storeAttachments } from "@/lib/storage/attachments";

/**
 * The public quote form (/devis).
 *
 * Every export is an async server action — this file is covered by
 * `scripts/check-use-server.ts`.
 *
 * This and the guest chat are the only unauthenticated write paths besides
 * signup, so it borrows that file's guards wholesale: a salted IP hash as a
 * rate-limit key, a per-e-mail cap, and nothing retained that isn't needed to
 * answer the request.
 *
 * What it deliberately does *not* do is create a SourcingRequest. That model
 * requires a clientOrgId and the person filling this in has no organisation —
 * inventing one to satisfy a foreign key would put a fictional company in the
 * middle of a real order. This records the lead; ops answers it and it
 * converts once the asker has an account.
 */

const MAX_OPEN_PER_EMAIL = 3;
const MAX_PER_IP_PER_HOUR = 5;

export type QuoteRequestState =
  | { ok: true; reference: string }
  | {
      ok: false;
      error: QuoteRequestError | FileRejection | "too_many_open" | "rate_limited" | "failed";
    };

/**
 * Salted SHA-256 of the client IP. Never stored raw: a public form needs a
 * rate-limit key, not a record of who visited.
 */
async function clientIpHash(): Promise<string | null> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
  if (!ip) return null;
  return createHash("sha256")
    .update(`${process.env.AUTH_SECRET ?? "unsalted"}:${ip}`)
    .digest("hex");
}

async function currentLocale(): Promise<Locale> {
  const h = await headers();
  const fromProxy = h.get("x-locale");
  return fromProxy && isLocale(fromProxy) ? fromProxy : defaultLocale;
}

export async function submitQuoteRequest(
  _prev: QuoteRequestState | null,
  form: FormData,
): Promise<QuoteRequestState> {
  const parsed = parseQuoteRequest(form);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const { email } = parsed.data;

  // Checked before anything is written: the browser checked too, but that
  // check is a courtesy and this one is the rule.
  const files = form.getAll("q-files").filter((f): f is File => f instanceof File);
  const fileCheck = validateQuoteFiles(files);
  if (!fileCheck.ok) return { ok: false, error: fileCheck.error };

  const open = await prisma.quoteRequest.count({
    where: { email, handledAt: null },
  });
  if (open >= MAX_OPEN_PER_EMAIL) return { ok: false, error: "too_many_open" };

  const ipHash = await clientIpHash();
  if (ipHash) {
    const recent = await prisma.quoteRequest.count({
      where: { ipHash, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recent >= MAX_PER_IP_PER_HOUR) return { ok: false, error: "rate_limited" };
  }

  const locale = await currentLocale();
  // If they already have an account, say so on the record rather than making
  // ops search for it later. Never used to authenticate anything.
  const linked = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });

  const reference = await generateUniqueReference("QRQ");

  const created = await prisma.quoteRequest.create({
    data: {
      ...parsed.data,
      reference,
      // The record is answered in the language it was written in.
      locale: appLocaleFor(locale),
      linkedUserId: linked?.id ?? null,
      ipHash,
    },
    select: { id: true, reference: true },
  });

  // Stored after the row exists, because an attachment is filed against its
  // context id. A file that fails to store does not lose the request — the
  // request is the thing that must not be dropped, and ops can ask again.
  const stored = files.length
    ? await storeAttachments({
        contextType: AttachmentContext.QUOTE_REQUEST,
        contextId: created.id,
        // A visitor has no account, so nobody owns the upload but the request.
        uploaderId: null,
        files,
      })
    : { created: [], errors: [] };

  await writeAuditLog({
    action: "quote_request.received",
    targetType: "QuoteRequest",
    targetId: created.id,
    payload: {
      reference: created.reference,
      country: parsed.data.destinationCountry,
      linked: Boolean(linked),
      attachments: stored.created.length,
      attachmentErrors: stored.errors.length ? stored.errors : undefined,
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN, deletedAt: null },
    select: { id: true },
  });
  if (admins.length > 0) {
    await emitNotificationToMany(
      admins.map((a) => a.id),
      {
        type: NotificationType.SYSTEM,
        vars: { systemKey: "quote_request_received", reference: created.reference },
        contextType: "QuoteRequest",
        contextId: created.id,
      },
    );
  }

  return { ok: true, reference: created.reference };
}
