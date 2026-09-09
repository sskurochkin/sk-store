import { z } from "zod";

export const adminSocialFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите название")
    .max(100, "Название слишком длинное"),
  link: z
    .string()
    .trim()
    .min(1, "Укажите ссылку")
    .max(2_000, "Ссылка слишком длинная")
    .url("Укажите корректный URL")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "Ссылка должна начинаться с http:// или https://",
    ),
  icon: z
    .string()
    .trim()
    .min(1, "Укажите icon (имя / URL / ключ)")
    .max(200, "Icon слишком длинный"),
});

export type AdminSocialFormValues = z.infer<typeof adminSocialFormSchema>;
