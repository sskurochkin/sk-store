import { z } from "zod";

/** Mirrors server NEWS_ALIAS_PATTERN. */
export const NEWS_ALIAS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const adminNewsFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Укажите заголовок")
    .max(200, "Заголовок слишком длинный"),
  alias: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Укажите alias")
    .max(120, "Alias слишком длинный")
    .regex(
      NEWS_ALIAS_PATTERN,
      "Alias: строчные латинские буквы, цифры и дефисы (например autumn-special)",
    ),
  description: z
    .string()
    .trim()
    .min(1, "Укажите описание")
    .max(10_000, "Описание слишком длинное"),
  mainPhoto: z
    .string()
    .trim()
    .min(1, "Укажите main photo (URL или ключ)")
    .max(2_000, "Ссылка слишком длинная"),
  content: z
    .string()
    .max(100_000, "Содержимое слишком длинное")
    .refine((value) => {
      const text = value
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      return text.length > 0;
    }, "Укажите содержимое"),
  tags: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(1, "Тег не может быть пустым")
          .max(40, "Тег слишком длинный"),
      }),
    )
    .max(20, "Не больше 20 тегов"),
});

export type AdminNewsFormValues = z.infer<typeof adminNewsFormSchema>;
