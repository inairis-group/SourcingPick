/** Baseline response headers. No CSP: the platform injector loads grok.com. */

interface ShieldEvent {
  url: URL;
}

function guarded(response: Response, pathname: string) {
  const headers = new Headers(response.headers);
  if (!headers.has("x-content-type-options")) headers.set("x-content-type-options", "nosniff");
  if (!headers.has("referrer-policy")) headers.set("referrer-policy", "strict-origin-when-cross-origin");
  if (!headers.has("x-frame-options")) headers.set("x-frame-options", "SAMEORIGIN");
  if (!headers.has("permissions-policy")) headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  if (!headers.has("x-permitted-cross-domain-policies")) headers.set("x-permitted-cross-domain-policies", "none");
  const hashed = /\/assets\/[^/]+-[A-Za-z0-9_-]{6,}\./.test(pathname);
  if (hashed) headers.set("cache-control", "public, max-age=31536000, immutable");
  else if (!headers.has("cache-control")) headers.set("cache-control", "no-cache, no-store, must-revalidate");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default async function shield(event: ShieldEvent, next: () => unknown | Promise<unknown>) {
  const result = await next();
  if (result instanceof Response) return guarded(result, event.url?.pathname || "/");
  return result;
}
