"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { PersonalDataConsentLabel } from "@/components/legal/PersonalDataConsentLabel";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import {
  formatBelarusPhoneMask,
  toBelarusPhoneE164,
} from "@/lib/belarus-phone";
import {
  contactRequestFormSchema,
  type ContactRequestFormValues,
} from "@/lib/contact-request-schema";
import { ApiError } from "@/services/api";
import { createContactRequest } from "@/services/contact-requests";
import styles from "./ContactRequestForm.module.css";

export function ContactRequestForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactRequestFormValues>({
    resolver: zodResolver(contactRequestFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
      consent: false,
    },
  });

  async function onSubmit(values: ContactRequestFormValues) {
    setSubmitError(null);

    try {
      await createContactRequest({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: toBelarusPhoneE164(values.phone),
        email: values.email,
        message: values.message,
        consent: true,
      });

      reset();
      setSubmitted(true);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 429) {
          setSubmitError("Пожалуйста, попробуйте снова немного позже.");
          return;
        }
        if (error.status === 400) {
          setSubmitError(error.message);
          return;
        }
        setSubmitError("Не удалось отправить заявку. Попробуйте ещё раз.");
        return;
      }

      setSubmitError("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  }

  if (submitted) {
    return (
      <div className={styles.success} role="status">
        <h2 id="contact-request-heading" className={styles.successTitle}>
          Заявка принята
        </h2>
        <p className={styles.successText}>
          Спасибо! Мы получили ваше сообщение и ответим при необходимости.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setSubmitted(false);
            setSubmitError(null);
          }}
        >
          Отправить ещё одно сообщение
        </Button>
      </div>
    );
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="contact-request-heading"
    >
      <h2 id="contact-request-heading" className={styles.title}>
        Форма заявки
      </h2>
      <p className={styles.lead}>
        Оставьте контакты и сообщение — мы свяжемся с вами.
      </p>

      <div className={styles.grid}>
        <Input
          id="contact-first-name"
          label="Имя"
          autoComplete="given-name"
          required
          disabled={isSubmitting}
          error={errors.firstName?.message}
          {...register("firstName")}
        />
        <Input
          id="contact-last-name"
          label="Фамилия"
          autoComplete="family-name"
          required
          disabled={isSubmitting}
          error={errors.lastName?.message}
          {...register("lastName")}
        />
        <div className={styles.gridFull}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                id="contact-phone"
                label="Телефон"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+375 (29) 123-45-67"
                hint="Формат: +375 (XX) XXX-XX-XX"
                required
                disabled={isSubmitting}
                error={errors.phone?.message}
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(event) => {
                  field.onChange(formatBelarusPhoneMask(event.target.value));
                }}
              />
            )}
          />
        </div>
        <div className={styles.gridFull}>
          <Input
            id="contact-email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            disabled={isSubmitting}
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
        <div className={styles.gridFull}>
          <Textarea
            id="contact-message"
            label="Сообщение"
            rows={5}
            required
            disabled={isSubmitting}
            error={errors.message?.message}
            {...register("message")}
          />
        </div>
        <div className={styles.gridFull}>
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="contact-consent"
                label={<PersonalDataConsentLabel />}
                required
                disabled={isSubmitting}
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                error={errors.consent?.message}
              />
            )}
          />
        </div>
      </div>

      <div className={styles.submitRow}>
        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Отправка…" : "Отправить заявку"}
        </Button>
      </div>
    </form>
  );
}
