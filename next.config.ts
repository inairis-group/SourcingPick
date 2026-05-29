import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Product/listing creation posts a multipart Server Action carrying up
      // to 6 images (10 MB each) plus optional video attachments (50 MB each),
      // so the default 1 MB cap rejects real submissions. Keep nginx's
      // `client_max_body_size` >= this value or nginx 413s before Next is hit.
      bodySizeLimit: "150mb",
    },
  },
};

export default nextConfig;
