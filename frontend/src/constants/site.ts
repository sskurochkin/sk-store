export const SITE_NAME = "SK Store";

/**
 * NestJS origin for server-side fetches (RSC / SSG / middleware auth checks).
 * Browser requests must use same-origin `/api/...` (see `getApiBaseUrl`).
 */
export const NEST_API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

/**
 * @deprecated Prefer `getApiBaseUrl()` — kept for any accidental imports.
 * Resolves to Nest origin on the server and empty string in the browser.
 */
export const API_URL = NEST_API_ORIGIN;

/** Browser: same-origin. Server: Nest origin (public data + cookie-forwarded auth). */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return NEST_API_ORIGIN;
}
