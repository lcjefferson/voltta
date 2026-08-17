import type { NextConfig } from "next";
import blogRedirects from "./src/lib/blog/redirects.json";

const nextConfig: NextConfig = {
  // Necessário para o Dockerfile (COPY .next/standalone + node server.js)
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [56, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return Object.entries(blogRedirects).map(([from, to]) => ({
      source: `/blog/${from}`,
      destination: `/blog/${to}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
