import { SITE_SETTINGS_DEFAULTS } from "@/constants/site-settings.defaults";
import { parseSeoKeywords } from "@/lib/parse-seo-keywords";
import type {
  SiteSettingsApiResponse,
  SiteSettingsPublic,
} from "@/types/site-settings";

function optionalString(value: string | null | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function mapSiteSettingsResponse(
  response: SiteSettingsApiResponse,
): SiteSettingsPublic {
  return {
    site: {
      name: response.siteName.trim(),
      tagline: optionalString(response.tagline),
      description: response.description.trim(),
      footerBlurb: optionalString(response.footerBlurb),
      logoUrl: optionalString(response.logoUrl),
    },
    contacts: {
      phone: optionalString(response.phone),
      email: optionalString(response.email),
      address: optionalString(response.address),
      workingHours: optionalString(response.workingHours),
    },
    map: {
      enabled: response.mapEnabled,
      embedUrl: optionalString(response.mapEmbedUrl),
      linkUrl: optionalString(response.mapLinkUrl),
    },
    legal: {
      operatorName: optionalString(response.legalOperatorName),
      contactEmail: optionalString(response.legalContactEmail),
    },
    seo: {
      metaDescription: optionalString(response.seoMetaDescription),
      keywords: parseSeoKeywords(response.seoKeywords),
      robotsIndex: response.seoRobotsIndex,
      robotsFollow: response.seoRobotsFollow,
      ogTitle: optionalString(response.seoOgTitle),
      ogDescription: optionalString(response.seoOgDescription),
      ogImageUrl: optionalString(response.seoOgImageUrl),
      googleAnalyticsId: optionalString(response.googleAnalyticsId),
      yandexMetrikaId: optionalString(response.yandexMetrikaId),
    },
  };
}

export function mergeSiteSettings(
  partial: Partial<SiteSettingsPublic> | null | undefined,
): SiteSettingsPublic {
  const base = SITE_SETTINGS_DEFAULTS;

  return {
    site: {
      ...base.site,
      ...partial?.site,
    },
    contacts: {
      ...base.contacts,
      ...partial?.contacts,
    },
    map: {
      ...base.map,
      ...partial?.map,
    },
    legal: {
      ...base.legal,
      ...partial?.legal,
    },
    seo: {
      ...base.seo,
      ...partial?.seo,
    },
  };
}
