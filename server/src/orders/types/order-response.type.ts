export type OrderItemResponse = {
  productId: string | null;
  productName: string;
  /** Decimal money serialized as a fixed 2-fraction-digit string. */
  price: string;
  quantity: number;
  /** Decimal money serialized as a fixed 2-fraction-digit string. */
  totalPrice: string;
};

export type OrderResponse = {
  id: string;
  status: 'NEW' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  /** Decimal money serialized as a fixed 2-fraction-digit string. */
  totalPrice: string;
  comment: string | null;
  items: OrderItemResponse[];
};
