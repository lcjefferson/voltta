import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem "standalone": Coolify usa `npm start` → `next start`.
  // Mantém o deploy simples e evita o warning de incompatibilidade.
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [56, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
