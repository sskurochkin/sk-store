/** Normalized Google Analytics measurement ID (GA4 or Universal Analytics). */
export function normalizeGoogleAnalyticsId(
  value?: string,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const upper = trimmed.toUpperCase();
  if (/^G-[A-Z0-9]+$/.test(upper) || /^UA-\d+-\d+$/.test(upper)) {
    return upper;
  }

  return undefined;
}

/** Normalized Yandex Metrika numeric counter ID. */
export function normalizeYandexMetrikaId(value?: string): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    return undefined;
  }

  const counterId = Number.parseInt(trimmed, 10);
  return Number.isFinite(counterId) ? counterId : undefined;
}

export function buildAnalyticsPagePath(pathname: string): string {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  }
}

export function trackGoogleAnalyticsPageView(
  gaId: string,
  pagePath: string,
): void {
  if (typeof window.gtag !== "function") {
    return;
  }
  window.gtag("config", gaId, { page_path: pagePath });
}

export function trackYandexMetrikaPageView(
  counterId: number,
  pagePath: string,
): void {
  if (typeof window.ym !== "function") {
    return;
  }
  window.ym(counterId, "hit", pagePath, { title: document.title });
}
