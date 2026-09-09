/**
 * Deterministic public date formatting (Europe/Minsk).
 * Use on the server to avoid hydration locale mismatches.
 */
export function formatDisplayDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
