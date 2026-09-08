import { ApiError, apiGet } from "@/services/api";
import type { Product } from "@/types/product";

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.alias === "string" &&
    typeof item.description === "string" &&
    typeof item.mainPhoto === "string" &&
    Array.isArray(item.gallery) &&
    item.gallery.every((entry) => typeof entry === "string") &&
    typeof item.price === "string"
  );
}

/**
 * Loads the public product catalog.
 * Throws on network/API failures so the page can show ErrorState.
 */
export async function getProducts(): Promise<Product[]> {
  const data = await apiGet<unknown>("/api/products", {
    next: { revalidate: 60, tags: ["products"] },
  });

  if (!Array.isArray(data)) {
    throw new ApiError("Products API returned a non-array payload", 500);
  }

  return data.filter(isProduct);
}

/**
 * Loads a single product by alias.
 * Returns null on 404; throws on other failures.
 */
export async function getProductByAlias(alias: string): Promise<Product | null> {
  try {
    const data = await apiGet<unknown>(
      `/api/products/${encodeURIComponent(alias)}`,
      {
        next: {
          revalidate: 60,
          tags: ["products", `product:alias:${alias}`],
        },
      },
    );

    if (!isProduct(data)) {
      throw new ApiError("Product API returned an invalid payload", 500);
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
