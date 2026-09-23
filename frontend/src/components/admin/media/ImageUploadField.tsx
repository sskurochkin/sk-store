"use client";

import { useId, useState } from "react";
import clsx from "clsx";
import { Input } from "@/components/ui/Input/Input";
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
  size?: "sm" | "md" | "lg";
  /** Public path e.g. `/media/uuid.webp` or external URL */
  value?: string | null;
  onChange?: (path: string | null) => void;
  /** Called after a successful upload with full media metadata. */
  onUploadSuccess?: (media: Media) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  /** Hide preview of the current value (upload-only mode). */
  hidePreview?: boolean;
  /** Show text input for manual URL/path entry alongside upload. */
  showUrlInput?: boolean;
  urlInputId?: string;
  urlInputLabel?: string;
  urlHint?: string;
  error?: string;
  required?: boolean;
  previewAlt?: string;
};

function previewLabelFromPath(path: string): string {
  if (path.startsWith("/media/")) {
    return path.slice("/media/".length) || "Изображение";
  }
  try {
    const url = new URL(path);
    return url.pathname.split("/").pop() || path;
  } catch {
    return path;
  }
}

export function ImageUploadField({
  size = "md",
  value = null,
  onChange,
  onUploadSuccess,
  disabled = false,
  id: idProp,
  label = "Загрузить изображение",
  hidePreview = false,
  showUrlInput = false,
  urlInputId: urlInputIdProp,
  urlInputLabel = "Main photo",
  urlHint = "URL или загрузите файл",
  error,
  required = false,
  previewAlt,
}: ImageUploadFieldProps) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const urlInputId = urlInputIdProp ?? `${inputId}-url`;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    setUploadError(null);

    const validationError = mapUploadValidationError(file);
    if (validationError) {
      setUploadError(validationError);
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
      setUploadError(mapUploadApiError(err));
    } finally {
      setIsUploading(false);
    }
  }

  const isDisabled = disabled || isUploading;
  const displayError = error ?? uploadError;
  const previewSrc = value?.trim() ?? "";
  const alt = previewAlt ?? (previewSrc ? previewLabelFromPath(previewSrc) : "Изображение");

  return (
    <div className={clsx(styles.root, styles[size])}>
      {showUrlInput ? (
        <Input
          id={urlInputId}
          className={styles.urlField}
          label={urlInputLabel}
          required={required}
          disabled={isDisabled}
          hint={urlHint}
          error={error}
          value={value ?? ""}
          onChange={(event) => {
            onChange?.(event.target.value);
          }}
        />
      ) : null}

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

      {!showUrlInput && displayError ? (
        <p className={styles.error} role="alert">
          {displayError}
        </p>
      ) : null}

      {showUrlInput && uploadError ? (
        <p className={styles.error} role="alert">
          {uploadError}
        </p>
      ) : null}

      {!hidePreview && previewSrc ? (
        <div className={styles.preview}>
          <MediaImage
            src={previewSrc}
            alt={alt}
            aspectRatio="1/1"
            objectFit="contain"
            sizes="12rem"
            unoptimized
          />
          <p className={styles.previewPath}>{previewSrc}</p>
        </div>
      ) : null}
    </div>
  );
}
