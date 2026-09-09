import { z } from "zod";
import { isCompleteBelarusPhone } from "@/lib/belarus-phone";

export const checkoutFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Укажите имя")
    .max(100, "Имя слишком длинное"),
  lastName: z
    .string()
    .trim()
    .min(1, "Укажите фамилию")
    .max(100, "Фамилия слишком длинная"),
  userEmail: z
    .string()
    .trim()
    .min(1, "Укажите email")
    .email("Некорректный email")
    .max(255, "Email слишком длинный"),
  userPhone: z
    .string()
    .trim()
    .min(1, "Укажите телефон")
    .refine(isCompleteBelarusPhone, {
      message: "Введите белорусский номер в формате +375 (XX) XXX-XX-XX",
    }),
  comment: z
    .string()
    .max(1000, "Комментарий слишком длинный")
    .optional(),
  consent: z.boolean().refine((value) => value === true, {
    message: "Нужно согласие на обработку персональных данных",
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
