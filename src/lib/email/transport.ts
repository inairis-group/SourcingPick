import "server-only";
import { createTransport, type Transporter } from "nodemailer";

/**
 * Nodemailer transport. Caystone chose Nodemailer for v1 so we can point at
 * Mailpit / Mailhog in dev (no real emails sent during testing) and swap to
 * any SMTP provider in prod without changing template code.
 *
 * If we later migrate to Resend or Postmark, only this file changes — the
 * `sendEmail` wrapper and React Email templates stay identical.
 */

let cached: Transporter | null = null;

export function getTransport(): Transporter {
  if (cached) return cached;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  if (!host || !port) {
    throw new Error("SMTP_HOST and SMTP_PORT must be set");
  }

  cached = createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  return cached;
}
