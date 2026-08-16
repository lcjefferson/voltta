import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogCta } from "@/components/blog-cta";
import {
  allBlogPosts,
  blogPostCanonical,
  blogPostJsonLd,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/blog";
import { NICHE_LABEL, NICHE_LANDING } from "@/lib/blog/types";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allBlogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Artigo não encontrado" };

  const url = blogPostCanonical(post.slug);
  const ogImage = `${SITE_URL}${post.coverImage.replace(/\.webp$/, ".jpg")}`;

  return {
    title: { absolute: `${post.title} | Blog VOLTTA` },
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      url,
      siteName: SITE_NAME,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.coverAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);
  const jsonLd = blogPostJsonLd(post);

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#171715]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="border-b border-neutral-200 bg-[#171715] text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="font-display text-2xl tracking-[.12em]">
            VOLTTA<sup className="text-sm">™</sup>
          </Link>
          <div className="flex gap-4 text-sm font-bold">
            <Link href="/blog" className="text-white/70 hover:text-white">
              BLOG
            </Link>
            <Link href="/signup" className="text-[#c4a574]">
              TESTE GRÁTIS
            </Link>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-xs font-bold tracking-wide text-[#9b7a44]">
          <Link href={NICHE_LANDING[post.niche]} className="hover:underline">
            {NICHE_LABEL[post.niche]}
          </Link>
          {" · "}
          {formatDate(post.publishedAt)}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 text-base text-neutral-600 sm:text-lg">
          {post.description}
        </p>

        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <div className="prose-voltta mt-10 space-y-5 text-base leading-relaxed text-neutral-700 sm:text-[1.05rem]">
          {post.sections.map((section, i) => {
            if (section.type === "h2") {
              return (
                <h2
                  key={i}
                  className="pt-4 font-display text-2xl tracking-wide text-[#171715]"
                >
                  {section.text}
                </h2>
              );
            }
            if (section.type === "ul") {
              return (
                <ul key={i} className="list-disc space-y-2 pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{section.text}</p>;
          })}
        </div>

        <BlogCta label={post.ctaLabel} href={post.ctaHref} />

        {related.length > 0 && (
          <section className="mt-12 border-t border-neutral-200 pt-10">
            <h2 className="font-display text-2xl tracking-wide">
              Continue lendo
            </h2>
            <ul className="mt-5 space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="font-semibold text-[#9b7a44] hover:underline"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-sm text-neutral-500">
          <Link href="/blog" className="font-bold text-[#9b7a44]">
            ← Todos os artigos
          </Link>
          {" · "}
          <Link
            href={NICHE_LANDING[post.niche]}
            className="font-bold text-[#9b7a44]"
          >
            Página {NICHE_LABEL[post.niche]}
          </Link>
        </p>
      </article>
    </main>
  );
}
