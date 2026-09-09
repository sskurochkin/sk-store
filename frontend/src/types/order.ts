export type CreateOrderItemPayload = {
  productId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone: string;
  comment?: string;
  items: CreateOrderItemPayload[];
};

export type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

export type OrderItemResponse = {
  productId: string | null;
  productName: string;
  price: string;
  quantity: number;
  totalPrice: string;
};

/** Public create-order response (no customer PII). */
export type OrderResponse = {
  id: string;
  status: OrderStatus;
  totalPrice: string;
  comment?: string | null;
  items: OrderItemResponse[];
};

export type AdminOrderListItem = {
  id: string;
  status: OrderStatus;
  totalPrice: string;
  comment: string | null;
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrder = AdminOrderListItem & {
  items: OrderItemResponse[];
};
