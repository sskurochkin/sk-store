import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type { HomeBenefit } from "@/types/home-benefit";

export type CreateHomeBenefitPayload = {
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
};

export type UpdateHomeBenefitPayload = Partial<CreateHomeBenefitPayload>;

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

export async function listHomeBenefitsAdmin(
  cookie?: string,
): Promise<HomeBenefit[]> {
  const data = await apiGet<unknown>("/api/home-benefits", {
    cache: "no-store",
    cookie,
    credentials: cookie ? undefined : "same-origin",
  });

  if (!Array.isArray(data)) {
    throw new ApiError("Home benefits API returned a non-array payload", 500);
  }

  return data.filter(isHomeBenefit);
}

export async function createHomeBenefit(
  payload: CreateHomeBenefitPayload,
): Promise<HomeBenefit> {
  const data = await apiPost<unknown>("/api/home-benefits", payload);
  if (!isHomeBenefit(data)) {
    throw new ApiError("Create home benefit returned an invalid payload", 500);
  }
  return data;
}

export async function updateHomeBenefit(
  id: string,
  payload: UpdateHomeBenefitPayload,
): Promise<HomeBenefit> {
  const data = await apiPatch<unknown>(
    `/api/home-benefits/${encodeURIComponent(id)}`,
    payload,
  );
  if (!isHomeBenefit(data)) {
    throw new ApiError("Update home benefit returned an invalid payload", 500);
  }
  return data;
}

export async function deleteHomeBenefit(id: string): Promise<void> {
  await apiDelete(`/api/home-benefits/${encodeURIComponent(id)}`);
}
