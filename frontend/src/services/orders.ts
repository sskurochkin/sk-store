import { ApiError, apiPost } from "@/services/api";
import type { CreateOrderPayload, OrderResponse } from "@/types/order";

function isOrderResponse(value: unknown): value is OrderResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const order = value as Record<string, unknown>;
  return (
    typeof order.id === "string" &&
    typeof order.status === "string" &&
    typeof order.totalPrice === "string" &&
    Array.isArray(order.items)
  );
}

/**
 * Creates an order. Client must send productId + quantity only (no prices).
 */
export async function createOrder(
  payload: CreateOrderPayload,
): Promise<OrderResponse> {
  const data = await apiPost<unknown>("/api/orders", payload);

  if (!isOrderResponse(data)) {
    throw new ApiError("Order API returned an invalid payload", 500);
  }

  return data;
}
