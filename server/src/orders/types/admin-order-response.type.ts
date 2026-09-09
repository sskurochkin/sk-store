import type { OrderItemResponse, OrderResponse } from './order-response.type';

export type AdminOrderListItem = {
  id: string;
  status: OrderResponse['status'];
  /** Decimal money serialized as a fixed 2-fraction-digit string. */
  totalPrice: string;
  comment: string | null;
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminOrderResponse = AdminOrderListItem & {
  items: OrderItemResponse[];
};
