"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import {
  emptyStringToNull,
  siteSettingsSeoSchema,
  type SiteSettingsSeoFormValues,
} from "@/lib/admin-settings-schema";
import { revalidateSettingsCache } from "@/lib/revalidate-public-cache";
import { ApiError } from "@/services/api";
import { updateSettings } from "@/services/admin-settings";
import type { SiteSettingsApiResponse } from "@/types/site-settings";
import styles from "./SiteSettingsForm.module.css";

type SiteSettingsSeoFormProps = {
  settings: SiteSettingsApiResponse;
};

export function SiteSettingsSeoForm({ settings }: SiteSettingsSeoFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsSeoFormValues>({
    resolver: zodResolver(siteSettingsSeoSchema),
    defaultValues: {
      seoMetaDescription: settings.seoMetaDescription ?? "",
      seoKeywords: settings.seoKeywords ?? "",
      seoRobotsIndex: settings.seoRobotsIndex,
      seoRobotsFollow: settings.seoRobotsFollow,
      seoOgTitle: settings.seoOgTitle ?? "",
      seoOgDescription: settings.seoOgDescription ?? "",
      seoOgImageUrl: settings.seoOgImageUrl ?? "",
      googleAnalyticsId: settings.googleAnalyticsId ?? "",
      yandexMetrikaId: settings.yandexMetrikaId ?? "",
    },
  });

  async function onSubmit(values: SiteSettingsSeoFormValues) {
    setSubmitError(null);

    try {
      await updateSettings({
        seoMetaDescription: emptyStringToNull(values.seoMetaDescription),
        seoKeywords: emptyStringToNull(values.seoKeywords),
        seoRobotsIndex: values.seoRobotsIndex,
        seoRobotsFollow: values.seoRobotsFollow,
        seoOgTitle: emptyStringToNull(values.seoOgTitle),
        seoOgDescription: emptyStringToNull(values.seoOgDescription),
        seoOgImageUrl: emptyStringToNull(values.seoOgImageUrl),
        googleAnalyticsId: emptyStringToNull(values.googleAnalyticsId),
        yandexMetrikaId: emptyStringToNull(values.yandexMetrikaId),
      });
      await revalidateSettingsCache();
      router.push("/admin/settings");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Не удалось сохранить SEO-настройки.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Textarea
        id="settings-seo-description"
        label="Meta description по умолчанию"
        hint="Используется для главной и как fallback для страниц без своего описания"
        rows={4}
        disabled={isSubmitting}
        error={errors.seoMetaDescription?.message}
        {...register("seoMetaDescription")}
      />
      <Textarea
        id="settings-seo-keywords"
        label="Keywords"
        hint="Ключевые слова через запятую, точку с запятой или с новой строки"
        rows={3}
        disabled={isSubmitting}
        error={errors.seoKeywords?.message}
        {...register("seoKeywords")}
      />

      <fieldset className={styles.checkboxGroup}>
        <legend className={styles.checkboxGroupLegend}>Robots (meta)</legend>
        <Controller
          name="seoRobotsIndex"
          control={control}
          render={({ field }) => (
            <div className={styles.checkboxRow}>
              <input
                id="settings-seo-robots-index"
                type="checkbox"
                className={styles.checkboxControl}
                checked={field.value}
                disabled={isSubmitting}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
              />
              <label
                className={styles.checkboxLabel}
                htmlFor="settings-seo-robots-index"
              >
                index — разрешить индексацию страниц
              </label>
            </div>
          )}
        />
        <Controller
          name="seoRobotsFollow"
          control={control}
          render={({ field }) => (
            <div className={styles.checkboxRow}>
              <input
                id="settings-seo-robots-follow"
                type="checkbox"
                className={styles.checkboxControl}
                checked={field.value}
                disabled={isSubmitting}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
              />
              <label
                className={styles.checkboxLabel}
                htmlFor="settings-seo-robots-follow"
              >
                follow — разрешить переход по ссылкам
              </label>
            </div>
          )}
        />
      </fieldset>

      <Input
        id="settings-seo-og-title"
        label="Open Graph — заголовок"
        hint="Если пусто — используется название сайта"
        disabled={isSubmitting}
        error={errors.seoOgTitle?.message}
        {...register("seoOgTitle")}
      />
      <Textarea
        id="settings-seo-og-description"
        label="Open Graph — описание"
        hint="Если пусто — meta description или описание сайта"
        rows={3}
        disabled={isSubmitting}
        error={errors.seoOgDescription?.message}
        {...register("seoOgDescription")}
      />
      <Input
        id="settings-seo-og-image"
        label="Open Graph — изображение (URL)"
        hint="Абсолютный URL изображения 1200×630 для соцсетей"
        disabled={isSubmitting}
        error={errors.seoOgImageUrl?.message}
        {...register("seoOgImageUrl")}
      />

      <Input
        id="settings-google-analytics"
        label="Google Analytics (опционально)"
        hint="ID счётчика GA4 (G-…) или Universal Analytics (UA-…)"
        disabled={isSubmitting}
        error={errors.googleAnalyticsId?.message}
        {...register("googleAnalyticsId")}
      />
      <Input
        id="settings-yandex-metrika"
        label="Яндекс.Метрика (опционально)"
        hint="Числовой ID счётчика. Загружается только при согласии на analytics в cookie-баннере"
        disabled={isSubmitting}
        error={errors.yandexMetrikaId?.message}
        {...register("yandexMetrikaId")}
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
