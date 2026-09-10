import { applyLegalPlaceholders } from "@/lib/apply-legal-placeholders";
import { getLegalPageBySlug } from "@/services/legal-pages";
import { getSiteSettings } from "@/services/settings";
import type { LegalSection } from "@/types/legal-page";

export async function resolveLegalPage(input: {
  slug: string;
  fallbackTitle: string;
  fallbackSections: LegalSection[];
}): Promise<{ title: string; sections: LegalSection[] }> {
  const [fromApi, settings] = await Promise.all([
    getLegalPageBySlug(input.slug),
    getSiteSettings(),
  ]);

  const sections = applyLegalPlaceholders(
    fromApi?.sections ?? input.fallbackSections,
    settings,
  );

  return {
    title: fromApi?.title ?? input.fallbackTitle,
    sections,
  };
}
