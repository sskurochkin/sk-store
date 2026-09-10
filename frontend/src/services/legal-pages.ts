import { apiGet } from "@/services/api";
import type { LegalPageContent, LegalSection } from "@/types/legal-page";

function isLegalSection(value: unknown): value is LegalSection {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    Array.isArray(item.paragraphs) &&
    item.paragraphs.every((paragraph) => typeof paragraph === "string")
  );
}

function isLegalPageContent(value: unknown): value is LegalPageContent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    typeof item.title === "string" &&
    typeof item.updatedAt === "string" &&
    Array.isArray(item.sections) &&
    item.sections.every(isLegalSection)
  );
}

export async function getLegalPageBySlug(
  slug: string,
): Promise<LegalPageContent | null> {
  try {
    const data = await apiGet<unknown>(
      `/api/legal-pages/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 60, tags: [`legal-page:${slug}`] },
      },
    );

    if (!isLegalPageContent(data)) {
      console.error(`Legal page API returned invalid payload for ${slug}`);
      return null;
    }

    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`Failed to load legal page ${slug}: ${message}`);
    return null;
  }
}
