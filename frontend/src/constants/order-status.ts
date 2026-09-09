export const ORDER_STATUSES = [
  "NEW",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  NEW: "Новый",
  PROCESSING: "В обработке",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
};

export function orderStatusLabel(status: string): string {
  if (status in ORDER_STATUS_LABELS) {
    return ORDER_STATUS_LABELS[status as OrderStatusValue];
  }
  return status;
}
