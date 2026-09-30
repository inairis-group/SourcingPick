/**
 * Live-preview OAuth client (server-only — NEVER import from the client).
 *
 * The sandbox serves each live preview on a dynamic `https://*.grok-sandbox.com`
 * URL, which can't be pre-registered per app. The broker exposes ONE shared
 * "preview" client that accepts any
 * `https://*.grok-sandbox.com/api/auth/oauth2/callback/*`
 * (broker: `app-builder-deployer/auth/src/preview-oauth.ts`).
 *
 * SECURITY: the preview client id/secret used to be baked into this file. That
 * put a live OAuth secret in git history, readable by anyone with repo access.
 * They are now injected as `GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET`
 * in BOTH deployed and preview environments — this module only keeps the
 * non-secret allowlist and issuer defaults. The secret must be rotated on the
 * broker (it stores only `base64url(SHA-256)` of it) and injected into the
 * preview runtime; until then preview sign-in stays off (fail-closed, see
 * `server.ts`).
 *
 * These MUST equal the broker's `GROK_PREVIEW_CLIENT_ID` /
 * `GROK_PREVIEW_CLIENT_SECRET`.
 */
/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Better Auth derives
 * the live preview's real origin from the request host and validates it against
 * this list (wildcard-matched), so the OAuth `redirect_uri` becomes the concrete
 * `https://<preview-host>/api/auth/oauth2/callback/...` the broker allows.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
