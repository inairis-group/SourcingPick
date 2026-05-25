import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";

/**
 * Password reset tokens use the Auth.js-standard `VerificationToken` model
 * (identifier + token + expires). We store a HASH of the token, never the
 * plaintext — the plaintext only lives in the user's email link.
 *
 * Token lifetime: 1 hour.
 */

const TOKEN_TTL_MS = 60 * 60 * 1000;

export type IssuedResetToken = {
  /** Plaintext token to put in the reset URL. Never stored. */
  token: string;
  expiresAt: Date;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issue a fresh reset token for the user (identified by email). Invalidates
 * any prior outstanding tokens for the same email so spamming the form
 * doesn't leave a chain of valid links.
 */
export async function issueResetToken(email: string): Promise<IssuedResetToken> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier: email } }),
    prisma.verificationToken.create({
      data: { identifier: email, token: tokenHash, expires: expiresAt },
    }),
  ]);

  return { token, expiresAt };
}

export type ConsumeResetTokenResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" };

/**
 * Validate a reset token + consume it (single use). Returns the email it
 * was issued for so the caller can update the right user's password.
 */
export async function consumeResetToken(token: string): Promise<ConsumeResetTokenResult> {
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!record) return { ok: false, reason: "invalid" };

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: tokenHash } });
    return { ok: false, reason: "expired" };
  }

  await prisma.verificationToken.delete({ where: { token: tokenHash } });
  return { ok: true, email: record.identifier };
}
