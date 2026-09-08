export type CartItem = {
  productId: string;
  quantity: number;
  name: string;
  /** UX snapshot only — backend recalculates order totals. */
  price: string;
  mainPhoto: string;
  alias: string;
};

export type AddCartItemInput = {
  productId: string;
  quantity: number;
  name: string;
  price: string;
  mainPhoto: string;
  alias: string;
};
