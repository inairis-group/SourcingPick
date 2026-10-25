import "server-only";
import { randomInt } from "node:crypto";
import { OrgType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

/**
 * A client's reception code: "SP-" and six digits, written by the suppliers on
 * every carton they deliver to the warehouse. Digits only, so the warehouse
 * team reads it the same way whatever language they work in.
 */
export const CLIENT_CODE = /^SP-\d{6}$/;

type Db = Prisma.TransactionClient | typeof prisma;

/** A code no organisation holds yet. */
export async function newClientCode(db: Db = prisma): Promise<string> {
  for (;;) {
    const code = `SP-${randomInt(100000, 1000000)}`;
    if (!(await db.organization.findUnique({ where: { clientCode: code }, select: { id: true } })))
      return code;
  }
}

/**
 * The client organisation's code, given now if it has none (an organisation
 * created before codes existed, or by a path that does not set one). Null for
 * an organisation that is not a client.
 */
export async function ensureClientCode(orgId: string): Promise<string | null> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { type: true, clientCode: true },
  });
  if (!org || org.type !== OrgType.CLIENT) return null;
  if (org.clientCode) return org.clientCode;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // Only while it has none: another request may have given it one first.
      await prisma.organization.updateMany({
        where: { id: orgId, clientCode: null },
        data: { clientCode: await newClientCode() },
      });
    } catch {
      // The code was taken in the meantime: draw another.
      continue;
    }
    const now = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { clientCode: true },
    });
    if (now?.clientCode) return now.clientCode;
  }
  return null;
}
