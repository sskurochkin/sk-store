"use client";

import { useCallback, useState } from "react";
import { ImageUploadField } from "@/components/admin/media/ImageUploadField";
import { MediaDeleteButton } from "@/components/admin/media/MediaDeleteButton";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/FeedbackState/FeedbackState";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import {
  formatDimensions,
  formatFileSize,
  formatMediaDate,
} from "@/lib/format-media";
import { listMediaAdmin } from "@/services/admin-media";
import type { Media } from "@/types/media";
import styles from "./MediaLibrary.module.css";

type MediaLibraryProps = {
  initialItems: Media[];
  initialLoadFailed?: boolean;
};

export function MediaLibrary({
  initialItems,
  initialLoadFailed = false,
}: MediaLibraryProps) {
  const { showToast } = useToast();
  const [items, setItems] = useState<Media[]>(initialItems);
  const [loadFailed, setLoadFailed] = useState(initialLoadFailed);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadFailed(false);
    try {
      const next = await listMediaAdmin();
      setItems(next);
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleUploadSuccess(media: Media) {
    setItems((current) => {
      const withoutDuplicate = current.filter((item) => item.id !== media.id);
      return [media, ...withoutDuplicate];
    });
    showToast(`Загружено: ${media.originalName}`);
  }

  function handleDeleted(mediaId: string) {
    setItems((current) => current.filter((item) => item.id !== mediaId));
    showToast("Изображение удалено");
  }

  if (isLoading) {
    return (
      <LoadingState
        title="Загрузка медиа…"
        description="Получаем список изображений."
      />
    );
  }

  if (loadFailed) {
    return (
      <ErrorState
        title="Не удалось загрузить медиа"
        description="Проверьте соединение и попробуйте снова."
        action={
          <button type="button" className={styles.retryButton} onClick={() => void reload()}>
            Повторить
          </button>
        }
      />
    );
  }

  return (
    <div className={styles.root}>
      <section className={styles.uploadSection} aria-label="Загрузка изображений">
        <ImageUploadField
          hidePreview
          label="Загрузить изображение"
          onUploadSuccess={handleUploadSuccess}
        />
      </section>

      {items.length === 0 ? (
        <EmptyState
          title="Пока нет загруженных изображений"
          description="Загрузите первое изображение с помощью кнопки выше."
        />
      ) : (
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.id} className={styles.card}>
              <div className={styles.thumbnail}>
                <MediaImage
                  src={item.path}
                  alt={item.originalName}
                  aspectRatio="1/1"
                  objectFit="cover"
                  sizes="(max-width: 40rem) 50vw, (max-width: 60rem) 33vw, 20vw"
                  unoptimized
                />
              </div>
              <div className={styles.meta}>
                <p className={styles.name}>{item.originalName}</p>
                <p className={styles.detail}>{formatFileSize(item.size)}</p>
                <p className={styles.detail}>
                  {formatDimensions(item.width, item.height)}
                </p>
                <p className={styles.detail}>{formatMediaDate(item.createdAt)}</p>
              </div>
              <div className={styles.actions}>
                <MediaDeleteButton
                  mediaId={item.id}
                  originalName={item.originalName}
                  onDeleted={handleDeleted}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
