import { barbeariasPosts } from "@/content/blog/barbearias";
import { saloesPosts } from "@/content/blog/saloes";
import { esteticaPosts } from "@/content/blog/estetica";
import type { BlogNiche, BlogPost } from "@/lib/blog/types";
import { SITE_URL } from "@/lib/seo";

export const allBlogPosts: BlogPost[] = [
  ...(barbeariasPosts as BlogPost[]),
  ...(saloesPosts as BlogPost[]),
  ...(esteticaPosts as BlogPost[]),
].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

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
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: "pt-BR",
    image: [`${SITE_URL}${post.coverImage}`],
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
    keywords: post.keywords.join(", "),
  };
}
