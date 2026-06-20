import type { MetadataRoute } from "next";

/**
 * PWA web manifest. Theme/background match the brand blue (logo #155DFC).
 *
 * Icons currently reference the existing favicon only — we don't yet have a
 * square maskable app-icon asset (logo-white.png is a 3800×1000 wordmark, not
 * a square mark). Add 192×192 + 512×512 maskable PNGs from the designer and
 * list them here to make the app fully installable with a proper home-screen
 * icon.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SourcingPick",
    short_name: "SourcingPick",
    description: "Sourcing international industrialisé avec séquestre intégré.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#155dfc",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
