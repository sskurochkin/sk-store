import { ApiError, apiDelete, apiGet, apiUpload } from "@/services/api";
import type { Media } from "@/types/media";

function isMedia(value: unknown): value is Media {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.filename === "string" &&
    typeof item.originalName === "string" &&
    typeof item.mimeType === "string" &&
    typeof item.size === "number" &&
    typeof item.path === "string" &&
    typeof item.createdAt === "string" &&
    (item.width === null || typeof item.width === "number") &&
    (item.height === null || typeof item.height === "number")
  );
}

/**
 * Admin media list — always fresh (no ISR cache).
 * Pass `cookie` when calling from a Server Component.
 */
export async function listMediaAdmin(cookie?: string): Promise<Media[]> {
  const data = await apiGet<unknown>("/api/media", {
    cache: "no-store",
    cookie,
    credentials: cookie ? undefined : "same-origin",
  });

  if (!Array.isArray(data)) {
    throw new ApiError("Media API returned a non-array payload", 500);
  }

  return data.filter(isMedia);
}

export async function uploadMediaAdmin(file: File): Promise<Media> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await apiUpload<unknown>("/api/media/upload", formData);
  if (!isMedia(data)) {
    throw new ApiError("Upload returned an invalid payload", 500);
  }

  return data;
}

export async function deleteMediaAdmin(id: string): Promise<void> {
  await apiDelete(`/api/media/${encodeURIComponent(id)}`);
}
