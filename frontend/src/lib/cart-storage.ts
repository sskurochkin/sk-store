import { CART_STORAGE_KEY, MAX_QUANTITY, MIN_QUANTITY } from "@/constants/cart";
import type { CartItem } from "@/types/cart";

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity >= MIN_QUANTITY &&
    item.quantity <= MAX_QUANTITY &&
    typeof item.name === "string" &&
    typeof item.price === "string" &&
    typeof item.mainPhoto === "string" &&
    typeof item.alias === "string"
  );
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return MIN_QUANTITY;
  }
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.round(quantity)));
}

/**
 * Loads cart items from localStorage. Invalid / missing data → [].
 * Call only in the browser after mount.
 */
export function loadCartItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCartItem);
  } catch {
    return [];
  }
}

/**
 * Persists cart items to localStorage.
 * Call only in the browser after mount.
 */
export function saveCartItems(items: CartItem[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota / private mode — keep in-memory cart only.
  }
}
