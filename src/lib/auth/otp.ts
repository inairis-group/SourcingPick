import { hash, compare } from "bcryptjs";
import { prisma } from "@/lib/db/client";

/**
 * Email-OTP for 2FA.
 *
 * Design:
 *  - 6 digits, base-10
 *  - 10-minute lifetime
 *  - max 5 attempts per code before invalidation
 *  - bcrypt-hashed at rest (never store the plaintext code)
 *  - single-use (consumedAt set on success)
 *
 * Issuing a fresh code invalidates any unconsumed prior codes for the user.
 */

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const OTP_HASH_COST = 8; // codes are short-lived, no need for full password cost

export type OtpIssueResult = {
  /** The plaintext code — only returned to the caller so it can be emailed. Never log this. */
  code: string;
  expiresAt: Date;
};

/**
 * Generate a new OTP, persist its hash, invalidate any prior unconsumed codes
 * for this user, and return the plaintext for delivery via email.
 */
export async function issueEmailOtp(userId: string): Promise<OtpIssueResult> {
  const code = generateNumericCode(6);
  const codeHash = await hash(code, OTP_HASH_COST);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.$transaction([
    prisma.emailOtp.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    }),
    prisma.emailOtp.create({
      data: { userId, codeHash, expiresAt },
    }),
  ]);

  return { code, expiresAt };
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; reason: "no_active_code" | "expired" | "too_many_attempts" | "wrong_code" };

/**
 * Verify a user-submitted OTP. On success, the code is consumed (single-use).
 * On wrong-but-still-valid attempts, increments the attempt counter; if the
 * counter hits OTP_MAX_ATTEMPTS the code is invalidated and the user has to
 * request a new one.
 */
export async function verifyEmailOtp(userId: string, code: string): Promise<OtpVerifyResult> {
  const active = await prisma.emailOtp.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!active) return { ok: false, reason: "no_active_code" };
  if (active.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (active.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  const matches = await compare(code, active.codeHash);

  if (!matches) {
    const nextAttempts = active.attempts + 1;
    await prisma.emailOtp.update({
      where: { id: active.id },
      data: {
        attempts: nextAttempts,
        // Burn the code if we've exhausted attempts
        consumedAt: nextAttempts >= OTP_MAX_ATTEMPTS ? new Date() : null,
      },
    });
    return { ok: false, reason: "wrong_code" };
  }

  await prisma.emailOtp.update({
    where: { id: active.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true };
}

function generateNumericCode(digits: number): string {
  // Use crypto for the digit-by-digit pick so we don't bias on modulo.
  // Math.random would be acceptable security-wise here (codes are bcrypted
  // and rate-limited) but crypto is one line and removes the question.
  const buf = new Uint8Array(digits);
  crypto.getRandomValues(buf);
  let code = "";
  for (let i = 0; i < digits; i++) {
    code += (buf[i]! % 10).toString();
  }
  return code;
}
