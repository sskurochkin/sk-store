"use client";

import type {
  Control,
  FieldArrayWithId,
  FieldErrors,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import type { AdminProductFormValues } from "@/lib/admin-product-schema";
import styles from "./ImageGalleryField.module.css";

type ImageGalleryFieldProps = {
  control: Control<AdminProductFormValues>;
  fields: FieldArrayWithId<AdminProductFormValues, "gallery", "id">[];
  append: UseFieldArrayAppend<AdminProductFormValues, "gallery">;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<AdminProductFormValues>;
  disabled?: boolean;
  errors?: FieldErrors<AdminProductFormValues>["gallery"];
};

export function ImageGalleryField({
  control,
  fields,
  append,
  remove,
  register,
  disabled = false,
  errors,
}: ImageGalleryFieldProps) {
  const galleryValues = useWatch({ control, name: "gallery" }) ?? [];

  return (
    <div className={styles.root}>
      <p className={styles.label}>Галерея</p>
      <p className={styles.hint}>
        Дополнительные изображения. Загрузка или URL. Удаление из галереи не
        удаляет файл из Media.
      </p>

      {fields.length > 0 ? (
        <ul className={styles.grid}>
          {fields.map((field, index) => {
            const url = galleryValues[index]?.url?.trim() ?? "";
            return (
              <li key={field.id} className={styles.item}>
                {url ? (
                  <div className={styles.thumbnail}>
                    <MediaImage
                      src={url}
                      alt={`Галерея ${index + 1}`}
                      aspectRatio="1/1"
                      objectFit="cover"
                      sizes="(max-width: 40rem) 50vw, 20vw"
                      unoptimized
                    />
                  </div>
                ) : null}
                <Input
                  id={`product-gallery-${index}`}
                  label={`Фото ${index + 1}`}
                  disabled={disabled}
                  error={errors?.[index]?.url?.message}
                  {...register(`gallery.${index}.url`)}
                />
                <div className={styles.itemActions}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={() => remove(index)}
                  >
                    Убрать
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {typeof errors?.message === "string" ||
      typeof errors?.root?.message === "string" ? (
        <p className={styles.fieldError} role="alert">
          {errors.message ?? errors.root?.message}
        </p>
      ) : null}

      <div className={styles.actions}>
        <ImageUploadField
          hidePreview
          label="Добавить изображение"
          disabled={disabled}
          onUploadSuccess={(media) => {
            append({ url: media.path });
          }}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => append({ url: "" })}
        >
          Добавить URL
        </Button>
      </div>
    </div>
  );
}
