"use client";

import Link from "next/link";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { Icon } from "@/components/ui/icon/Icon";
import { useAdminTablePage } from "@/lib/admin-table";
import type { HomeBenefit } from "@/types/home-benefit";
import styles from "../socials/SocialsTable.module.css";

type HomeBenefitsTableProps = {
  benefits: HomeBenefit[];
};

export function HomeBenefitsTable({ benefits }: HomeBenefitsTableProps) {
  const { page, setPage, pageItems, totalItems } = useAdminTablePage(benefits);

  return (
    <div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th} scope="col">
                Порядок
              </th>
              <th className={styles.th} scope="col">
                Заголовок
              </th>
              <th className={styles.th} scope="col">
                Icon
              </th>
              <th className={styles.th} scope="col">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((benefit) => (
              <tr key={benefit.id} className={styles.tr}>
                <td className={styles.td}>{benefit.sortOrder}</td>
                <td className={styles.td}>{benefit.title}</td>
                <td className={styles.td}>
                  <Icon name={benefit.icon} aria-hidden />
                </td>
                <td className={styles.td}>
                  <Link
                    href={`/admin/settings/benefits/${benefit.id}/edit`}
                    className={styles.link}
                  >
                    Изменить
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
