/** Public Next.js cache tag names used by fetch helpers. */

export const CACHE_TAGS = {
  products: "products",
  news: "news",
  socials: "socials",
  settings: "settings",
  homeBenefits: "home-benefits",
} as const;

/** Same pattern as product/news admin aliases. */
const ALIAS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function productAliasTag(alias: string): string {
  return `product:alias:${alias}`;
}

export function newsAliasTag(alias: string): string {
  return `news:alias:${alias}`;
}

/**
 * Normalize alias inputs for revalidation: trim, drop empties, dedupe,
 * keep only allowlisted alias shapes (blocks forged tag fragments).
 */
export function sanitizeAliases(aliases: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of aliases) {
    const alias = raw.trim().toLowerCase();
    if (!alias || !ALIAS_PATTERN.test(alias) || seen.has(alias)) {
      continue;
    }
    seen.add(alias);
    result.push(alias);
  }

  return result;
}

/** Tags to revalidate for product mutations (collection + alias details). */
export function productCacheTags(aliases: readonly string[]): string[] {
  return [
    CACHE_TAGS.products,
    ...sanitizeAliases(aliases).map(productAliasTag),
  ];
}

/** Tags to revalidate for news mutations. */
export function newsCacheTags(aliases: readonly string[]): string[] {
  return [CACHE_TAGS.news, ...sanitizeAliases(aliases).map(newsAliasTag)];
}

/** Tags to revalidate for socials mutations. */
export function socialsCacheTags(): string[] {
  return [CACHE_TAGS.socials, CACHE_TAGS.settings];
}

/** Tags to revalidate for site settings mutations. */
export function settingsCacheTags(): string[] {
  return [CACHE_TAGS.settings];
}

/** Tags to revalidate for home benefits mutations. */
export function homeBenefitsCacheTags(): string[] {
  return [CACHE_TAGS.homeBenefits];
}

const LEGAL_PAGE_SLUG_PATTERN = /^(privacy-policy|cookie-policy)$/;

export function legalPageSlugTag(slug: string): string {
  if (!LEGAL_PAGE_SLUG_PATTERN.test(slug)) {
    throw new Error("Invalid legal page slug");
  }
  return `legal-page:${slug}`;
}

export function legalPageCacheTags(slugs: readonly string[]): string[] {
  return slugs.map((slug) => legalPageSlugTag(slug));
}
