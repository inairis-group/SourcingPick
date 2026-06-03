import "server-only";
import { createVerify } from "node:crypto";

/**
 * Wise webhook signature verification.
 *
 * What we know (verified 2026-06-02 against docs.wise.com): Wise signs
 * webhook payloads with an RSA private key and ships the signature in a
 * header — the public key is published per-environment (sandbox / live).
 *
 * What still needs operator action before this verifier can succeed:
 *   1. Get the exact signature header name from the current Wise webhook
 *      delivery docs (the public docs page at
 *      docs.wise.com/api-docs/api-reference/webhook didn't surface it
 *      during the Pass 3b scaffolding fetch — try the webhook delivery
 *      detail page or contact Wise integrations).
 *   2. Set `WISE_WEBHOOK_PUBLIC_KEY` to Wise's PEM-encoded RSA public key
 *      for the active environment (different key for sandbox vs prod).
 *
 * Until both are set, `verifyWiseWebhookSignature` returns false and the
 * route rejects every event — fail-closed, never accept unsigned input.
 */

export type WebhookVerificationResult =
  | { ok: true }
  | { ok: false; reason: string };

/**
 * RSA-SHA256 verify Wise's webhook signature against the raw request body.
 *
 * Expects the signature to be base64-encoded — Wise's convention as of
 * the v2 webhook delivery model. Adjust if a future version moves to hex.
 */
export function verifyWiseWebhookSignature(input: {
  rawBody: string;
  signatureHeader: string | null;
}): WebhookVerificationResult {
  const publicKeyPem = process.env.WISE_WEBHOOK_PUBLIC_KEY;
  if (!publicKeyPem) {
    return {
      ok: false,
      reason:
        "WISE_WEBHOOK_PUBLIC_KEY is not set — webhook verification cannot proceed.",
    };
  }
  if (!input.signatureHeader) {
    return { ok: false, reason: "Missing signature header." };
  }

  try {
    const verifier = createVerify("RSA-SHA256");
    verifier.update(input.rawBody);
    verifier.end();

    const valid = verifier.verify(
      publicKeyPem,
      input.signatureHeader,
      "base64",
    );
    if (!valid) {
      return { ok: false, reason: "Signature did not verify." };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      reason:
        e instanceof Error
          ? `Verification threw: ${e.message}`
          : "Verification threw an unknown error.",
    };
  }
}
