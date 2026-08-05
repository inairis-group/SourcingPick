/**
 * Absolute URLs for anything that leaves the app.
 *
 * A relative path is fine in a page and useless in an email: the recipient's
 * mail client has no origin to resolve it against, so a link written as
 * "/fr/support/abc" is simply dead. Everything outbound goes through here.
 *
 * The localhost fallback matches the auth flow's existing behaviour rather
 * than throwing — a misconfigured dev environment should still send a mail you
 * can read, and production sets NEXT_PUBLIC_APP_URL.
 */
export function appUrl(path: string): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
