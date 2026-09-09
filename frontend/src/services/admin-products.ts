import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/services/api";
import type { Product } from "@/types/product";

export type CreateProductPayload = {
  name: string;
  alias: string;
  description: string;
  mainPhoto: string;
  gallery?: string[];
  price: number;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;

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
 * Admin product list — always fresh (no ISR cache).
 * Pass `cookie` when calling from a Server Component.
 */
export async function listProductsAdmin(
  cookie?: string,
): Promise<Product[]> {
  const data = await apiGet<unknown>("/api/products", {
    cache: "no-store",
    cookie,
    credentials: cookie ? undefined : "same-origin",
  });

  if (!Array.isArray(data)) {
    throw new ApiError("Products API returned a non-array payload", 500);
  }

  return data.filter(isProduct);
}

export async function createProduct(
  payload: CreateProductPayload,
): Promise<Product> {
  const data = await apiPost<unknown>("/api/products", payload);
  if (!isProduct(data)) {
    throw new ApiError("Create product returned an invalid payload", 500);
  }
  return data;
}

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const data = await apiPatch<unknown>(
    `/api/products/${encodeURIComponent(id)}`,
    payload,
  );
  if (!isProduct(data)) {
    throw new ApiError("Update product returned an invalid payload", 500);
  }
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiDelete(`/api/products/${encodeURIComponent(id)}`);
}
