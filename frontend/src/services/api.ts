import { getApiBaseUrl } from "@/constants/site";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = {
  /** Next.js fetch cache options */
  next?: NextFetchRequestConfig;
  cache?: RequestCache;
  /** Forward Cookie header (server-side authenticated requests). */
  cookie?: string;
  /** Browser credentials mode (default: same-origin). */
  credentials?: RequestCredentials;
};

function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body !== "object" || body === null) {
    return fallback;
  }

  const message = (body as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (Array.isArray(message) && message.length > 0) {
    return message.filter((entry) => typeof entry === "string").join(", ") || fallback;
  }

  return fallback;
}

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}

function buildHeaders(
  base: Record<string, string>,
  cookie?: string,
): HeadersInit {
  if (!cookie) {
    return base;
  }
  return { ...base, Cookie: cookie };
}

/**
 * JSON GET helper.
 * Browser → same-origin `/api/...` (Next rewrite).
 * Server → Nest origin (optionally with Cookie forwarding).
 */
export async function apiGet<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "GET",
    headers: buildHeaders({ Accept: "application/json" }, options.cookie),
    next: options.next,
    cache: options.cache,
    credentials: options.credentials,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const body: unknown = await response.json();
      message = extractErrorMessage(body, message);
    } catch {
      // keep status text fallback
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

/**
 * JSON POST helper (checkout, contact form, auth).
 * Browser uses same-origin `/api/...` so Set-Cookie binds to the Next host.
 */
export async function apiPost<T>(
  path: string,
  body: unknown,
  options: FetchOptions = {},
): Promise<T> {
  return apiMutate<T>("POST", path, body, options);
}

/**
 * JSON PATCH helper (admin mutations).
 */
export async function apiPatch<T>(
  path: string,
  body: unknown,
  options: FetchOptions = {},
): Promise<T> {
  return apiMutate<T>("PATCH", path, body, options);
}

/**
 * DELETE helper (admin mutations). Expects 204 with empty body.
 */
export async function apiDelete(
  path: string,
  options: FetchOptions = {},
): Promise<void> {
  await apiMutate<undefined>("DELETE", path, undefined, options);
}

async function apiMutate<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body: unknown | undefined,
  options: FetchOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: buildHeaders(headers, options.cookie),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    credentials: options.credentials ?? "same-origin",
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorBody: unknown = await response.json();
      message = extractErrorMessage(errorBody, message);
    } catch {
      // keep status text fallback
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
