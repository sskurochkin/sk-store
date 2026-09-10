/** Persisted browser-side cookie preference categories (not HTTP cookies). */
export type CookieConsentPreferences = {
  version: string;
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export type OptionalCookieCategory = "functional" | "analytics" | "marketing";

export type CookieCategoryDefinition =
  | {
      id: "necessary";
      title: string;
      description: string;
      required: true;
    }
  | {
      id: OptionalCookieCategory;
      title: string;
      description: string;
      required: false;
    };
