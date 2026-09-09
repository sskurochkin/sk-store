"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button/Button";
import { ApiError } from "@/services/api";
import { deleteContactRequest } from "@/services/admin-contact-requests";
import styles from "./ContactRequestDeleteButton.module.css";

type ContactRequestDeleteButtonProps = {
  requestId: string;
  clientName: string;
};

export function ContactRequestDeleteButton({
  requestId,
  clientName,
}: ContactRequestDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteContactRequest(requestId);
      setOpen(false);
      router.push("/admin/contact-requests");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Не удалось удалить заявку.");
      }
      setIsDeleting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <Button
        type="button"
        variant="danger"
        disabled={isDeleting}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Удалить заявку
      </Button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmModal
        open={open}
        title="Удалить заявку?"
        description={
          <>
            Заявка от «{clientName}» будет удалена без возможности
            восстановления.
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
