"use server";

import { revalidateTag } from "next/cache";
import {
  newsCacheTags,
  productCacheTags,
  socialsCacheTags,
} from "@/lib/cache-tags";
import { getCurrentUser } from "@/services/auth-server";

async function requireAdmin(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
}

function revalidateAllowlistedTags(tags: readonly string[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

/**
 * Invalidate public product list + alias detail caches.
 * Pass old and new aliases on update so both detail pages refresh.
 */
export async function revalidateProductsCache(input: {
  aliases: string[];
}): Promise<void> {
  await requireAdmin();
  revalidateAllowlistedTags(productCacheTags(input.aliases));
}

/**
 * Invalidate public news list + alias detail caches.
 */
export async function revalidateNewsCache(input: {
  aliases: string[];
}): Promise<void> {
  await requireAdmin();
  revalidateAllowlistedTags(newsCacheTags(input.aliases));
}

/**
 * Invalidate public socials (footer/contacts) and reserved settings tag.
 */
export async function revalidateSocialsCache(): Promise<void> {
  await requireAdmin();
  revalidateAllowlistedTags(socialsCacheTags());
}
