import {
  newsCacheTags,
  productCacheTags,
  sanitizeAliases,
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

console.log("cache-tags checks passed");
