export type SiteSettingsPublic = {
  site: {
    name: string;
    tagline?: string;
    description: string;
    footerBlurb?: string;
    logoUrl?: string;
  };
  contacts: {
    phone?: string;
    email?: string;
    address?: string;
    workingHours?: string;
  };
  map: {
    enabled: boolean;
    embedUrl?: string;
    linkUrl?: string;
  };
  legal: {
    operatorName?: string;
    contactEmail?: string;
  };
  seo: {
    metaDescription?: string;
    keywords?: string[];
    robotsIndex: boolean;
    robotsFollow: boolean;
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
    googleAnalyticsId?: string;
    yandexMetrikaId?: string;
  };
};

/** Flat API payload from GET /api/settings */
export type SiteSettingsApiResponse = {
  id: string;
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
  updatedAt: string;
};
