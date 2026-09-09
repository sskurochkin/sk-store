import { ApiError, apiDelete, apiGet, apiPatch } from "@/services/api";
import type {
  AdminOrder,
  AdminOrderListItem,
  OrderStatus,
} from "@/types/order";
import { ORDER_STATUSES } from "@/constants/order-status";

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

function isAdminOrderListItem(value: unknown): value is AdminOrderListItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    isOrderStatus(item.status) &&
    typeof item.totalPrice === "string" &&
    (item.comment === null || typeof item.comment === "string") &&
    typeof item.firstName === "string" &&
    typeof item.lastName === "string" &&
    typeof item.userEmail === "string" &&
    typeof item.userPhone === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function isAdminOrder(value: unknown): value is AdminOrder {
  if (!isAdminOrderListItem(value)) {
    return false;
  }

  const item = value as AdminOrderListItem & { items?: unknown };
  return (
    Array.isArray(item.items) &&
    item.items.every((entry) => {
      if (typeof entry !== "object" || entry === null) {
        return false;
      }
      const row = entry as Record<string, unknown>;
      return (
        (row.productId === null || typeof row.productId === "string") &&
        typeof row.productName === "string" &&
        typeof row.price === "string" &&
        typeof row.quantity === "number" &&
        typeof row.totalPrice === "string"
      );
    })
  );
}

export async function listOrdersAdmin(
  cookie?: string,
): Promise<AdminOrderListItem[]> {
  const data = await apiGet<unknown>("/api/orders", {
    cache: "no-store",
    cookie,
    credentials: cookie ? undefined : "same-origin",
  });

  if (!Array.isArray(data)) {
    throw new ApiError("Orders API returned a non-array payload", 500);
  }

  return data.filter(isAdminOrderListItem);
}

export async function getOrderAdmin(
  id: string,
  cookie?: string,
): Promise<AdminOrder> {
  const data = await apiGet<unknown>(
    `/api/orders/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      cookie,
      credentials: cookie ? undefined : "same-origin",
    },
  );

  if (!isAdminOrder(data)) {
    throw new ApiError("Order API returned an invalid payload", 500);
  }

  return data;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<AdminOrder> {
  const data = await apiPatch<unknown>(
    `/api/orders/${encodeURIComponent(id)}/status`,
    { status },
  );

  if (!isAdminOrder(data)) {
    throw new ApiError("Update order status returned an invalid payload", 500);
  }

  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  await apiDelete(`/api/orders/${encodeURIComponent(id)}`);
}
