import "server-only";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/db/client";

/**
 * Generate a unique reference string following spec §3.1 conventions:
 *   REQ-XXXXXX  (sourcing requests)
 *   ORD-XXXXX   (orders)
 *   INV-YYYY-NNNN (invoices)
 *   ESC-YYYY-NNNN (escrow transactions)
 *   PAY-YYYY-NNNN (payouts)
 *   CERT-YYYY-NNN (certifications)
 *   MKT-XXX     (marketplace products)
 *
 * v1 strategy: random + uniqueness retry. For high-throughput phases we'd
 * switch to a sequence-per-prefix model or use Postgres SEQUENCES.
 */

const MAX_RETRIES = 10;

export async function generateUniqueReference<
  T extends
    | "REQ"
    | "ORD"
    | "MKT"
    | "INV"
    | "ESC"
    | "PAY"
    | "CERT"
    | "AUC"
    | "TKT"
    | "DSP",
>(prefix: T): Promise<string> {
  // Year-scoped serials for finance + certification: INV-2026-NNNN, etc.
  // Random + retry serial scheme for the rest: REQ-XXXXXX, ORD-XXXXX, MKT-XXX.
  if (
    prefix === "INV" ||
    prefix === "ESC" ||
    prefix === "PAY" ||
    prefix === "CERT"
  ) {
    const year = new Date().getUTCFullYear();
    const padTo = prefix === "CERT" ? 3 : 4;
    const lo = prefix === "CERT" ? 100 : 1000;
    const hi = prefix === "CERT" ? 1000 : 100000;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const n = randomInt(lo, hi);
      const candidate = `${prefix}-${year}-${n.toString().padStart(padTo, "0")}`;
      const exists = await referenceExists(prefix, candidate);
      if (!exists) return candidate;
    }
    throw new Error(`Could not generate a unique ${prefix} reference after ${MAX_RETRIES} attempts`);
  }

  const digits =
    prefix === "ORD" || prefix === "TKT" || prefix === "DSP"
      ? 5
      : prefix === "MKT" || prefix === "AUC"
        ? 3
        : 6;
  const min = 10 ** (digits - 1);
  const max = 10 ** digits;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const n = randomInt(min, max);
    const candidate = `${prefix}-${n}`;

    const exists = await referenceExists(prefix, candidate);
    if (!exists) return candidate;
  }

  throw new Error(`Could not generate a unique ${prefix} reference after ${MAX_RETRIES} attempts`);
}

async function referenceExists(prefix: string, candidate: string): Promise<boolean> {
  switch (prefix) {
    case "REQ": {
      const row = await prisma.sourcingRequest.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "ORD": {
      const row = await prisma.order.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "MKT": {
      const row = await prisma.marketplaceProduct.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "INV": {
      const row = await prisma.invoice.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "ESC": {
      const row = await prisma.escrowTransaction.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "PAY": {
      const row = await prisma.payout.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "CERT": {
      const row = await prisma.certification.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "AUC": {
      const row = await prisma.auction.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "TKT": {
      const row = await prisma.supportTicket.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    case "DSP": {
      const row = await prisma.dispute.findUnique({
        where: { reference: candidate },
        select: { id: true },
      });
      return row !== null;
    }
    default:
      return false;
  }
}
