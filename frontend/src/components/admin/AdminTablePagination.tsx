"use client";

import { ADMIN_TABLE_PAGE_SIZE } from "@/constants/admin-table";
import styles from "./AdminTablePagination.module.css";

type AdminTablePaginationProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export function AdminTablePagination({
  page,
  totalItems,
  pageSize = ADMIN_TABLE_PAGE_SIZE,
  onPageChange,
}: AdminTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) {
    return null;
  }

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  return (
    <nav className={styles.nav} aria-label="Пагинация таблицы">
      <p className={styles.meta}>
        {from}–{to} из {totalItems}
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Назад
        </button>
        <span className={styles.page} aria-current="page">
          Стр. {safePage} / {totalPages}
        </span>
        <button
          type="button"
          className={styles.button}
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Вперёд
        </button>
      </div>
    </nav>
  );
}
