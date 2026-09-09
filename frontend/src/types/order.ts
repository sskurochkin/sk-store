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

export type OrderItemResponse = {
  productId: string | null;
  productName: string;
  price: string;
  quantity: number;
  totalPrice: string;
};

export type OrderResponse = {
  id: string;
  status: "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  totalPrice: string;
  comment?: string | null;
  items: OrderItemResponse[];
};
