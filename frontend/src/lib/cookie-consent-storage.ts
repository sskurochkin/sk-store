import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  COOKIE_CONSENT_VERSION,
} from "@/constants/cookie-consent";
import type {
  CookieConsentPreferences,
  OptionalCookieCategory,
} from "@/types/cookie-consent";

function isOptionalCategory(value: unknown): value is OptionalCookieCategory {
  return (
    value === "functional" || value === "analytics" || value === "marketing"
  );
}

function isCookieConsentPreferences(
  value: unknown,
): value is CookieConsentPreferences {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    item.version === COOKIE_CONSENT_VERSION &&
    item.necessary === true &&
    typeof item.functional === "boolean" &&
    typeof item.analytics === "boolean" &&
    typeof item.marketing === "boolean" &&
    typeof item.updatedAt === "string"
  );
}

export function createConsentPreferences(
  partial: Pick<
    CookieConsentPreferences,
    "functional" | "analytics" | "marketing"
  >,
): CookieConsentPreferences {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    functional: partial.functional,
    analytics: partial.analytics,
    marketing: partial.marketing,
    updatedAt: new Date().toISOString(),
  };
}

export const ACCEPT_ALL_CONSENT = createConsentPreferences({
  functional: true,
  analytics: true,
  marketing: true,
});

export const REJECT_OPTIONAL_CONSENT = createConsentPreferences({
  functional: false,
  analytics: false,
  marketing: false,
});

/** Call only in the browser after mount. */
export function loadCookieConsent(): CookieConsentPreferences | null {
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isCookieConsentPreferences(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/** Call only in the browser. */
export function saveCookieConsent(preferences: CookieConsentPreferences): void {
  try {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(preferences),
    );
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT));
  } catch {
    // Quota / private mode — consent stays in-memory for the session only.
  }
}

export function hasCategoryConsent(
  preferences: CookieConsentPreferences | null,
  category: OptionalCookieCategory,
): boolean {
  if (!preferences) {
    return false;
  }
  return preferences[category];
}

/** For future integrations — analytics scripts must check this before loading. */
export function hasAnalyticsConsent(
  preferences: CookieConsentPreferences | null,
): boolean {
  return hasCategoryConsent(preferences, "analytics");
}

export function hasMarketingConsent(
  preferences: CookieConsentPreferences | null,
): boolean {
  return hasCategoryConsent(preferences, "marketing");
}

export function isValidCategoryKey(
  value: string,
): value is OptionalCookieCategory {
  return isOptionalCategory(value);
}
