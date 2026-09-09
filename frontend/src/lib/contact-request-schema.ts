import { z } from "zod";
import { isCompleteBelarusPhone } from "@/lib/belarus-phone";

export const contactRequestFormSchema = z.object({
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
  phone: z
    .string()
    .trim()
    .min(1, "Укажите телефон")
    .refine(isCompleteBelarusPhone, {
      message: "Введите белорусский номер в формате +375 (XX) XXX-XX-XX",
    }),
  email: z
    .string()
    .trim()
    .min(1, "Укажите email")
    .email("Некорректный email")
    .max(255, "Email слишком длинный"),
  message: z
    .string()
    .trim()
    .min(10, "Сообщение слишком короткое")
    .max(5000, "Сообщение слишком длинное"),
  consent: z.boolean().refine((value) => value === true, {
    message: "Нужно согласие на обработку персональных данных",
  }),
});

export type ContactRequestFormValues = z.infer<typeof contactRequestFormSchema>;
