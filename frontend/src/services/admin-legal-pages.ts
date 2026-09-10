import { ApiError, apiGet, apiPatch } from "@/services/api";
import type { LegalPageContent, LegalSection } from "@/types/legal-page";

export type UpdateLegalPagePayload = {
  title?: string;
  sections?: LegalSection[];
};

function isLegalPageContent(value: unknown): value is LegalPageContent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.updatedAt === "string" &&
    Array.isArray(item.sections)
  );
}

export async function getLegalPageAdmin(
  slug: string,
  cookie?: string,
): Promise<LegalPageContent> {
  const data = await apiGet<unknown>(
    `/api/legal-pages/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
      cookie,
      credentials: cookie ? undefined : "same-origin",
    },
  );

  if (!isLegalPageContent(data)) {
    throw new ApiError("Legal page API returned an invalid payload", 500);
  }

  return data;
}

export async function updateLegalPage(
  slug: string,
  payload: UpdateLegalPagePayload,
): Promise<LegalPageContent> {
  const data = await apiPatch<unknown>(
    `/api/legal-pages/${encodeURIComponent(slug)}`,
    payload,
  );

  if (!isLegalPageContent(data)) {
    throw new ApiError("Update legal page returned an invalid payload", 500);
  }

  return data;
}
