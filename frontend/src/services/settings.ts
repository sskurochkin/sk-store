import { mergeSiteSettings, mapSiteSettingsResponse } from "@/lib/merge-site-settings";
import { apiGet } from "@/services/api";
import type {
  SiteSettingsApiResponse,
  SiteSettingsPublic,
} from "@/types/site-settings";

function isSiteSettingsApiResponse(
  value: unknown,
): value is SiteSettingsApiResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.siteName === "string" &&
    typeof item.description === "string" &&
    typeof item.mapEnabled === "boolean" &&
    typeof item.seoRobotsIndex === "boolean" &&
    typeof item.seoRobotsFollow === "boolean" &&
    typeof item.updatedAt === "string"
  );
}

/**
 * Loads public site settings. Never throws — returns merged defaults on failure.
 */
export async function getSiteSettings(): Promise<SiteSettingsPublic> {
  try {
    const data = await apiGet<unknown>("/api/settings", {
      next: { revalidate: 60, tags: ["settings"] },
    });

    if (!isSiteSettingsApiResponse(data)) {
      console.error("Settings API returned an invalid payload");
      return mergeSiteSettings(null);
    }

    return mergeSiteSettings(mapSiteSettingsResponse(data));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`Failed to load site settings: ${message}`);
    return mergeSiteSettings(null);
  }
}
