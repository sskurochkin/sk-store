"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import {
  emptyStringToNull,
  siteSettingsMapSchema,
  type SiteSettingsMapFormValues,
} from "@/lib/admin-settings-schema";
import { revalidateSettingsCache } from "@/lib/revalidate-public-cache";
import { ApiError } from "@/services/api";
import { updateSettings } from "@/services/admin-settings";
import type { SiteSettingsApiResponse } from "@/types/site-settings";
import styles from "./SiteSettingsForm.module.css";

type SiteSettingsMapFormProps = {
  settings: SiteSettingsApiResponse;
};

export function SiteSettingsMapForm({ settings }: SiteSettingsMapFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsMapFormValues>({
    resolver: zodResolver(siteSettingsMapSchema),
    defaultValues: {
      mapEnabled: settings.mapEnabled,
      mapEmbedUrl: settings.mapEmbedUrl ?? "",
      mapLinkUrl: settings.mapLinkUrl ?? "",
    },
  });

  async function onSubmit(values: SiteSettingsMapFormValues) {
    setSubmitError(null);

    const mapEmbedUrl = emptyStringToNull(values.mapEmbedUrl);
    const mapLinkUrl = emptyStringToNull(values.mapLinkUrl);
    const hasMapUrl = mapEmbedUrl !== null || mapLinkUrl !== null;

    try {
      await updateSettings({
        mapEnabled: values.mapEnabled || hasMapUrl,
        mapEmbedUrl,
        mapLinkUrl,
      });
      await revalidateSettingsCache();
      router.push("/admin/settings");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Не удалось сохранить настройки карты.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Controller
        name="mapEnabled"
        control={control}
        render={({ field }) => (
          <div className={styles.checkboxRow}>
            <input
              id="settings-map-enabled"
              type="checkbox"
              className={styles.checkboxControl}
              checked={field.value}
              disabled={isSubmitting}
              onChange={(event) => field.onChange(event.target.checked)}
              onBlur={field.onBlur}
            />
            <label className={styles.checkboxLabel} htmlFor="settings-map-enabled">
              Показывать карту на странице контактов
            </label>
          </div>
        )}
      />

      <Input
        id="settings-map-embed"
        label="URL embed (iframe src)"
        hint="Вставьте embed-ссылку из Яндекс.Карт или Google Maps, например: https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=…"
        disabled={isSubmitting}
        error={errors.mapEmbedUrl?.message}
        {...register("mapEmbedUrl")}
      />
      <Input
        id="settings-map-link"
        label="Ссылка «Открыть в картах»"
        hint="Обычная ссылка на точку в картах (не embed). Необязательно, если указан URL embed."
        disabled={isSubmitting}
        error={errors.mapLinkUrl?.message}
        {...register("mapLinkUrl")}
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
