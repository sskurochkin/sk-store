import { ApiError, apiGet, apiPatch } from "@/services/api";
import type { SiteSettingsApiResponse } from "@/types/site-settings";

export type UpdateSiteSettingsPayload = Partial<{
  siteName: string;
  tagline: string | null;
  description: string;
  footerBlurb: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  mapEnabled: boolean;
  mapEmbedUrl: string | null;
  mapLinkUrl: string | null;
  legalOperatorName: string | null;
  legalContactEmail: string | null;
  seoMetaDescription: string | null;
  seoKeywords: string | null;
  seoRobotsIndex: boolean;
  seoRobotsFollow: boolean;
  seoOgTitle: string | null;
  seoOgDescription: string | null;
  seoOgImageUrl: string | null;
  googleAnalyticsId: string | null;
  yandexMetrikaId: string | null;
}>;

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

export async function getSettingsAdmin(
  cookie?: string,
): Promise<SiteSettingsApiResponse> {
  const data = await apiGet<unknown>("/api/settings", {
    cache: "no-store",
    cookie,
    credentials: cookie ? undefined : "same-origin",
  });

  if (!isSiteSettingsApiResponse(data)) {
    throw new ApiError("Settings API returned an invalid payload", 500);
  }

  return data;
}

export async function updateSettings(
  payload: UpdateSiteSettingsPayload,
): Promise<SiteSettingsApiResponse> {
  const data = await apiPatch<unknown>("/api/settings", payload);

  if (!isSiteSettingsApiResponse(data)) {
    throw new ApiError("Update settings returned an invalid payload", 500);
  }

  return data;
}
