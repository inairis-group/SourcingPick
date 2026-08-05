import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { pingpongConfig } from "./config";

/**
 * PingPong webhook verification.
 *
 * ⚠️ The signature scheme below is a placeholder: HMAC-SHA256 over the raw
 * body, hex, compared timing-safely. That is the most common shape, but it is
 * NOT confirmed against PingPong's documentation — when the partner API doc
 * arrives, the algorithm and header name are the only things that should need
 * to change, and they are both isolated here.
 *
 * What must NOT change without deliberate thought: verification happens on the
 * **raw** body before any JSON parsing. Re-serialising and then signing is the
 * classic way to make a signature check pass for a payload that isn't what was
 * actually sent.
 */

export const PINGPONG_SIGNATURE_HEADER = "x-pingpong-signature";

export function verifyPingPongSignature(
  rawBody: string,
  signature: string | null,
): { ok: true } | { ok: false; error: string } {
  const cfg = pingpongConfig();
  if (!cfg) return { ok: false, error: "not_configured" };
  if (!signature) return { ok: false, error: "missing_signature" };

  const expected = createHmac("sha256", cfg.webhookSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature.trim().toLowerCase());
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: "bad_signature" };
  }
  return { ok: true };
}

/**
 * The two event families we act on.
 *
 * `payment.succeeded` is a buyer paying in — it drives the escrow state
 * machine. `payout.*` is our transfer to a factory settling or failing.
 * Anything else is recorded and ignored; a rail emits far more events than a
 * marketplace needs, and reacting to events we don't understand is how money
 * moves for the wrong reason.
 */
export type PingPongEvent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

export function parsePingPongEvent(payload: unknown): PingPongEvent | null {
  if (typeof payload !== "object" || payload === null) return null;
  const p = payload as Record<string, unknown>;
  const id = typeof p.id === "string" ? p.id : null;
  const type = typeof p.type === "string" ? p.type : null;
  const data =
    typeof p.data === "object" && p.data !== null
      ? (p.data as Record<string, unknown>)
      : {};
  if (!id || !type) return null;
  return { id, type, data };
}
