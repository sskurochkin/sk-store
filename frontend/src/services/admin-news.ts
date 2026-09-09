import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type { News } from "@/types/news";

export type CreateNewsPayload = {
  title: string;
  alias: string;
  description: string;
  mainPhoto: string;
  content: string;
  tags?: string[];
};

export type UpdateNewsPayload = Partial<CreateNewsPayload>;

function isNews(value: unknown): value is News {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.alias === "string" &&
    typeof item.description === "string" &&
    typeof item.mainPhoto === "string" &&
    typeof item.content === "string" &&
    Array.isArray(item.tags) &&
    item.tags.every((entry) => typeof entry === "string") &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

/**
 * Admin news list — always fresh (no ISR cache).
 * Pass `cookie` when calling from a Server Component.
 */
export async function listNewsAdmin(cookie?: string): Promise<News[]> {
  const data = await apiGet<unknown>("/api/news", {
    cache: "no-store",
    cookie,
    credentials: cookie ? undefined : "same-origin",
  });

  if (!Array.isArray(data)) {
    throw new ApiError("News API returned a non-array payload", 500);
  }

  return data.filter(isNews);
}

export async function createNews(payload: CreateNewsPayload): Promise<News> {
  const data = await apiPost<unknown>("/api/news", payload);
  if (!isNews(data)) {
    throw new ApiError("Create news returned an invalid payload", 500);
  }
  return data;
}

export async function updateNews(
  id: string,
  payload: UpdateNewsPayload,
): Promise<News> {
  const data = await apiPatch<unknown>(
    `/api/news/${encodeURIComponent(id)}`,
    payload,
  );
  if (!isNews(data)) {
    throw new ApiError("Update news returned an invalid payload", 500);
  }
  return data;
}

export async function deleteNews(id: string): Promise<void> {
  await apiDelete(`/api/news/${encodeURIComponent(id)}`);
}
