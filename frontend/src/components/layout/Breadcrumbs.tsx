import Link from "next/link";
import styles from "./Breadcrumbs.module.css";

export type BreadcrumbItem = {
  label: string;
  /** Omit href for the current page crumb. */
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

function HomeIcon() {
  return (
    <svg
      className={styles.homeIcon}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 10.5 12 4l7.5 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-4V21H5.5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.nav} aria-label="Хлебные крошки">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.homeLink} aria-label="Главная">
            <HomeIcon />
          </Link>
        </li>
        {items.map((item) => (
          <li key={`${item.label}-${item.href ?? "current"}`} className={styles.item}>
            <span className={styles.separator} aria-hidden="true">
              /
            </span>
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current} aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
