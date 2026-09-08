/**
 * UX-only cart money helpers. Authoritative totals stay on the server.
 */

export function parsePrice(price: string): number {
  const value = Number.parseFloat(price);
  return Number.isFinite(value) ? value : 0;
}

export function formatCartMoney(amount: number): string {
  return `${amount.toFixed(2)} ₽`;
}

export function lineSubtotal(price: string, quantity: number): number {
  return parsePrice(price) * quantity;
}
