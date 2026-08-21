import type { Metadata, Viewport } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { FeedbackProvider } from "@/providers/feedback-provider";
import {
  OG_IMAGE_ALT,
  OG_IMAGE_URL,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  jsonLdGraph,
  softwareApplicationJsonLd,
} from "@/lib/seo";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    types: {
      "text/plain": `${SITE_URL}/llms.txt`,
    },
  },
  title: {
    default: SITE_TITLE,
    template: "%s | Voltta",
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    countryName: "Brazil",
    images: [
      {
        url: OG_IMAGE_URL,
        secureUrl: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        alt: OG_IMAGE_ALT,
        width: 1200,
        height: 630,
      },
    ],
  },
  category: "business",
  other: {
    "ai-content": "llms.txt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const softwareJsonLd = softwareApplicationJsonLd();
  const jsonLd = jsonLdGraph();

  return (
    <html lang="pt-BR">
      <body className={`${dmSans.variable} ${oswald.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <QueryProvider>
          <FeedbackProvider>{children}</FeedbackProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
