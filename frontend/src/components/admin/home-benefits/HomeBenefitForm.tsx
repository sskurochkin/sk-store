"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HomeBenefitDeleteButton } from "@/components/admin/home-benefits/HomeBenefitDeleteButton";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import {
  adminHomeBenefitFormSchema,
  type AdminHomeBenefitFormValues,
} from "@/lib/admin-home-benefit-schema";
import { revalidateHomeBenefitsCache } from "@/lib/revalidate-public-cache";
import { ApiError } from "@/services/api";
import {
  createHomeBenefit,
  updateHomeBenefit,
} from "@/services/admin-home-benefits";
import type { HomeBenefit } from "@/types/home-benefit";
import styles from "../socials/SocialForm.module.css";

type HomeBenefitFormProps =
  | { mode: "create"; benefit?: undefined }
  | { mode: "edit"; benefit: HomeBenefit };

export function HomeBenefitForm(props: HomeBenefitFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues: AdminHomeBenefitFormValues =
    props.mode === "edit"
      ? {
          title: props.benefit.title,
          description: props.benefit.description,
          icon: props.benefit.icon,
          sortOrder: props.benefit.sortOrder,
        }
      : {
          title: "",
          description: "",
          icon: "",
          sortOrder: 0,
        };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminHomeBenefitFormValues>({
    resolver: zodResolver(adminHomeBenefitFormSchema),
    defaultValues,
  });

  async function onSubmit(values: AdminHomeBenefitFormValues) {
    setSubmitError(null);

    const payload = {
      title: values.title,
      description: values.description,
      icon: values.icon,
      sortOrder: values.sortOrder,
    };

    try {
      if (props.mode === "create") {
        await createHomeBenefit(payload);
      } else {
        await updateHomeBenefit(props.benefit.id, payload);
      }
      await revalidateHomeBenefitsCache();
      router.push("/admin/settings");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Не удалось сохранить преимущество.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        id="benefit-title"
        label="Заголовок"
        required
        disabled={isSubmitting}
        error={errors.title?.message}
        {...register("title")}
      />
      <Textarea
        id="benefit-description"
        label="Описание"
        rows={4}
        required
        disabled={isSubmitting}
        error={errors.description?.message}
        {...register("description")}
      />
      <Input
        id="benefit-icon"
        label="Icon"
        hint="ID символа из sprite, например i-calendar"
        required
        disabled={isSubmitting}
        error={errors.icon?.message}
        {...register("icon")}
      />
      <Input
        id="benefit-sort-order"
        label="Порядок сортировки"
        type="number"
        required
        disabled={isSubmitting}
        error={errors.sortOrder?.message}
        {...register("sortOrder", { valueAsNumber: true })}
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

      {props.mode === "edit" ? (
        <HomeBenefitDeleteButton
          benefitId={props.benefit.id}
          benefitTitle={props.benefit.title}
        />
      ) : null}
    </form>
  );
}
