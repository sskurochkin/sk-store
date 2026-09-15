import type { MetadataRoute } from "next";
import { buildPublicSitemap } from "@/lib/build-sitemap";
import { getSiteSettings } from "@/services/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();

  if (!settings.seo.robotsIndex) {
    return [];
  }

  return buildPublicSitemap();
}

/** Regenerate sitemap at most once per hour (also refreshed via product/news cache tags). */
export const revalidate = 3600;
