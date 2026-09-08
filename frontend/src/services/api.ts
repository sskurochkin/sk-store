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
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}
