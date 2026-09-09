import { cookies } from "next/headers";
import { ApiError, apiGet } from "@/services/api";
import { isAuthUser } from "@/lib/auth-session";
import type { AuthUser } from "@/types/auth";

/** Cookie header string from the incoming Next.js request (server-only). */
export async function getRequestCookieHeader(): Promise<string | undefined> {
  const store = await cookies();
  const all = store.getAll();
  if (all.length === 0) {
    return undefined;
  }
  return all.map((entry) => `${entry.name}=${entry.value}`).join("; ");
}

/**
 * Server-side current user via Nest `/api/auth/me` with cookie forwarding.
 * Returns null on 401 / network failure (never throws for unauthenticated).
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookie = await getRequestCookieHeader();
    if (!cookie) {
      return null;
    }

    const data = await apiGet<unknown>("/api/auth/me", {
      cache: "no-store",
      cookie,
    });

    return isAuthUser(data) ? data : null;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    console.error(
      `getCurrentUser failed: ${error instanceof Error ? error.message : "unknown"}`,
    );
    return null;
  }
}
