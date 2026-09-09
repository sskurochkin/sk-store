import { ApiError, apiPost } from "@/services/api";
import { isAuthUser } from "@/lib/auth-session";
import type { AuthUser } from "@/types/auth";

/** Browser login — same-origin `/api/auth/login` so Set-Cookie binds to Next. */
export async function login(
  username: string,
  password: string,
): Promise<AuthUser> {
  const data = await apiPost<unknown>(
    "/api/auth/login",
    { username, password },
    { credentials: "same-origin" },
  );

  if (
    typeof data !== "object" ||
    data === null ||
    !("user" in data) ||
    !isAuthUser((data as { user: unknown }).user)
  ) {
    throw new ApiError("Login API returned an invalid payload", 500);
  }

  return (data as { user: AuthUser }).user;
}

/** Browser logout — Nest clears the HTTP-only cookie. */
export async function logout(): Promise<void> {
  await apiPost("/api/auth/logout", {}, { credentials: "same-origin" });
}
