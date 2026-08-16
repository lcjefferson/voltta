import type { Metadata } from "next";
import { VerticalLandingPage } from "@/components/vertical-landing-page";
import { OG_IMAGE_URL, SITE_NAME } from "@/lib/seo";
import {
  VERTICAL_LANDINGS,
  verticalCanonical,
} from "@/lib/vertical-landings";

const landing = VERTICAL_LANDINGS["para-barbearias"];

export const metadata: Metadata = {
  title: { absolute: landing.title },
  description: landing.description,
  keywords: landing.keywords,
  alternates: { canonical: verticalCanonical(landing.slug) },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: verticalCanonical(landing.slug),
    siteName: SITE_NAME,
    title: landing.title,
    description: landing.description,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: landing.heroAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: landing.title,
    description: landing.description,
    images: [OG_IMAGE_URL],
  },
};

export default function ParaBarbeariasPage() {
  return <VerticalLandingPage landing={landing} />;
}
