import type { Metadata } from "next";
import Link from "next/link";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { ADMIN_NAV_ITEMS } from "@/constants/admin-navigation";
import { getCurrentUser } from "@/services/auth-server";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Heading level={1}>Dashboard</Heading>
        <Text muted>
          Добро пожаловать
          {user ? (
            <>
              , <strong>{user.username}</strong>
            </>
          ) : null}
          . Это фундамент админ-панели — разделы появятся в следующих фазах.
        </Text>
      </header>

      <section aria-labelledby="admin-sections-heading">
        <Heading id="admin-sections-heading" level={2} className={styles.subheading}>
          Разделы
        </Heading>
        <ul className={styles.grid}>
          {ADMIN_NAV_ITEMS.filter((item) => item.href !== "/admin").map(
            (item) => (
              <li key={item.href} className={styles.card}>
                <p className={styles.cardTitle}>{item.label}</p>
                <p className={styles.cardText}>
                  {item.comingSoon
                    ? "Управление разделом будет добавлено позже."
                    : "Открыть раздел"}
                </p>
                {item.comingSoon ? (
                  <span className={styles.cardMeta}>Скоро</span>
                ) : (
                  <Link href={item.href} className={styles.cardLink}>
                    Перейти
                  </Link>
                )}
              </li>
            ),
          )}
        </ul>
      </section>

      <section className={styles.stats} aria-labelledby="admin-stats-heading">
        <Heading id="admin-stats-heading" level={2} className={styles.subheading}>
          Статистика
        </Heading>
        <Text muted>
          Место для будущих KPI и графиков. В этой фазе метрики не
          рассчитываются.
        </Text>
      </section>
    </div>
  );
}
