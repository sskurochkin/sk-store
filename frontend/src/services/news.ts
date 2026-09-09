import { ApiError, apiGet } from "@/services/api";
import type { News } from "@/types/news";

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
    item.tags.every((tag) => typeof tag === "string") &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

/**
 * Loads the public news list.
 * Throws on network/API failures so the page can show ErrorState.
 */
export async function getNewsList(): Promise<News[]> {
  const data = await apiGet<unknown>("/api/news", {
    next: { revalidate: 60, tags: ["news"] },
  });

  if (!Array.isArray(data)) {
    throw new ApiError("News API returned a non-array payload", 500);
  }

  return data.filter(isNews);
}

/**
 * Loads a single news item by alias.
 * Returns null on 404; throws on other failures.
 */
export async function getNewsByAlias(alias: string): Promise<News | null> {
  try {
    const data = await apiGet<unknown>(
      `/api/news/${encodeURIComponent(alias)}`,
      {
        next: {
          revalidate: 60,
          tags: ["news", `news:alias:${alias}`],
        },
      },
    );

    if (!isNews(data)) {
      throw new ApiError("News API returned an invalid payload", 500);
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/** Other news items that share at least one tag with the current article. */
export function getRelatedNewsByTags(
  current: News,
  all: News[],
): News[] {
  if (current.tags.length === 0) {
    return [];
  }

  const tagSet = new Set(current.tags.map((tag) => tag.toLowerCase()));

  return all.filter(
    (item) =>
      item.id !== current.id &&
      item.tags.some((tag) => tagSet.has(tag.toLowerCase())),
  );
}
