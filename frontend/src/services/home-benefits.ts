import { apiGet } from "@/services/api";
import { HOME_BENEFITS } from "@/constants/home-benefits";
import type { HomeBenefit } from "@/types/home-benefit";

function isHomeBenefit(value: unknown): value is HomeBenefit {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    typeof item.icon === "string" &&
    typeof item.sortOrder === "number"
  );
}

/**
 * Loads home page benefits. Falls back to static defaults when API fails or is empty.
 */
export async function getHomeBenefits(): Promise<HomeBenefit[]> {
  try {
    const data = await apiGet<unknown>("/api/home-benefits", {
      next: { revalidate: 60, tags: ["home-benefits"] },
    });

    if (!Array.isArray(data)) {
      console.error("Home benefits API returned a non-array payload");
      return mapFallbackBenefits();
    }

    const items = data.filter(isHomeBenefit);
    return items.length > 0 ? items : mapFallbackBenefits();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(`Failed to load home benefits: ${message}`);
    return mapFallbackBenefits();
  }
}

function mapFallbackBenefits(): HomeBenefit[] {
  return HOME_BENEFITS.map((item, index) => ({
    ...item,
    sortOrder: index,
  }));
}
