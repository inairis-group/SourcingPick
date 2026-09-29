/** Baseline response headers. No CSP: the platform injector loads grok.com. */

interface ShieldEvent {
  url: URL;
}

function guarded(response: Response) {
  const headers = new Headers(response.headers);
  if (!headers.has("x-content-type-options")) headers.set("x-content-type-options", "nosniff");
  if (!headers.has("referrer-policy")) headers.set("referrer-policy", "strict-origin-when-cross-origin");
  if (!headers.has("x-frame-options")) headers.set("x-frame-options", "SAMEORIGIN");
  if (!headers.has("permissions-policy")) headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  if (!headers.has("x-permitted-cross-domain-policies")) headers.set("x-permitted-cross-domain-policies", "none");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default async function shield(_event: ShieldEvent, next: () => unknown | Promise<unknown>) {
  const result = await next();
  if (result instanceof Response) return guarded(result);
  return result;
}
