/**
 * Belarus phone helpers.
 * Canonical storage / API value: +375XXXXXXXXX (12 digits with country code).
 * Display mask: +375 (XX) XXX-XX-XX
 */

const MAX_DIGITS = 12; // 375 + 9 national digits

export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeBelarusDigits(rawDigits: string): string {
  let digits = rawDigits;

  if (digits.startsWith("80")) {
    digits = `375${digits.slice(2)}`;
  } else if (digits.startsWith("0") && !digits.startsWith("375")) {
    digits = `375${digits.slice(1)}`;
  } else if (
    !digits.startsWith("375") &&
    /^(25|29|33|44)/.test(digits)
  ) {
    digits = `375${digits}`;
  } else if (digits.length > 0 && !digits.startsWith("3")) {
    digits = `375${digits}`;
  }

  return digits.slice(0, MAX_DIGITS);
}

/** Formats raw / partial input into the Belarus display mask. */
export function formatBelarusPhoneMask(value: string): string {
  const rawDigits = extractPhoneDigits(value);
  if (rawDigits.length === 0) {
    return "";
  }

  const digits = normalizeBelarusDigits(rawDigits);
  const national = digits.startsWith("375") ? digits.slice(3) : "";

  let result = "+375";
  if (national.length === 0) {
    return result;
  }

  result += ` (${national.slice(0, 2)}`;
  if (national.length < 2) {
    return result;
  }
  result += ")";

  if (national.length === 2) {
    return result;
  }

  result += ` ${national.slice(2, 5)}`;
  if (national.length <= 5) {
    return result;
  }

  result += `-${national.slice(5, 7)}`;
  if (national.length <= 7) {
    return result;
  }

  return `${result}-${national.slice(7, 9)}`;
}

/** Returns E.164-like +375… or empty if incomplete. */
export function toBelarusPhoneE164(value: string): string {
  const digits = normalizeBelarusDigits(extractPhoneDigits(value));
  if (digits.length !== MAX_DIGITS || !digits.startsWith("375")) {
    return digits.length > 0 ? `+${digits}` : "";
  }
  return `+${digits}`;
}

export function isCompleteBelarusPhone(value: string): boolean {
  return /^\+375\d{9}$/.test(toBelarusPhoneE164(value));
}
