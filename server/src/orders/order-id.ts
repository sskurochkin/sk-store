/**
 * Daily human-readable order IDs: YYYYMMDD-N (Europe/Minsk calendar day).
 */

export function getMinskDateKey(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Minsk',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    throw new Error('Failed to format Minsk date for order id');
  }

  return `${year}${month}${day}`;
}

export function nextDailyOrderId(
  dateKey: string,
  existingIds: string[],
): string {
  const prefix = `${dateKey}-`;
  let maxSeq = 0;

  for (const id of existingIds) {
    if (!id.startsWith(prefix)) {
      continue;
    }
    const seq = Number(id.slice(prefix.length));
    if (Number.isInteger(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }

  return `${prefix}${maxSeq + 1}`;
}

/** Namespace for pg_advisory_xact_lock(key1, key2). */
export const ORDER_ID_ADVISORY_LOCK_KEY1 = 872_014;
