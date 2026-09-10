/** Server-side defaults when SiteSettings row is missing. */
export const SITE_SETTINGS_ID = 'default';

export const DEFAULT_SITE_SETTINGS = {
  id: SITE_SETTINGS_ID,
  siteName: 'SK Store',
  tagline: null as string | null,
  description: 'Свежая выпечка к вашему столу — каталог и заказ онлайн.',
  footerBlurb:
    'Пекарня и витрина заказов. Свежая выпечка и удобный заказ онлайн.',
  logoUrl: null as string | null,
  phone: null as string | null,
  email: null as string | null,
  address: null as string | null,
  workingHours: null as string | null,
  mapEnabled: false,
  mapEmbedUrl: null as string | null,
  mapLinkUrl: null as string | null,
  legalOperatorName: null as string | null,
  legalContactEmail: null as string | null,
  seoMetaDescription: null as string | null,
  seoKeywords: null as string | null,
  seoRobotsIndex: true,
  seoRobotsFollow: true,
  seoOgTitle: null as string | null,
  seoOgDescription: null as string | null,
  seoOgImageUrl: null as string | null,
  googleAnalyticsId: null as string | null,
  yandexMetrikaId: null as string | null,
} as const;
