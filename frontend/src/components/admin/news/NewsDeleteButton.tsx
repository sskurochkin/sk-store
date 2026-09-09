"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { ApiError } from "@/services/api";
import { deleteNews } from "@/services/admin-news";
import styles from "./NewsDeleteButton.module.css";

type NewsDeleteButtonProps = {
  newsId: string;
  newsTitle: string;
};

export function NewsDeleteButton({
  newsId,
  newsTitle,
}: NewsDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Удалить новость «${newsTitle}»? Это действие нельзя отменить.`,
    );
    if (!confirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);
    try {
      await deleteNews(newsId);
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
        onClick={handleDelete}
      >
        {isDeleting ? "Удаление…" : "Удалить"}
      </Button>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
