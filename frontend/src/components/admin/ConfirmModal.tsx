"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button/Button";
import styles from "./ConfirmModal.module.css";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !confirming) {
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, confirming, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Закрыть диалог"
        disabled={confirming}
        onClick={onCancel}
      />
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
        <div className={styles.actions}>
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            disabled={confirming}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming ? "Удаление…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
