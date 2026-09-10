import type { SiteSettingsPublic } from "@/types/site-settings";
import { SITE_DESCRIPTION, SITE_NAME } from "@/constants/site";

export const SITE_SETTINGS_DEFAULTS: SiteSettingsPublic = {
  site: {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    footerBlurb:
      "Пекарня и витрина заказов. Свежая выпечка и удобный заказ онлайн.",
  },
  contacts: {},
  map: {
    enabled: false,
  },
  legal: {},
  seo: {
    metaDescription: SITE_DESCRIPTION,
    robotsIndex: true,
    robotsFollow: true,
  },
};
