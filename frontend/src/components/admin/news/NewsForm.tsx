"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { RichTextEditor } from "@/components/admin/news/RichTextEditor";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import {
  adminNewsFormSchema,
  type AdminNewsFormValues,
} from "@/lib/admin-news-schema";
import { ApiError } from "@/services/api";
import { createNews, updateNews } from "@/services/admin-news";
import type { News } from "@/types/news";
import styles from "./NewsForm.module.css";

const CONTENT_HINT =
  "Форматирование: заголовки, списки, ссылки, цитаты. Сервер удалит небезопасный HTML.";

type NewsFormProps =
  | { mode: "create"; news?: undefined }
  | { mode: "edit"; news: News };

export function NewsForm(props: NewsFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues: AdminNewsFormValues =
    props.mode === "edit"
      ? {
          title: props.news.title,
          alias: props.news.alias,
          description: props.news.description,
          mainPhoto: props.news.mainPhoto,
          content: props.news.content,
          tags: props.news.tags.map((value) => ({ value })),
        }
      : {
          title: "",
          alias: "",
          description: "",
          mainPhoto: "",
          content: "",
          tags: [],
        };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminNewsFormValues>({
    resolver: zodResolver(adminNewsFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tags",
  });

  async function onSubmit(values: AdminNewsFormValues) {
    setSubmitError(null);

    const payload = {
      title: values.title,
      alias: values.alias,
      description: values.description,
      mainPhoto: values.mainPhoto,
      content: values.content,
      tags: values.tags.map((item) => item.value),
    };

    try {
      if (props.mode === "create") {
        await createNews(payload);
      } else {
        await updateNews(props.news.id, payload);
      }
      router.push("/admin/news");
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setSubmitError("Сессия истекла. Войдите снова.");
          return;
        }
        if (error.status === 409) {
          setSubmitError("Alias уже занят. Выберите другой.");
          return;
        }
        setSubmitError(error.message);
        return;
      }
      setSubmitError("Не удалось сохранить новость.");
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className={styles.row}>
        <Input
          id="news-title"
          label="Заголовок"
          required
          disabled={isSubmitting}
          error={errors.title?.message}
          {...register("title")}
        />
        <Input
          id="news-alias"
          label="Alias"
          required
          disabled={isSubmitting}
          hint="Строчные буквы, цифры и дефисы"
          error={errors.alias?.message}
          {...register("alias")}
        />
      </div>

      <Textarea
        id="news-description"
        label="Описание"
        required
        rows={4}
        disabled={isSubmitting}
        error={errors.description?.message}
        {...register("description")}
      />

      <Input
        id="news-main-photo"
        label="Main photo"
        required
        disabled={isSubmitting}
        hint="URL или storage key"
        error={errors.mainPhoto?.message}
        {...register("mainPhoto")}
      />

      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <RichTextEditor
            id="news-content"
            label="Содержимое"
            required
            disabled={isSubmitting}
            hint={CONTENT_HINT}
            error={errors.content?.message}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <div className={styles.tags}>
        <p className={styles.tagsLabel}>Теги</p>
        <p className={styles.tagsHint}>Необязательно, до 20 тегов.</p>
        <ul className={styles.tagsList}>
          {fields.map((field, index) => (
            <li key={field.id} className={styles.tagsItem}>
              <Input
                id={`news-tag-${index}`}
                label={`Тег ${index + 1}`}
                disabled={isSubmitting}
                error={errors.tags?.[index]?.value?.message}
                {...register(`tags.${index}.value`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
                onClick={() => remove(index)}
              >
                Удалить
              </Button>
            </li>
          ))}
        </ul>
        {typeof errors.tags?.message === "string" ||
        typeof errors.tags?.root?.message === "string" ? (
          <p className={styles.fieldError} role="alert">
            {errors.tags.message ?? errors.tags.root?.message}
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isSubmitting || fields.length >= 20}
          onClick={() => append({ value: "" })}
        >
          Добавить тег
        </Button>
      </div>

      <div className={styles.actions}>
        {submitError ? (
          <p className={styles.submitError} role="alert">
            {submitError}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? "Сохранение…"
            : props.mode === "create"
              ? "Создать"
              : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isSubmitting}
          onClick={() => router.push("/admin/news")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
