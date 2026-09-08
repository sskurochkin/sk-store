import { apiGet } from "@/services/api";
import type { Social } from "@/types/social";

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
 * Loads public social links. Never throws — returns [] on failure
 * so the public layout stays available.
 */
export async function getSocials(): Promise<Social[]> {
  try {
    const data = await apiGet<unknown>("/api/socials", {
      next: { revalidate: 60, tags: ["socials"] },
    });

    if (!Array.isArray(data)) {
      console.error("Socials API returned a non-array payload");
      return [];
    }

    return data.filter(isSocial);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`Failed to load socials: ${message}`);
    return [];
  }
}
