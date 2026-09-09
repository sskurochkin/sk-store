"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import {
  adminProductFormSchema,
  type AdminProductFormValues,
} from "@/lib/admin-product-schema";
import { ApiError } from "@/services/api";
import {
  createProduct,
  updateProduct,
} from "@/services/admin-products";
import type { Product } from "@/types/product";
import styles from "./ProductForm.module.css";

type ProductFormProps =
  | { mode: "create"; product?: undefined }
  | { mode: "edit"; product: Product };

export function ProductForm(props: ProductFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues: AdminProductFormValues =
    props.mode === "edit"
      ? {
          name: props.product.name,
          alias: props.product.alias,
          description: props.product.description,
          mainPhoto: props.product.mainPhoto,
          gallery: props.product.gallery.map((url) => ({ url })),
          price: Number.parseFloat(props.product.price),
        }
      : {
          name: "",
          alias: "",
          description: "",
          mainPhoto: "",
          gallery: [],
          price: 0.01,
        };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "gallery",
  });

  async function onSubmit(values: AdminProductFormValues) {
    setSubmitError(null);

    const payload = {
      name: values.name,
      alias: values.alias,
      description: values.description,
      mainPhoto: values.mainPhoto,
      gallery: values.gallery.map((item) => item.url),
      price: values.price,
    };

    try {
      if (props.mode === "create") {
        await createProduct(payload);
      } else {
        await updateProduct(props.product.id, payload);
      }
      router.push("/admin/products");
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
      setSubmitError("Не удалось сохранить продукт.");
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
          id="product-name"
          label="Название"
          required
          disabled={isSubmitting}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          id="product-alias"
          label="Alias"
          required
          disabled={isSubmitting}
          hint="Строчные буквы, цифры и дефисы"
          error={errors.alias?.message}
          {...register("alias")}
        />
      </div>

      <Textarea
        id="product-description"
        label="Описание"
        required
        rows={5}
        disabled={isSubmitting}
        error={errors.description?.message}
        {...register("description")}
      />

      <Input
        id="product-main-photo"
        label="Main photo"
        required
        disabled={isSubmitting}
        hint="URL или storage key"
        error={errors.mainPhoto?.message}
        {...register("mainPhoto")}
      />

      <div className={styles.gallery}>
        <p className={styles.galleryLabel}>Галерея</p>
        <p className={styles.galleryHint}>
          Дополнительные URL изображений (необязательно).
        </p>
        <ul className={styles.galleryList}>
          {fields.map((field, index) => (
            <li key={field.id} className={styles.galleryItem}>
              <Input
                id={`product-gallery-${index}`}
                label={`Фото ${index + 1}`}
                disabled={isSubmitting}
                error={errors.gallery?.[index]?.url?.message}
                {...register(`gallery.${index}.url`)}
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
        {typeof errors.gallery?.message === "string" ||
        typeof errors.gallery?.root?.message === "string" ? (
          <p className={styles.fieldError} role="alert">
            {errors.gallery.message ?? errors.gallery.root?.message}
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isSubmitting}
          onClick={() => append({ url: "" })}
        >
          Добавить URL
        </Button>
      </div>

      <Input
        id="product-price"
        label="Цена"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0.01"
        required
        disabled={isSubmitting}
        error={errors.price?.message}
        {...register("price", { valueAsNumber: true })}
      />

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
          onClick={() => router.push("/admin/products")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
