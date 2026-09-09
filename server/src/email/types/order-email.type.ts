export type OrderEmailItem = {
  productName: string;
  quantity: number;
  /** Fixed 2-decimal money string, e.g. "4.50" */
  unitPrice: string;
  /** Fixed 2-decimal money string, e.g. "9.00" */
  lineTotal: string;
};

export type OrderEmailPayload = {
  orderId: string;
  status: string;
  firstName: string;
  lastName: string;
  userEmail: string;
  userPhone: string;
  comment?: string | null;
  /** Fixed 2-decimal money string */
  totalPrice: string;
  items: OrderEmailItem[];
};

export type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};
