import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed reply addresses.
 *
 * The whole security model for inbound email rests here, so it's worth being
 * explicit about why: **the `From` header is not evidence of anything.** Any
 * host on the internet can send us a mail claiming to be a customer. If we
 * resolved an inbound reply by looking up the sender's address, anyone who
 * knew a customer's email could post messages into their support thread.
 *
 * So the *recipient* address carries the identity instead. Every outbound mail
 * gets a unique Reply-To of the form
 *
 *     reply+<kind>.<id>.<sig>@<domain>
 *
 * where `sig` is an HMAC over `kind.id` keyed with a server secret. A reply
 * comes back addressed to that, which proves the sender is answering a mail we
 * actually sent to them — a token they could only have because we put it in
 * their inbox. Forging it requires the secret.
 *
 * This is capability-based rather than identity-based: possession of the
 * address IS the authorisation. It follows that the token must never appear
 * anywhere but the recipient's own mail.
 */

export type InboundTarget =
  /// Public-chat conversation — the visitor has no account.
  | { kind: "g"; id: string }
  /// Support ticket thread — the requester has an account.
  | { kind: "t"; id: string };

const SIG_LENGTH = 16;

function secret(): string | null {
  // Falls back to AUTH_SECRET so a deployment that sets one but not the other
  // still produces unforgeable tokens rather than silently signing with "".
  return process.env.INBOUND_EMAIL_SECRET || process.env.AUTH_SECRET || null;
}

/**
 * Lowercase hex, deliberately not base64url.
 *
 * The local part of an address is case-sensitive per RFC 5321, but plenty of
 * providers and relays normalise it anyway — and a signature that changes
 * meaning when lower-cased would reject perfectly genuine replies. Hex
 * survives that; 16 hex chars is 64 bits, which is far past guessable when
 * forging also requires the key.
 */
function sign(kind: string, id: string, key: string): string {
  return createHmac("sha256", key)
    .update(`${kind}.${id}`)
    .digest("hex")
    .slice(0, SIG_LENGTH);
}

/**
 * Build the Reply-To for a message about `target`, or null when inbound email
 * isn't configured — callers then omit Reply-To rather than advertising an
 * address that routes nowhere.
 */
export function inboundReplyAddress(target: InboundTarget): string | null {
  const key = secret();
  const domain = process.env.INBOUND_EMAIL_DOMAIN;
  if (!key || !domain) return null;
  const sig = sign(target.kind, target.id, key);
  return `reply+${target.kind}.${target.id}.${sig}@${domain}`;
}

/**
 * Recover the target from an inbound envelope recipient.
 *
 * Returns null for anything that doesn't verify — a stale token, a mangled
 * address, a guess. The caller drops the mail rather than falling back to the
 * sender, because falling back to the sender is exactly the hole this exists
 * to close.
 */
export function parseInboundAddress(address: string): InboundTarget | null {
  const key = secret();
  if (!key) return null;

  // Tolerate "Name <addr>" and surrounding whitespace: envelope formatting
  // varies by provider and we don't control it.
  const bare = (address.match(/<([^>]+)>/)?.[1] ?? address).trim().toLowerCase();
  const local = bare.split("@")[0];
  if (!local?.startsWith("reply+")) return null;

  const parts = local.slice("reply+".length).split(".");
  if (parts.length !== 3) return null;
  const [kind, id, sig] = parts;
  if (kind !== "g" && kind !== "t") return null;
  if (!id || !sig) return null;

  // Both sides are lowercase hex over a lowercase cuid(2), so the
  // normalisation above can't change what we're comparing.
  const expected = sign(kind, id, key);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return { kind, id };
}

/**
 * Strip the quoted history a mail client appends when someone hits reply.
 *
 * Without this every reply grows by the whole prior thread, and the visible
 * message in our UI would be mostly the mail we just sent them. Conservative
 * by design: we cut at the first recognised marker and keep everything above
 * it, so an unrecognised client costs us a verbose message rather than a lost
 * one.
 */
export function stripQuotedReply(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const markers: RegExp[] = [
    /^>/, // quoted line
    /^\s*-{2,}\s*Original Message\s*-{2,}/i,
    /^\s*_{5,}\s*$/,
    /^\s*On .+ wrote:\s*$/i, // en
    /^\s*Le .+ a écrit\s*:\s*$/i, // fr
    /^\s*在.+写道：\s*$/, // zh
    /^\s*في .+ كتب:\s*$/, // ar
    /^\s*From:\s.+/i,
    /^--\s*$/, // signature delimiter (RFC 3676)
  ];

  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (markers.some((m) => m.test(lines[i]!))) {
      end = i;
      break;
    }
  }
  return lines.slice(0, end).join("\n").trim();
}
