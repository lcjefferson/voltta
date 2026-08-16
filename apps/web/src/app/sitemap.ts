import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { VERTICAL_LIST } from "@/lib/vertical-landings";

/**
 * sitemap.xml — home, conversão e landings por vertical (SEO).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-16");

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [
        `${SITE_URL}/marketing/hero-barbershop.webp`,
        `${SITE_URL}/marketing/feature-barber.webp`,
        `${SITE_URL}/marketing/feature-whatsapp.webp`,
      ],
    },
    ...VERTICAL_LIST.map((v) => ({
      url: `${SITE_URL}${v.path}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.95,
    })),
    {
      url: `${SITE_URL}/signup`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/agendar`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
