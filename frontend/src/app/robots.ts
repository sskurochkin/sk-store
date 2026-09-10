import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/services/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();

  if (!settings.seo.robotsIndex) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
  };
}
