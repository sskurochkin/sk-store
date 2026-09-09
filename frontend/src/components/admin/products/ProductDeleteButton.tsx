"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button/Button";
import { ApiError } from "@/services/api";
import { deleteProduct } from "@/services/admin-products";
import styles from "./ProductDeleteButton.module.css";

type ProductDeleteButtonProps = {
  productId: string;
  productName: string;
};

export function ProductDeleteButton({
  productId,
  productName,
}: ProductDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteProduct(productId);
      setOpen(false);
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Не удалось удалить продукт.");
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
        Удалить
      </Button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmModal
        open={open}
        title="Удалить продукт?"
        description={
          <>
            Продукт «{productName}» будет удалён без возможности восстановления.
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
