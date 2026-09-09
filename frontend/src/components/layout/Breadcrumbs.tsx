import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import styles from "./Breadcrumbs.module.css";

export type BreadcrumbItem = {
  label: string;
  /** Omit href for the current page crumb. */
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.nav} aria-label="Хлебные крошки">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.homeLink} aria-label="Главная">
            <Icon name="i-home" className={styles.homeIcon} />
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
