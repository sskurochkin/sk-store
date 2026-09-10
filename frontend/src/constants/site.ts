export const SITE_NAME = "SK Store";

/** Default public site description (home / root metadata). */
export const SITE_DESCRIPTION =
  "Свежая выпечка к вашему столу — каталог и заказ онлайн.";

/**
 * NestJS origin for server-side fetches (RSC / middleware).
 * Uses `API_INTERNAL_URL` (Docker: `http://backend:3001`) — never NEXT_PUBLIC_* in production.
 * Browser requests must use same-origin `/api/...` (see `getApiBaseUrl`).
 */
export function getNestApiOrigin(): string {
  return (
    process.env.API_INTERNAL_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:3001"
  );
}

/** @deprecated Prefer `getNestApiOrigin()` or `getApiBaseUrl()`. */
export const NEST_API_ORIGIN = getNestApiOrigin();

/** Browser: same-origin. Server: Nest origin (public data + cookie-forwarded auth). */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return getNestApiOrigin();
}

/**
 * Public site origin for metadataBase / absolute OG URLs.
 * Set `NEXT_PUBLIC_SITE_URL` in production (no trailing slash).
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
