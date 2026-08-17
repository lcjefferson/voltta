import redirectsMap from "./redirects.json";

/**
 * Pillar SEO: 301 de posts canibalizados → hub.
 * Fonte única para next.config e filtro do blog/sitemap.
 */
export const BLOG_REDIRECTS: Record<string, string> = redirectsMap;

export const REDIRECTED_BLOG_SLUGS = new Set(Object.keys(BLOG_REDIRECTS));

export function nextBlogRedirects() {
  return Object.entries(BLOG_REDIRECTS).map(([from, to]) => ({
    source: `/blog/${from}`,
    destination: `/blog/${to}`,
    permanent: true as const,
  }));
}
