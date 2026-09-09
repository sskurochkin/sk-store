"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { contactRequestStatusLabel } from "@/constants/contact-request-status";
import {
  compareIsoDate,
  compareText,
  nextSortDirection,
  useAdminTablePage,
  type SortDirection,
} from "@/lib/admin-table";
import type { AdminContactRequest } from "@/types/contact-request";
import styles from "./ContactRequestsTable.module.css";

type ContactRequestsTableProps = {
  requests: AdminContactRequest[];
};

type SortKey = "date" | "client" | "status";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function messagePreview(message: string, maxLength = 80): string {
  const trimmed = message.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function clientName(request: AdminContactRequest): string {
  return `${request.firstName} ${request.lastName}`.trim();
}

export function ContactRequestsTable({ requests }: ContactRequestsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sorted = useMemo(() => {
    const items = [...requests];
    items.sort((left, right) => {
      let result = 0;
      switch (sortKey) {
        case "date":
          result = compareIsoDate(left.createdAt, right.createdAt);
          break;
        case "client":
          result = compareText(clientName(left), clientName(right));
          break;
        case "status":
          result = compareText(
            contactRequestStatusLabel(left.status),
            contactRequestStatusLabel(right.status),
          );
          break;
      }
      return sortDirection === "asc" ? result : -result;
    });
    return items;
  }, [requests, sortKey, sortDirection]);

  const { page, setPage, pageItems, totalItems } = useAdminTablePage(sorted);

  function toggleSort(key: SortKey) {
    const next = nextSortDirection(sortKey, sortDirection, key);
    setSortKey(next.key as SortKey);
    setSortDirection(next.direction);
    setPage(1);
  }

  function sortLabel(key: SortKey, label: string): string {
    if (sortKey !== key) {
      return label;
    }
    return `${label} ${sortDirection === "asc" ? "↑" : "↓"}`;
  }

  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={styles.th}
                scope="col"
                aria-sort={
                  sortKey === "date"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button
                  type="button"
                  className={styles.sortButton}
                  onClick={() => toggleSort("date")}
                >
                  {sortLabel("date", "Дата")}
                </button>
              </th>
              <th
                className={styles.th}
                scope="col"
                aria-sort={
                  sortKey === "client"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button
                  type="button"
                  className={styles.sortButton}
                  onClick={() => toggleSort("client")}
                >
                  {sortLabel("client", "Клиент")}
                </button>
              </th>
              <th className={styles.th} scope="col">
                Контакты
              </th>
              <th
                className={styles.th}
                scope="col"
                aria-sort={
                  sortKey === "status"
                    ? sortDirection === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <button
                  type="button"
                  className={styles.sortButton}
                  onClick={() => toggleSort("status")}
                >
                  {sortLabel("status", "Статус")}
                </button>
              </th>
              <th className={styles.th} scope="col">
                Сообщение
              </th>
              <th className={styles.th} scope="col">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((request) => (
              <tr key={request.id} className={styles.tr}>
                <td className={styles.td}>{formatDate(request.createdAt)}</td>
                <td className={styles.td}>{clientName(request)}</td>
                <td className={styles.td}>
                  <div>{request.phone}</div>
                  <div className={styles.muted}>{request.email}</div>
                </td>
                <td className={styles.td}>
                  {contactRequestStatusLabel(request.status)}
                </td>
                <td className={styles.td}>
                  <span className={styles.preview}>
                    {messagePreview(request.message)}
                  </span>
                </td>
                <td className={styles.td}>
                  <Link
                    href={`/admin/contact-requests/${request.id}`}
                    className={styles.link}
                  >
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminTablePagination
        page={page}
        totalItems={totalItems}
        onPageChange={setPage}
      />
    </div>
  );
}
