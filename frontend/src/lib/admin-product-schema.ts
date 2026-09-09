import { z } from "zod";

/** Mirrors server PRODUCT_ALIAS_PATTERN. */
export const PRODUCT_ALIAS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}

export const adminProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Укажите название")
    .max(200, "Название слишком длинное"),
  alias: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Укажите alias")
    .max(120, "Alias слишком длинный")
    .regex(
      PRODUCT_ALIAS_PATTERN,
      "Alias: строчные латинские буквы, цифры и дефисы (например sourdough-loaf)",
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
  gallery: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .min(1, "URL не может быть пустым")
          .max(2_000, "Ссылка слишком длинная"),
      }),
    )
    .max(50, "Слишком много изображений в галерее"),
  price: z
    .number({ error: "Укажите цену" })
    .gt(0, "Цена должна быть больше 0")
    .refine(hasAtMostTwoDecimals, "Не больше 2 знаков после запятой"),
});

export type AdminProductFormValues = z.infer<typeof adminProductFormSchema>;
