import type { Metadata } from "next";
import type { SiteSettingsPublic } from "@/types/site-settings";

export type ResolvedSiteSeo = {
  description: string;
  keywords?: string[];
  robots: NonNullable<Metadata["robots"]>;
  siteName: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl?: string;
};

export function resolveSiteSeo(settings: SiteSettingsPublic): ResolvedSiteSeo {
  const description =
    settings.seo.metaDescription?.trim() || settings.site.description;

  return {
    description,
    keywords: settings.seo.keywords,
    robots: {
      index: settings.seo.robotsIndex,
      follow: settings.seo.robotsFollow,
    },
    siteName: settings.site.name,
    ogTitle: settings.seo.ogTitle?.trim() || settings.site.name,
    ogDescription:
      settings.seo.ogDescription?.trim() ||
      settings.seo.metaDescription?.trim() ||
      settings.site.description,
    ogImageUrl: settings.seo.ogImageUrl,
  };
}
