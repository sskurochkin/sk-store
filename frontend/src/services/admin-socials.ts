import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type { Social } from "@/types/social";

export type CreateSocialPayload = {
  name: string;
  link: string;
  icon: string;
};

export type UpdateSocialPayload = Partial<CreateSocialPayload>;

function isSocial(value: unknown): value is Social {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.link === "string" &&
    typeof item.icon === "string"
  );
}

/**
 * Admin socials list — always fresh (no ISR cache).
 * Pass `cookie` when calling from a Server Component.
 */
export async function listSocialsAdmin(cookie?: string): Promise<Social[]> {
  const data = await apiGet<unknown>("/api/socials", {
    cache: "no-store",
    cookie,
    credentials: cookie ? undefined : "same-origin",
  });

  if (!Array.isArray(data)) {
    throw new ApiError("Socials API returned a non-array payload", 500);
  }

  return data.filter(isSocial);
}

export async function createSocial(
  payload: CreateSocialPayload,
): Promise<Social> {
  const data = await apiPost<unknown>("/api/socials", payload);
  if (!isSocial(data)) {
    throw new ApiError("Create social returned an invalid payload", 500);
  }
  return data;
}

export async function updateSocial(
  id: string,
  payload: UpdateSocialPayload,
): Promise<Social> {
  const data = await apiPatch<unknown>(
    `/api/socials/${encodeURIComponent(id)}`,
    payload,
  );
  if (!isSocial(data)) {
    throw new ApiError("Update social returned an invalid payload", 500);
  }
  return data;
}

export async function deleteSocial(id: string): Promise<void> {
  await apiDelete(`/api/socials/${encodeURIComponent(id)}`);
}
