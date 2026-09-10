"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { revalidateLegalPagesCache } from "@/lib/revalidate-public-cache";
import { ApiError } from "@/services/api";
import { updateLegalPage } from "@/services/admin-legal-pages";
import type { LegalPageContent, LegalSection } from "@/types/legal-page";
import styles from "../socials/SocialForm.module.css";
import formStyles from "./LegalPageForm.module.css";

type LegalPageFormProps = {
  page: LegalPageContent;
};

type LegalPageFormValues = {
  title: string;
  sections: Array<{
    id: string;
    title: string;
    paragraphsText: string;
  }>;
};

function toFormValues(page: LegalPageContent): LegalPageFormValues {
  return {
    title: page.title,
    sections: page.sections.map((section) => ({
      id: section.id,
      title: section.title,
      paragraphsText: section.paragraphs.join("\n\n"),
    })),
  };
}

function createSectionId(): string {
  return `section-${Date.now()}`;
}

function toSections(values: LegalPageFormValues): LegalSection[] {
  return values.sections.map((section, index) => ({
    id: section.id.trim() || `section-${index + 1}`,
    title: section.title.trim(),
    paragraphs: section.paragraphsText
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0),
  }));
}

export function LegalPageForm({ page }: LegalPageFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LegalPageFormValues>({
    defaultValues: toFormValues(page),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  async function onSubmit(values: LegalPageFormValues) {
    setSubmitError(null);

    const sections = toSections(values);
    if (sections.length === 0) {
      setSubmitError("Добавьте хотя бы один раздел.");
      return;
    }
    if (sections.some((section) => section.paragraphs.length === 0)) {
      setSubmitError("Каждый раздел должен содержать хотя бы один абзац.");
      return;
    }

    try {
      await updateLegalPage(page.slug, {
        title: values.title.trim(),
        sections,
      });
      await revalidateLegalPagesCache({ slugs: [page.slug] });
      router.push("/admin/settings");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Не удалось сохранить документ.");
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        id="legal-page-title"
        label="Заголовок страницы"
        required
        disabled={isSubmitting}
        error={errors.title?.message}
        {...register("title", { required: "Укажите заголовок" })}
      />

      <div className={formStyles.sections}>
        {fields.map((field, index) => (
          <fieldset key={field.id} className={formStyles.section}>
            <div className={formStyles.sectionHeader}>
              <legend className={formStyles.sectionLegend}>
                Раздел {index + 1}
              </legend>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSubmitting || fields.length <= 1}
                onClick={() => remove(index)}
              >
                Удалить раздел
              </Button>
            </div>
            <Input
              id={`legal-section-id-${index}`}
              label="Идентификатор раздела"
              hint="Латиница, цифры и дефисы. Используется для якорных ссылок."
              required
              disabled={isSubmitting}
              error={errors.sections?.[index]?.id?.message}
              {...register(`sections.${index}.id`, {
                required: "Укажите идентификатор раздела",
              })}
            />
            <Input
              id={`legal-section-title-${index}`}
              label="Заголовок раздела"
              required
              disabled={isSubmitting}
              error={errors.sections?.[index]?.title?.message}
              {...register(`sections.${index}.title`, {
                required: "Укажите заголовок раздела",
              })}
            />
            <Textarea
              id={`legal-section-paragraphs-${index}`}
              label="Абзацы"
              hint="Разделяйте абзацы пустой строкой"
              rows={6}
              required
              disabled={isSubmitting}
              error={errors.sections?.[index]?.paragraphsText?.message}
              {...register(`sections.${index}.paragraphsText`, {
                required: "Укажите текст раздела",
              })}
            />
          </fieldset>
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isSubmitting}
        onClick={() =>
          append({
            id: createSectionId(),
            title: "",
            paragraphsText: "",
          })
        }
      >
        Добавить раздел
      </Button>

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
