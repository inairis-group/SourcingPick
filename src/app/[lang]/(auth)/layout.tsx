import { notFound } from "next/navigation";
import { LocaleDropdown } from "@/components/layout/locale-dropdown";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { AuthShell } from "./_design/auth-shell";

/**
 * Access screens, in the 2026-09 SaaS canvas's two-pane frame.
 *
 * `theme-light` is the same mechanism the marketing pages use: the canvas is
 * drawn in one palette and has no dark counterpart, so these screens pin
 * themselves to the light tokens instead of following the reader's system
 * setting and rendering something nobody designed.
 *
 * The language control is the one element here with no artboard behind it —
 * a drawing has no need to switch language, and this screen is served in
 * twelve. It sits in the corner of the form pane so that each screen can open
 * with the mark the canvas gives it.
 */
export default async function AuthLayout({
  children,
  params,
}: LayoutProps<"/[lang]"> & { children: React.ReactNode }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="theme-light">
      <AuthShell dict={dict} control={<LocaleDropdown display="compact" />}>
        {children}
      </AuthShell>
    </div>
  );
}
