import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The "how it works" step cards use Unsplash-hosted photographs. Scoped to
    // that one host so the optimizer can't be pointed at arbitrary origins.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
  experimental: {
    serverActions: {
      // Product/listing creation posts a multipart Server Action carrying up
      // to 6 images (10 MB each) plus optional video attachments (50 MB each),
      // so the default 1 MB cap rejects real submissions. Keep nginx's
      // `client_max_body_size` >= this value or nginx 413s before Next is hit.
      bodySizeLimit: "150mb",
    },
  },
  async headers() {
    return [
      {
        // The service worker must not be cached by the browser, or a new
        // deploy's SW won't be picked up. Served from the app root so its
        // scope can cover the whole site.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
