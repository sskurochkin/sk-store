import Link from "next/link";
import type { News } from "@/types/news";
import styles from "./NewsTable.module.css";

type NewsTableProps = {
  items: News[];
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function NewsTable({ items }: NewsTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th} scope="col">
              Заголовок
            </th>
            <th className={styles.th} scope="col">
              Alias
            </th>
            <th className={styles.th} scope="col">
              Дата
            </th>
            <th className={styles.th} scope="col">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={styles.tr}>
              <td className={styles.td}>{item.title}</td>
              <td className={styles.td}>
                <span className={styles.alias}>{item.alias}</span>
              </td>
              <td className={styles.td}>{formatDate(item.createdAt)}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <Link
                    href={`/admin/news/${item.id}/edit`}
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
  );
}
