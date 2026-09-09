"use client";

import Link from "next/link";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { formatPrice } from "@/lib/format-price";
import { useAdminTablePage } from "@/lib/admin-table";
import type { Product } from "@/types/product";
import styles from "./ProductsTable.module.css";

type ProductsTableProps = {
  products: Product[];
};

export function ProductsTable({ products }: ProductsTableProps) {
  const { page, setPage, pageItems, totalItems } = useAdminTablePage(products);

  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} scope="col">
                Название
              </th>
              <th className={styles.th} scope="col">
                Alias
              </th>
              <th className={styles.th} scope="col">
                Цена
              </th>
              <th className={styles.th} scope="col">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((product) => (
              <tr key={product.id} className={styles.tr}>
                <td className={styles.td}>{product.name}</td>
                <td className={styles.td}>
                  <span className={styles.alias}>{product.alias}</span>
                </td>
                <td className={styles.td}>{formatPrice(product.price)}</td>
                <td className={styles.td}>
                  <div className={styles.actions}>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className={styles.link}
                    >
                      Изменить
                    </Link>
                  </div>
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
