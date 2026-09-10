import type { LegalSection } from "@/types/legal-page";
import type { SiteSettingsPublic } from "@/types/site-settings";

export function applyLegalPlaceholders(
  sections: LegalSection[],
  settings: SiteSettingsPublic,
): LegalSection[] {
  const operatorName =
    settings.legal.operatorName ?? "[указать наименование и реквизиты оператора]";
  const contactEmail =
    settings.legal.contactEmail ?? "[email / почтовый адрес / иные контакты оператора]";

  return sections.map((section) => ({
    ...section,
    paragraphs: section.paragraphs.map((paragraph) =>
      paragraph
        .replace(
          "[указать наименование и реквизиты оператора]",
          operatorName,
        )
        .replace(
          "[email / почтовый адрес / иные контакты оператора]",
          contactEmail,
        ),
    ),
  }));
}
