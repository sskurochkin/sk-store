import { getNestApiOrigin } from "@/constants/site";
import type { AuthUser } from "@/types/auth";

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const user = value as Record<string, unknown>;
  return typeof user.id === "string" && typeof user.username === "string";
}

/**
 * Edge-safe: call Nest `/api/auth/me` with an incoming Cookie header.
 * Used by middleware (no next/headers).
 */
export async function fetchCurrentUserFromCookieHeader(
  cookieHeader: string | null,
): Promise<AuthUser | null> {
  if (!cookieHeader || cookieHeader.trim().length === 0) {
    return null;
  }

  try {
    const response = await fetch(`${getNestApiOrigin()}/api/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();
    return isAuthUser(data) ? data : null;
  } catch {
    return null;
  }
}

export { isAuthUser };
