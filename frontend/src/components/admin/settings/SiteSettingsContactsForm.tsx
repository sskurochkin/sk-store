"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import {
  emptyStringToNull,
  siteSettingsContactsSchema,
  type SiteSettingsContactsFormValues,
} from "@/lib/admin-settings-schema";
import { revalidateSettingsCache } from "@/lib/revalidate-public-cache";
import { ApiError } from "@/services/api";
import { updateSettings } from "@/services/admin-settings";
import type { SiteSettingsApiResponse } from "@/types/site-settings";
import styles from "./SiteSettingsForm.module.css";

type SiteSettingsContactsFormProps = {
  settings: SiteSettingsApiResponse;
};

export function SiteSettingsContactsForm({
  settings,
}: SiteSettingsContactsFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsContactsFormValues>({
    resolver: zodResolver(siteSettingsContactsSchema),
    defaultValues: {
      phone: settings.phone ?? "",
      email: settings.email ?? "",
      address: settings.address ?? "",
      workingHours: settings.workingHours ?? "",
      legalOperatorName: settings.legalOperatorName ?? "",
      legalContactEmail: settings.legalContactEmail ?? "",
    },
  });

  async function onSubmit(values: SiteSettingsContactsFormValues) {
    setSubmitError(null);

    try {
      await updateSettings({
        phone: emptyStringToNull(values.phone),
        email: emptyStringToNull(values.email),
        address: emptyStringToNull(values.address),
        workingHours: emptyStringToNull(values.workingHours),
        legalOperatorName: emptyStringToNull(values.legalOperatorName),
        legalContactEmail: emptyStringToNull(values.legalContactEmail),
      });
      await revalidateSettingsCache();
      router.push("/admin/settings");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Не удалось сохранить контакты.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        id="settings-phone"
        label="Телефон"
        disabled={isSubmitting}
        error={errors.phone?.message}
        {...register("phone")}
      />
      <Input
        id="settings-email"
        label="Email"
        type="email"
        disabled={isSubmitting}
        error={errors.email?.message}
        {...register("email")}
      />
      <Textarea
        id="settings-address"
        label="Адрес"
        rows={3}
        disabled={isSubmitting}
        error={errors.address?.message}
        {...register("address")}
      />
      <Input
        id="settings-working-hours"
        label="Часы работы"
        disabled={isSubmitting}
        error={errors.workingHours?.message}
        {...register("workingHours")}
      />
      <Input
        id="settings-legal-operator"
        label="Оператор ПДн (placeholder)"
        hint="Подставляется в политику конфиденциальности"
        disabled={isSubmitting}
        error={errors.legalOperatorName?.message}
        {...register("legalOperatorName")}
      />
      <Input
        id="settings-legal-email"
        label="Email для запросов по ПДн"
        type="email"
        disabled={isSubmitting}
        error={errors.legalContactEmail?.message}
        {...register("legalContactEmail")}
      />

      <div className={styles.actions}>
        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Сохранение…" : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
