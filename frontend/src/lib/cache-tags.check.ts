import {
  homeBenefitsCacheTags,
  legalPageCacheTags,
  newsCacheTags,
  productCacheTags,
  sanitizeAliases,
  settingsCacheTags,
  socialsCacheTags,
} from "./cache-tags";

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}: expected ${e}, got ${a}`);
  }
}

assertEqual(
  sanitizeAliases(["  Loaf  ", "loaf", "BAD Alias", "", "sourdough-loaf"]),
  ["loaf", "sourdough-loaf"],
  "sanitizeAliases",
);

assertEqual(
  productCacheTags(["croissant", "croissant", "bad alias"]),
  ["products", "product:alias:croissant"],
  "productCacheTags",
);

assertEqual(
  newsCacheTags(["spring-menu"]),
  ["news", "news:alias:spring-menu"],
  "newsCacheTags",
);

assertEqual(socialsCacheTags(), ["socials", "settings"], "socialsCacheTags");

assertEqual(settingsCacheTags(), ["settings"], "settingsCacheTags");

assertEqual(
  homeBenefitsCacheTags(),
  ["home-benefits"],
  "homeBenefitsCacheTags",
);

assertEqual(
  legalPageCacheTags(["privacy-policy", "cookie-policy"]),
  ["legal-page:privacy-policy", "legal-page:cookie-policy"],
  "legalPageCacheTags",
);

console.log("cache-tags checks passed");
