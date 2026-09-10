"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button/Button";
import { revalidateHomeBenefitsCache } from "@/lib/revalidate-public-cache";
import { ApiError } from "@/services/api";
import { deleteHomeBenefit } from "@/services/admin-home-benefits";
import styles from "./HomeBenefitDeleteButton.module.css";

type HomeBenefitDeleteButtonProps = {
  benefitId: string;
  benefitTitle: string;
};

export function HomeBenefitDeleteButton({
  benefitId,
  benefitTitle,
}: HomeBenefitDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setDeleting(true);
    setError(null);

    try {
      await deleteHomeBenefit(benefitId);
      await revalidateHomeBenefitsCache();
      setOpen(false);
      router.push("/admin/settings");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Не удалось удалить преимущество.");
      }
      setDeleting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <Button
        type="button"
        variant="danger"
        disabled={deleting}
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
        title="Удалить преимущество?"
        description={
          <>«{benefitTitle}» будет удалено без возможности восстановления.</>
        }
        confirming={deleting}
        onCancel={() => {
          if (!deleting) {
            setOpen(false);
          }
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
