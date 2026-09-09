import Link from "next/link";
import styles from "./AdminPanelLink.module.css";

function AdminIcon() {
  return (
    <svg
      className={styles.icon}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 8.5 12 4l7.5 4.5v7L12 20l-7.5-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M9.2 16.2c.7-1 1.7-1.5 2.8-1.5s2.1.5 2.8 1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Header entry to `/admin` — render only when an admin session exists. */
export function AdminPanelLink() {
  return (
    <Link href="/admin" className={styles.link} aria-label="Админ-панель">
      <AdminIcon />
    </Link>
  );
}
