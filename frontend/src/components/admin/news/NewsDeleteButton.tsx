"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Button } from "@/components/ui/Button/Button";
import { ApiError } from "@/services/api";
import { deleteNews } from "@/services/admin-news";
import { revalidateNewsCache } from "@/lib/revalidate-public-cache";
import styles from "./NewsDeleteButton.module.css";

type NewsDeleteButtonProps = {
  newsId: string;
  newsTitle: string;
  newsAlias: string;
};

export function NewsDeleteButton({
  newsId,
  newsTitle,
  newsAlias,
}: NewsDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteNews(newsId);
      await revalidateNewsCache({ aliases: [newsAlias] });
      setOpen(false);
      router.push("/admin/news");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Не удалось удалить новость.");
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
        title="Удалить новость?"
        description={
          <>
            Новость «{newsTitle}» будет удалена без возможности восстановления.
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
