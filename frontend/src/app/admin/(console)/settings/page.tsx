import type { Metadata } from "next";
import Link from "next/link";
import { SocialsTable } from "@/components/admin/socials/SocialsTable";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getRequestCookieHeader } from "@/services/auth-server";
import { listSocialsAdmin } from "@/services/admin-socials";
import type { Social } from "@/types/social";
import styles from "./settings-admin.module.css";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  let socials: Social[] = [];
  let loadFailed = false;

  try {
    const cookie = await getRequestCookieHeader();
    socials = await listSocialsAdmin(cookie);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={1}>Settings</Heading>
          <Text muted>
            Настройки магазина. Пока доступно управление соцсетями.
          </Text>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="socials-heading">
        <div className={styles.sectionHeader}>
          <div className={styles.headerText}>
            <h2 id="socials-heading" className={styles.sectionTitle}>
              Соцсети
            </h2>
            <Text muted size="sm">
              Ссылки отображаются в футере и на странице контактов.
            </Text>
          </div>
          <Link
            href="/admin/settings/socials/new"
            className={styles.createLink}
          >
            Добавить
          </Link>
        </div>

        {loadFailed ? (
          <ErrorState
            title="Не удалось загрузить соцсети"
            description="Проверьте соединение и попробуйте обновить страницу."
          />
        ) : socials.length === 0 ? (
          <EmptyState
            title="Пока нет соцсетей"
            description="Добавьте первую ссылку для футера и контактов."
            action={
              <Link
                href="/admin/settings/socials/new"
                className={styles.createLink}
              >
                Создать
              </Link>
            }
          />
        ) : (
          <SocialsTable socials={socials} />
        )}
      </section>
    </div>
  );
}
