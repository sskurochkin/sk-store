"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button/Button";
import { ApiError } from "@/services/api";
import { deleteOrder } from "@/services/admin-orders";
import styles from "./OrderDeleteButton.module.css";

type OrderDeleteButtonProps = {
  orderId: string;
};

export function OrderDeleteButton({ orderId }: OrderDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteOrder(orderId);
      setOpen(false);
      router.push("/admin/orders");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Не удалось удалить заказ.");
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
        Удалить заказ
      </Button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmModal
        open={open}
        title="Удалить заказ?"
        description={
          <>
            Заказ «{orderId}» будет удалён без возможности восстановления.
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
