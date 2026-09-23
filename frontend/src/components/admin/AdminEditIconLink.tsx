import Link from "next/link";
import { Icon } from "@/components/ui/icon/Icon";
import styles from "./AdminEditIconLink.module.css";

type AdminEditIconLinkProps = {
  href: string;
  /** Accessible label, e.g. «Редактировать „Bread“». */
  label: string;
};

export function AdminEditIconLink({ href, label }: AdminEditIconLinkProps) {
  return (
    <Link href={href} className={styles.link} aria-label={label}>
      <Icon name="i-edit" className={styles.icon} />
    </Link>
  );
}
