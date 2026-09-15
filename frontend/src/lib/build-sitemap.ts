import type { MetadataRoute } from "next";
import { FOOTER_LEGAL_LINKS } from "@/constants/legal-links";
import { getSiteUrl } from "@/constants/site";
import { getNewsList } from "@/services/news";
import { getProducts } from "@/services/products";

type SitemapEntry = MetadataRoute.Sitemap[number];

type StaticRoute = {
  path: string;
  changeFrequency: NonNullable<SitemapEntry["changeFrequency"]>;
  priority: number;
};

const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/products", changeFrequency: "daily", priority: 0.9 },
  { path: "/news", changeFrequency: "daily", priority: 0.8 },
  { path: "/contacts", changeFrequency: "monthly", priority: 0.7 },
  ...FOOTER_LEGAL_LINKS.map((link) => ({
    path: link.href,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  })),
];

function staticEntry(baseUrl: string, route: StaticRoute): SitemapEntry {
  return {
    url: `${baseUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  };
}

function parseIsoDate(value: string): Date | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Builds the public sitemap (indexable shop routes only).
 * Excludes /cart, /admin, and other noindex pages.
 */
export async function buildPublicSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const entries: SitemapEntry[] = STATIC_ROUTES.map((route) =>
    staticEntry(baseUrl, route),
  );

  try {
    const [products, news] = await Promise.all([
      getProducts(),
      getNewsList(),
    ]);

    for (const product of products) {
      entries.push({
        url: `${baseUrl}/products/${encodeURIComponent(product.alias)}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const item of news) {
      entries.push({
        url: `${baseUrl}/news/${encodeURIComponent(item.alias)}`,
        lastModified: parseIsoDate(item.updatedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Keep static entries if catalog/news APIs are temporarily unavailable.
  }

  return entries;
}
