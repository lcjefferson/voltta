export type BlogNiche = "barbearias" | "saloes" | "estetica";

export type BlogSection =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPostMeta = {
  slug: string;
  niche: BlogNiche;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  coverImage: string;
  coverAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

export type BlogPost = BlogPostMeta & {
  sections: BlogSection[];
};

export const NICHE_LABEL: Record<BlogNiche, string> = {
  barbearias: "Barbearias",
  saloes: "Salões",
  estetica: "Estética",
};

export const NICHE_COVER: Record<BlogNiche, { image: string; alt: string }> = {
  barbearias: {
    image: "/marketing/hero-barbershop.webp",
    alt: "Barbearia com agenda online Voltta",
  },
  saloes: {
    image: "/marketing/hero-salon.webp",
    alt: "Salão de beleza com agendamento online Voltta",
  },
  estetica: {
    image: "/marketing/hero-aesthetics.webp",
    alt: "Estúdio de estética com lembretes WhatsApp Voltta",
  },
};

export const NICHE_LANDING: Record<BlogNiche, string> = {
  barbearias: "/para-barbearias",
  saloes: "/para-saloes",
  estetica: "/para-estetica",
};
