"use client";

import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button/Button";
import { MEDIA_CONFLICT_MESSAGE } from "@/constants/media";
import { ApiError } from "@/services/api";
import { deleteMediaAdmin } from "@/services/admin-media";
import styles from "./MediaDeleteButton.module.css";

type MediaDeleteButtonProps = {
  mediaId: string;
  originalName: string;
  onDeleted: (mediaId: string) => void;
};

export function MediaDeleteButton({
  mediaId,
  originalName,
  onDeleted,
}: MediaDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteMediaAdmin(mediaId);
      setOpen(false);
      onDeleted(mediaId);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(MEDIA_CONFLICT_MESSAGE);
        } else if (err.status === 404) {
          setError("Изображение уже удалено.");
          setOpen(false);
          onDeleted(mediaId);
          return;
        } else if (err.status === 401) {
          setError("Сессия истекла. Войдите снова.");
        } else {
          setError(err.message || "Не удалось удалить изображение.");
        }
      } else {
        setError("Не удалось удалить изображение.");
      }
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isDeleting}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Удалить
      </Button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmModal
        open={open}
        title={`Удалить «${originalName}»?`}
        description={
          <>
            Это действие нельзя отменить.
            {error && open ? (
              <p className={styles.modalError} role="alert">
                {error}
              </p>
            ) : null}
          </>
        }
        confirming={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setOpen(false);
          }
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
