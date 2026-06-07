import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingFooter } from "@/components/marketing/footer";
import { PublicContactButton } from "@/components/marketing/public-contact-button";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardPathForRole } from "@/lib/auth/redirects";
import { notFound } from "next/navigation";

export default async function MarketingLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, user] = await Promise.all([
    getDictionary(lang),
    getCurrentUser(),
  ]);
  const dashboardHref = user ? dashboardPathForRole(user.role, lang) : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNavbar
        signedIn={Boolean(user)}
        dashboardHref={dashboardHref}
      />
      <main className="flex-1">{children}</main>
      <MarketingFooter dict={dict} locale={lang} />
      {/* Partner #17: lightweight pre-signup contact dock. Replace
          with a vendor live-chat widget when ops is ready to staff it. */}
      {!user && <PublicContactButton />}
    </div>
  );
}
