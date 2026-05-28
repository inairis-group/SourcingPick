import { getActiveBanners } from "@/lib/marketplace/banners";
import { BannerCarousel } from "./banner-carousel";
import type { BannerCardData } from "./banner-card";

// Re-export the presentational pieces so existing import sites keep working.
export { BannerCard, gradientCss } from "./banner-card";
export type { BannerCardData } from "./banner-card";

/**
 * Storefront banner rail — fetches active banners (server) and hands them
 * to the client carousel. Renders nothing when there are none. `locale`
 * prefixes relative CTA hrefs.
 */
export async function MarketplaceBannerRail({ locale }: { locale: string }) {
  const banners = await getActiveBanners();
  if (banners.length === 0) return null;

  const slides = banners.map((b) => ({
    id: b.id,
    href: resolveHref(b.ctaHref, locale),
    card: {
      title: b.title,
      subtitle: b.subtitle,
      ctaLabel: b.ctaLabel,
      ctaHref: b.ctaHref,
      tone: b.tone,
      background: b.background,
      gradientFrom: b.gradientFrom,
      gradientVia: b.gradientVia,
      gradientTo: b.gradientTo,
      gradientAngle: b.gradientAngle,
      mediaUrl: b.mediaUrl,
      overlayOpacity: b.overlayOpacity,
    } satisfies BannerCardData,
  }));

  return (
    <div className="mb-6">
      <BannerCarousel slides={slides} />
    </div>
  );
}

/**
 * Prefix locale onto internal relative hrefs; leave absolute URLs and
 * already-localised paths alone.
 */
function resolveHref(href: string | null, locale: string): string | null {
  if (!href) return null;
  if (/^https?:\/\//i.test(href)) return href;
  if (!href.startsWith("/")) return `/${locale}/${href}`;
  const seg = href.split("/")[1];
  if (seg && seg.length === 2) return href;
  return `/${locale}${href}`;
}
