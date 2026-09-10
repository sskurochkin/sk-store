import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import { SITE_NAME } from "@/constants/site";
import type { AuthUser } from "@/types/auth";
import styles from "./AdminShell.module.css";
import { Icon } from "../ui/icon/Icon";

type AdminShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Админ-навигация">
        <div className={styles.brand}>
          <p className={styles.brandTitle}>{SITE_NAME}</p>
          <p className={styles.brandSubtitle}>Админ-панель</p>
        </div>
        <nav aria-label="Разделы админки">
          <AdminNavLinks />
        </nav>
        <Link href="/" className={styles.siteLink}>
          ← На сайт
        </Link>
      </aside>

      <div className={styles.column}>
        <header className={styles.topbar}>
          <div className={styles.topbarStart}>
            <AdminMobileNav />
            <p className={styles.topbarTitle}>Администрирование</p>
          </div>
          <div className={styles.topbarEnd}>
            <Link href="/" className={styles.topbarSiteLink}>
              <Icon name="i-home" />
            </Link>
            <p className={styles.user}>
              <span className={styles.userLabel}>Пользователь</span>
              <span className={styles.username}>{user.username}</span>
            </p>
            <AdminLogoutButton />
          </div>
        </header>

        <main id="admin-main" className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
