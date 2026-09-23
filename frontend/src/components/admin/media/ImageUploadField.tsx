"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { MEDIA_ACCEPT_INPUT } from "@/constants/media";
import {
  mapUploadApiError,
  mapUploadValidationError,
} from "@/lib/media-upload-errors";
import { uploadMediaAdmin } from "@/services/admin-media";
import type { Media } from "@/types/media";
import styles from "./ImageUploadField.module.css";

export type ImageUploadFieldProps = {
  /** Public path e.g. `/media/uuid.webp` */
  value?: string | null;
  onChange?: (path: string | null) => void;
  /** Called after a successful upload with full media metadata. */
  onUploadSuccess?: (media: Media) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  /** Hide preview of the current value (upload-only mode). */
  hidePreview?: boolean;
};

export function ImageUploadField({
  value = null,
  onChange,
  onUploadSuccess,
  disabled = false,
  id: idProp,
  label = "Загрузить изображение",
  hidePreview = false,
}: ImageUploadFieldProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    setError(null);

    const validationError = mapUploadValidationError(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const media = await uploadMediaAdmin(file);
      onChange?.(media.path);
      onUploadSuccess?.(media);
    } catch (err: unknown) {
      setError(mapUploadApiError(err));
    } finally {
      setIsUploading(false);
    }
  }

  const isDisabled = disabled || isUploading;

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <input
          id={inputId}
          type="file"
          accept={MEDIA_ACCEPT_INPUT}
          className={styles.fileInput}
          disabled={isDisabled}
          onChange={(event) => {
            void handleFileChange(event);
          }}
        />
        <label
          htmlFor={inputId}
          className={clsx(styles.fileLabel, isDisabled && styles.fileLabelDisabled)}
        >
          {isUploading ? "Загрузка…" : label}
        </label>
        {isUploading ? (
          <span className={styles.status} role="status" aria-live="polite">
            Загрузка изображения…
          </span>
        ) : null}
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {!hidePreview && value ? (
        <div className={styles.preview}>
          <MediaImage
            src={value}
            alt="Загруженное изображение"
            aspectRatio="1/1"
            objectFit="contain"
            sizes="12rem"
            unoptimized
          />
          <p className={styles.previewPath}>{value}</p>
        </div>
      ) : null}
    </div>
  );
}
