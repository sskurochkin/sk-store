import { API_URL } from "@/constants/site";

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

/**
 * Minimal public API fetch helper. Server Components only by default.
 */
export async function apiGet<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    next: options.next,
    cache: options.cache,
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
 * Browser-oriented JSON POST helper (checkout, etc.).
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
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
