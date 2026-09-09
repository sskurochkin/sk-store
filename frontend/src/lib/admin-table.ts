import { useMemo, useState } from "react";
import { ADMIN_TABLE_PAGE_SIZE } from "@/constants/admin-table";

export type SortDirection = "asc" | "desc";

export function compareText(a: string, b: string): number {
  return a.localeCompare(b, "ru", { sensitivity: "base" });
}

export function compareIsoDate(a: string, b: string): number {
  const left = new Date(a).getTime();
  const right = new Date(b).getTime();
  if (Number.isNaN(left) || Number.isNaN(right)) {
    return compareText(a, b);
  }
  return left - right;
}

export function compareMoney(a: string, b: string): number {
  const left = Number(a);
  const right = Number(b);
  if (Number.isFinite(left) && Number.isFinite(right)) {
    return left - right;
  }
  return compareText(a, b);
}

export function useAdminTablePage<T>(
  items: T[],
  pageSize: number = ADMIN_TABLE_PAGE_SIZE,
) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, pageSize, safePage]);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(next, 1), totalPages));
  }

  return {
    page: safePage,
    setPage: goToPage,
    pageItems,
    totalItems: items.length,
    pageSize,
  };
}

export function nextSortDirection(
  currentKey: string | null,
  currentDirection: SortDirection,
  nextKey: string,
): { key: string; direction: SortDirection } {
  if (currentKey === nextKey) {
    return {
      key: nextKey,
      direction: currentDirection === "asc" ? "desc" : "asc",
    };
  }
  return { key: nextKey, direction: "asc" };
}
