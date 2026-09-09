export const CONTACT_REQUEST_STATUSES = [
  "NEW",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type ContactRequestStatusValue =
  (typeof CONTACT_REQUEST_STATUSES)[number];

export const CONTACT_REQUEST_STATUS_LABELS: Record<
  ContactRequestStatusValue,
  string
> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  COMPLETED: "Завершён",
  CANCELLED: "Отменён",
};

export function contactRequestStatusLabel(status: string): string {
  if (status in CONTACT_REQUEST_STATUS_LABELS) {
    return CONTACT_REQUEST_STATUS_LABELS[status as ContactRequestStatusValue];
  }
  return status;
}
