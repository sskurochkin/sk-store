/** Parses comma/semicolon/newline-separated keywords into a unique trimmed list. */
export function parseSeoKeywords(value?: string | null): string[] | undefined {
  if (value == null) {
    return undefined;
  }

  const keywords = value
    .split(/[,;\n]+/)
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);

  if (keywords.length === 0) {
    return undefined;
  }

  return [...new Set(keywords)];
}
