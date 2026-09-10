import type { Metadata } from "next";
import { SITE_NAME } from "@/constants/site";

export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  /** Pathname starting with `/` (resolved against `metadataBase`). */
  path: string;
  /** Absolute http(s) image URL only; storage keys are omitted. */
  image?: string | null;
  /** When true, title is not wrapped by the root `%s · Site` template. */
  absoluteTitle?: boolean;
  robots?: Metadata["robots"];
  /** Override Open Graph / Twitter site name (defaults to SITE_NAME). */
  siteName?: string;
};

/**
 * Shared public-page metadata: canonical + Open Graph + Twitter.
 */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const imageUrl =
    input.image && isAbsoluteHttpUrl(input.image) ? input.image : undefined;
  const images = imageUrl ? [{ url: imageUrl }] : undefined;
  const siteName = input.siteName?.trim() || SITE_NAME;

  return {
    title: input.absoluteTitle
      ? { absolute: input.title }
      : input.title,
    description: input.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName,
      title: input.title,
      description: input.description,
      url: path,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    ...(input.robots !== undefined ? { robots: input.robots } : {}),
  };
}
