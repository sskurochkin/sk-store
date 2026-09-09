"use client";

import Link from "next/link";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { SocialLinks } from "@/components/social/SocialLinks";
import { useAdminTablePage } from "@/lib/admin-table";
import type { Social } from "@/types/social";
import styles from "./SocialsTable.module.css";

type SocialsTableProps = {
  socials: Social[];
};

export function SocialsTable({ socials }: SocialsTableProps) {
  const { page, setPage, pageItems, totalItems } = useAdminTablePage(socials);

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
                Ссылка
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
            {pageItems.map((social) => (
              <tr key={social.id} className={styles.tr}>
                <td className={styles.td}>{social.name}</td>
                <td className={styles.td}>
                  <a
                    href={social.link}
                    className={styles.external}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.link}
                  </a>
                </td>
                <td className={styles.td}>
                  <SocialLinks
                    socials={[social]}
                    variant="preview"
                    aria-label={`Иконка ${social.name}`}
                  />
                </td>
                <td className={styles.td}>
                  <Link
                    href={`/admin/settings/socials/${social.id}/edit`}
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
