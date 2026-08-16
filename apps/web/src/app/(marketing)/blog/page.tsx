import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  allBlogPosts,
  blogIndexCanonical,
} from "@/lib/blog";
import {
  NICHE_LABEL,
  type BlogNiche,
} from "@/lib/blog/types";
import { OG_IMAGE_ALT, OG_IMAGE_URL, SITE_NAME, SITE_URL } from "@/lib/seo";

const niches: BlogNiche[] = ["barbearias", "saloes", "estetica"];

const BLOG_TITLE =
  "Blog VOLTTA: Dicas para Barbearias, Salões e Estética | Agenda e WhatsApp";
const BLOG_DESCRIPTION =
  "Artigos práticos sobre agenda online, WhatsApp automático e retenção de clientes para barbearias, salões e profissionais de estética.";

const NICHE_META: Record<
  BlogNiche,
  { title: string; description: string }
> = {
  barbearias: {
    title: "Blog VOLTTA para Barbearias | Agenda e WhatsApp",
    description:
      "Dicas de agenda online, confirmação no WhatsApp e redução de faltas para barbearias. Conteúdo prático do blog VOLTTA.",
  },
  saloes: {
    title: "Blog VOLTTA para Salões | Agenda e WhatsApp",
    description:
      "Artigos para salões de beleza: agenda online, lembretes no WhatsApp e clientes que voltam. Blog VOLTTA.",
  },
  estetica: {
    title: "Blog VOLTTA para Estética | Agenda e WhatsApp",
    description:
      "Conteúdo para clínicas e estúdios de estética: agenda online, WhatsApp e menos faltas. Blog VOLTTA.",
  },
};

type Props = {
  searchParams: Promise<{ nicho?: string }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { nicho } = await searchParams;
  const active =
    nicho && niches.includes(nicho as BlogNiche)
      ? (nicho as BlogNiche)
      : undefined;

  const title = active ? NICHE_META[active].title : BLOG_TITLE;
  const description = active
    ? NICHE_META[active].description
    : BLOG_DESCRIPTION;
  const canonical = blogIndexCanonical();

  return {
    title: { absolute: title },
    description,
    keywords: [
      "blog barbearia",
      "dicas salão de beleza",
      "agenda manicure",
      "whatsapp automático beleza",
      "retenção de clientes",
      "sistema agenda online",
    ],
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: OG_IMAGE_URL,
          alt: OG_IMAGE_ALT,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function blogIndexJsonLd() {
  const url = blogIndexCanonical();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#software` },
  };
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const { nicho } = await searchParams;
  const active =
    nicho && niches.includes(nicho as BlogNiche)
      ? (nicho as BlogNiche)
      : undefined;
  const posts = active
    ? allBlogPosts.filter((p) => p.niche === active)
    : allBlogPosts;

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#171715]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogIndexJsonLd()),
        }}
      />

      <header className="border-b border-neutral-200 bg-[#171715] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 md:px-12">
          <Link
            href="/"
            className="font-display text-2xl tracking-[.12em] sm:text-3xl"
          >
            VOLTTA<sup className="text-sm">™</sup>
          </Link>
          <div className="flex items-center gap-4 text-sm font-bold">
            <Link href="/signup" className="text-[#c4a574]">
              TESTE GRÁTIS
            </Link>
            <Link href="/login" className="text-white/70 hover:text-white">
              ENTRAR
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 md:px-12">
          <p className="text-xs font-bold tracking-[.22em] text-[#c4a574]">
            BLOG
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-none sm:text-5xl md:text-6xl">
            DICAS PARA ENCHER A AGENDA.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
            Conteúdo prático para barbearias, salões e estética: organização,
            WhatsApp e clientes que voltam.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:px-12">
        <div className="flex flex-wrap gap-2" role="navigation" aria-label="Filtro por nicho">
          <Link
            href="/blog"
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              !active
                ? "bg-[#171715] text-white"
                : "bg-white text-neutral-700 ring-1 ring-neutral-200"
            }`}
          >
            Todos ({allBlogPosts.length})
          </Link>
          {niches.map((n) => {
            const count = allBlogPosts.filter((p) => p.niche === n).length;
            return (
              <Link
                key={n}
                href={`/blog?nicho=${n}`}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  active === n
                    ? "bg-[#171715] text-white"
                    : "bg-white text-neutral-700 ring-1 ring-neutral-200"
                }`}
              >
                {NICHE_LABEL[n]} ({count})
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={post.coverImage}
                    alt={post.coverAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold tracking-wide text-[#9b7a44]">
                    {NICHE_LABEL[post.niche]} · {formatDate(post.publishedAt)}
                  </p>
                  <h2 className="mt-2 font-display text-xl leading-snug tracking-wide">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-neutral-600">
                    {post.description}
                  </p>
                  <p className="mt-4 text-xs font-bold text-[#9b7a44]">
                    LER ARTIGO →
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-neutral-500">
          Quer testar na prática?{" "}
          <Link href="/signup" className="font-bold text-[#9b7a44]">
            Comece o teste grátis
          </Link>
          {" · "}
          <Link href="/" className="font-bold text-[#9b7a44]">
            Voltar ao site
          </Link>
        </p>
      </div>
    </main>
  );
}
