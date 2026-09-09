"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import {
  adminSocialFormSchema,
  type AdminSocialFormValues,
} from "@/lib/admin-social-schema";
import { ApiError } from "@/services/api";
import { createSocial, updateSocial } from "@/services/admin-socials";
import { revalidateSocialsCache } from "@/lib/revalidate-public-cache";
import type { Social } from "@/types/social";
import styles from "./SocialForm.module.css";

type SocialFormProps =
  | { mode: "create"; social?: undefined }
  | { mode: "edit"; social: Social };

export function SocialForm(props: SocialFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues: AdminSocialFormValues =
    props.mode === "edit"
      ? {
          name: props.social.name,
          link: props.social.link,
          icon: props.social.icon,
        }
      : {
          name: "",
          link: "",
          icon: "",
        };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminSocialFormValues>({
    resolver: zodResolver(adminSocialFormSchema),
    defaultValues,
  });

  async function onSubmit(values: AdminSocialFormValues) {
    setSubmitError(null);

    const payload = {
      name: values.name,
      link: values.link,
      icon: values.icon,
    };

    try {
      if (props.mode === "create") {
        await createSocial(payload);
      } else {
        await updateSocial(props.social.id, payload);
      }
      await revalidateSocialsCache();
      router.push("/admin/settings");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setSubmitError("Сессия истекла. Войдите снова.");
          return;
        }
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Не удалось сохранить соцсеть.");
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <Input
        id="social-name"
        label="Название"
        required
        disabled={isSubmitting}
        error={errors.name?.message}
        {...register("name")}
      />
      <Input
        id="social-link"
        label="Ссылка"
        type="url"
        required
        disabled={isSubmitting}
        error={errors.link?.message}
        placeholder="https://…"
        {...register("link")}
      />
      <Input
        id="social-icon"
        label="Icon"
        required
        disabled={isSubmitting}
        error={errors.icon?.message}
        hint="Имя, URL или storage key (например instagram)."
        {...register("icon")}
      />

      {submitError ? (
        <p className={styles.submitError} role="alert">
          {submitError}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? "Сохранение…"
            : props.mode === "create"
              ? "Создать"
              : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
