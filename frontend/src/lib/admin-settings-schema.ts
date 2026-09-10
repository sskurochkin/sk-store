import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Не более ${max} символов`);

const optionalEmail = z
  .string()
  .trim()
  .max(320)
  .refine(
    (value) => value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Укажите корректный email",
  );

const optionalUrl = z
  .string()
  .trim()
  .max(2_000)
  .refine(
    (value) =>
      value.length === 0 ||
      (value.startsWith("http://") || value.startsWith("https://")),
    "URL должен начинаться с http:// или https://",
  );

export const siteSettingsGeneralSchema = z.object({
  siteName: z.string().trim().min(1, "Укажите название").max(200),
  tagline: optionalText(300),
  description: z.string().trim().min(1, "Укажите описание").max(5_000),
  footerBlurb: optionalText(2_000),
  logoUrl: optionalUrl,
});

export const siteSettingsContactsSchema = z.object({
  phone: optionalText(100),
  email: optionalEmail,
  address: optionalText(1_000),
  workingHours: optionalText(500),
  legalOperatorName: optionalText(500),
  legalContactEmail: optionalEmail,
});

export const siteSettingsMapSchema = z.object({
  mapEnabled: z.boolean(),
  mapEmbedUrl: optionalUrl,
  mapLinkUrl: optionalUrl,
});

const optionalAnalyticsId = z
  .string()
  .trim()
  .max(50)
  .refine(
    (value) => value.length === 0 || /^(G-[A-Z0-9]+|UA-\d+-\d+)$/.test(value),
    "Укажите ID вида G-XXXXXXXX или UA-XXXXXXXX-X",
  );

const optionalMetrikaId = z
  .string()
  .trim()
  .max(20)
  .refine(
    (value) => value.length === 0 || /^\d+$/.test(value),
    "ID Яндекс.Метрики — только цифры",
  );

export const siteSettingsSeoSchema = z.object({
  seoMetaDescription: optionalText(5_000),
  seoKeywords: optionalText(2_000),
  seoRobotsIndex: z.boolean(),
  seoRobotsFollow: z.boolean(),
  seoOgTitle: optionalText(300),
  seoOgDescription: optionalText(5_000),
  seoOgImageUrl: optionalUrl,
  googleAnalyticsId: optionalAnalyticsId,
  yandexMetrikaId: optionalMetrikaId,
});

export type SiteSettingsGeneralFormValues = z.infer<
  typeof siteSettingsGeneralSchema
>;
export type SiteSettingsContactsFormValues = z.infer<
  typeof siteSettingsContactsSchema
>;
export type SiteSettingsMapFormValues = z.infer<typeof siteSettingsMapSchema>;
export type SiteSettingsSeoFormValues = z.infer<typeof siteSettingsSeoSchema>;

export function emptyStringToNull(value: string): string | null {
  return value.trim().length > 0 ? value.trim() : null;
}
