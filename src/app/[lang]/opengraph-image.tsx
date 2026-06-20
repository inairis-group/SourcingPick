import { ImageResponse } from "next/og";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

// Default social-share card for every page under /[lang]. Route-specific
// cards can override this by adding an opengraph-image file deeper in the
// tree. Rendered with next/og (satori) — flexbox + a CSS subset only.
export const alt = "SourcingPick — International sourcing, industrialised.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND_500 = "#155dfc";
const BRAND_950 = "#061846";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = isLocale(lang) ? await getDictionary(lang) : null;
  const tagline = dict?.brand.tagline ?? "International sourcing, industrialised.";
  const eyebrow = dict?.marketing.hero.eyebrow ?? "Sourcing · Marketplace · Certification";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          background: `linear-gradient(135deg, ${BRAND_950} 0%, ${BRAND_500} 100%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontSize: 110, fontWeight: 700, marginTop: 24 }}>
          SourcingPick
        </div>
        <div style={{ fontSize: 44, marginTop: 8, opacity: 0.92, maxWidth: 900 }}>
          {tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
