import "server-only";

/**
 * Wise Business API client — low-level wrapper for authenticated requests.
 *
 * Base URLs (verified 2026-06-02 against docs.wise.com):
 *   production: https://api.wise.com
 *   sandbox:    https://api.wise-sandbox.com
 *
 * Auth: Bearer JWT in `Authorization` (User / Personal / Client tokens all
 * use the same shape). SCA-protected endpoints (sensitive money movement)
 * additionally require an OTT (one-time token) returned by an `/sca/sessions`
 * challenge — see `signedRequest()` below; the SCA flow is implemented in a
 * follow-up once the first transfer is needed.
 *
 * Selection of env vs. sandbox is via `WISE_ENV` ("production" / anything
 * else → sandbox). API token comes from `WISE_API_TOKEN`. The platform's
 * business profile ID comes from `WISE_PROFILE_ID` (call `/v2/profiles` once
 * after KYB to get this and cache it).
 */

const PRODUCTION_BASE = "https://api.wise.com";
const SANDBOX_BASE = "https://api.wise-sandbox.com";

export function wiseBaseUrl(): string {
  return process.env.WISE_ENV === "production"
    ? PRODUCTION_BASE
    : SANDBOX_BASE;
}

export function wiseToken(): string | null {
  return process.env.WISE_API_TOKEN ?? null;
}

export function wiseProfileId(): string | null {
  return process.env.WISE_PROFILE_ID ?? null;
}

export function wiseIsConfigured(): boolean {
  return Boolean(wiseToken() && wiseProfileId());
}

/** Names of env vars the operator must set; surfaced in the admin checklist. */
export function wiseRequiredEnvVars(): readonly string[] {
  return [
    "WISE_API_TOKEN",
    "WISE_PROFILE_ID",
    "WISE_ENV",
    "WISE_WEBHOOK_PUBLIC_KEY",
  ] as const;
}

export class WiseError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "WiseError";
  }
}

/**
 * Authenticated JSON request. Returns the parsed JSON body (or null on
 * empty 204 responses) and throws `WiseError` on non-2xx with the parsed
 * body preserved for callers that need to inspect Wise's error codes.
 */
export async function wiseFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = wiseToken();
  if (!token) {
    throw new WiseError("WISE_API_TOKEN is not set — cannot call Wise.");
  }

  const url = `${wiseBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...((init.headers as Record<string, string> | undefined) ?? {}),
    },
    // Wise responses are caller-data — never let Next cache them.
    cache: "no-store",
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new WiseError(
      `Wise API ${res.status} ${res.statusText} on ${path}`,
      res.status,
      body,
    );
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/**
 * SCA-signed request placeholder. Wise gates a handful of sensitive
 * endpoints (e.g. `POST /v3/profiles/{profileId}/transfers/{id}/payments`)
 * behind a "Strong Customer Authentication" challenge that returns a JWE
 * one-time token; subsequent calls must echo that token in headers.
 *
 * Wired up when we hit the first SCA-required endpoint — until then,
 * non-SCA endpoints (quote creation, recipient creation, balance reads)
 * work with `wiseFetch` alone.
 *
 * Reference: https://docs.wise.com/api-docs/api-reference (search "SCA")
 */
export async function signedRequest<T = unknown>(
  _path: string,
  _init: RequestInit = {},
): Promise<T> {
  throw new WiseError(
    "SCA-signed request not implemented yet. See lib/wise/client.ts.",
  );
}
