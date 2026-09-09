import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import styles from "./AdminPanelLink.module.css";

/** Header entry to `/admin` — render only when an admin session exists. */
export function AdminPanelLink() {
  return (
    <Link href="/admin" className={styles.link} aria-label="Админ-панель">
      <Icon name="admin" className={styles.icon} />
    </Link>
  );
}
