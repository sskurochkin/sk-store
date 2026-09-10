import { z } from "zod";

export const adminHomeBenefitFormSchema = z.object({
  title: z.string().trim().min(1, "Укажите заголовок").max(200),
  description: z
    .string()
    .trim()
    .min(1, "Укажите описание")
    .max(2_000, "Описание слишком длинное"),
  icon: z
    .string()
    .trim()
    .min(1, "Укажите icon")
    .max(200, "Icon слишком длинный"),
  sortOrder: z
    .number({ error: "Укажите число" })
    .int("Укажите целое число")
    .min(0, "Минимум 0")
    .max(999, "Максимум 999"),
});

export type AdminHomeBenefitFormValues = z.infer<
  typeof adminHomeBenefitFormSchema
>;
