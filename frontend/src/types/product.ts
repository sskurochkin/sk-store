export type Product = {
  id: string;
  name: string;
  alias: string;
  description: string;
  mainPhoto: string;
  gallery: string[];
  /** Decimal money serialized as a fixed 2-fraction-digit string. */
  price: string;
};
