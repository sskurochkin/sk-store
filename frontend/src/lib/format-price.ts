/**
 * Formats API price string for public UX display.
 * Authoritative order totals remain server-side.
 */
export function formatPrice(price: string): string {
  return `${price} ₽`;
}
