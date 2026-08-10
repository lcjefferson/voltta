import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt dinâmico (espelha public/robots.txt com o domínio de SITE_URL).
 * Googlebot: Allow completo nas páginas públicas da landing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
      {
        userAgent: "Googlebot-News",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: [
          "/",
          "/signup",
          "/login",
          "/agendar",
          "/llms.txt",
          "/marketing/",
        ],
        disallow: [
          "/dashboard",
          "/agenda",
          "/leads",
          "/clientes",
          "/profissionais",
          "/servicos",
          "/financeiro",
          "/automacoes",
          "/whatsapp",
          "/assinatura",
          "/configuracoes",
          "/onboarding",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
