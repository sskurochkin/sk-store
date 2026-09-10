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
  siteSettingsGeneralSchema,
  type SiteSettingsGeneralFormValues,
} from "@/lib/admin-settings-schema";
import { revalidateSettingsCache } from "@/lib/revalidate-public-cache";
import { ApiError } from "@/services/api";
import { updateSettings } from "@/services/admin-settings";
import type { SiteSettingsApiResponse } from "@/types/site-settings";
import styles from "./SiteSettingsForm.module.css";

type SiteSettingsGeneralFormProps = {
  settings: SiteSettingsApiResponse;
};

export function SiteSettingsGeneralForm({
  settings,
}: SiteSettingsGeneralFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsGeneralFormValues>({
    resolver: zodResolver(siteSettingsGeneralSchema),
    defaultValues: {
      siteName: settings.siteName,
      tagline: settings.tagline ?? "",
      description: settings.description,
      footerBlurb: settings.footerBlurb ?? "",
      logoUrl: settings.logoUrl ?? "",
    },
  });

  async function onSubmit(values: SiteSettingsGeneralFormValues) {
    setSubmitError(null);

    try {
      await updateSettings({
        siteName: values.siteName,
        tagline: emptyStringToNull(values.tagline),
        description: values.description,
        footerBlurb: emptyStringToNull(values.footerBlurb),
        logoUrl: emptyStringToNull(values.logoUrl),
      });
      await revalidateSettingsCache();
      router.push("/admin/settings");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Не удалось сохранить настройки.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        id="settings-site-name"
        label="Название сайта"
        required
        disabled={isSubmitting}
        error={errors.siteName?.message}
        {...register("siteName")}
      />
      <Input
        id="settings-logo-url"
        label="Логотип (URL)"
        hint="Ссылка на изображение логотипа для шапки сайта"
        disabled={isSubmitting}
        error={errors.logoUrl?.message}
        {...register("logoUrl")}
      />
      <Input
        id="settings-tagline"
        label="Слоган"
        hint="Короткая фраза для hero-блока"
        disabled={isSubmitting}
        error={errors.tagline?.message}
        {...register("tagline")}
      />
      <Textarea
        id="settings-description"
        label="Описание сайта"
        rows={4}
        required
        disabled={isSubmitting}
        error={errors.description?.message}
        {...register("description")}
      />
      <Textarea
        id="settings-footer-blurb"
        label="Текст в подвале"
        rows={3}
        disabled={isSubmitting}
        error={errors.footerBlurb?.message}
        {...register("footerBlurb")}
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
