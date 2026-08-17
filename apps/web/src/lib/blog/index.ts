import { barbeariasPosts } from "@/content/blog/barbearias";
import { barbeariasPilarPosts } from "@/content/blog/barbearias-pilares";
import { saloesPosts } from "@/content/blog/saloes";
import { saloesPilarPosts } from "@/content/blog/saloes-pilares";
import { esteticaPosts } from "@/content/blog/estetica";
import { esteticaPilarPosts } from "@/content/blog/estetica-pilares";
import { REDIRECTED_BLOG_SLUGS } from "@/lib/blog/redirects";
import type { BlogNiche, BlogPost } from "@/lib/blog/types";
import { SITE_URL } from "@/lib/seo";

export const allBlogPosts: BlogPost[] = [
  ...(barbeariasPosts as BlogPost[]),
  ...(barbeariasPilarPosts as BlogPost[]),
  ...(saloesPosts as BlogPost[]),
  ...(saloesPilarPosts as BlogPost[]),
  ...(esteticaPosts as BlogPost[]),
  ...(esteticaPilarPosts as BlogPost[]),
]
  .filter((p) => !REDIRECTED_BLOG_SLUGS.has(p.slug))
  .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

export function getPostBySlug(slug: string) {
  return allBlogPosts.find((p) => p.slug === slug);
}

export function getPostsByNiche(niche: BlogNiche) {
  return allBlogPosts.filter((p) => p.niche === niche);
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  return allBlogPosts
    .filter((p) => p.niche === post.niche && p.slug !== post.slug)
    .slice(0, limit);
}

export function blogPostCanonical(slug: string) {
  return `${SITE_URL}/blog/${slug}`;
}

export function blogIndexCanonical() {
  return `${SITE_URL}/blog`;
}

export function blogPostJsonLd(post: BlogPost) {
  const url = blogPostCanonical(post.slug);
  return {
    "@context": "https://schema.org",
    "@type": ["BlogPosting", "Article"],
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: "pt-BR",
    image: [
      {
        "@type": "ImageObject",
        url: `${SITE_URL}${post.coverImage}`,
        caption: post.coverAlt,
      },
    ],
    author: {
      "@type": "Organization",
      name: "VOLTTA",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "VOLTTA",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/marketing/hero-beauty.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    keywords: post.keywords.join(", "),
  };
}
