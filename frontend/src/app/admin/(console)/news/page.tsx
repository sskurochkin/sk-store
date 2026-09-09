import type { Metadata } from "next";
import Link from "next/link";
import { NewsTable } from "@/components/admin/news/NewsTable";
import { EmptyState, ErrorState } from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { listNewsAdmin } from "@/services/admin-news";
import { getRequestCookieHeader } from "@/services/auth-server";
import type { News } from "@/types/news";
import styles from "./news-admin.module.css";

export const metadata: Metadata = {
  title: "News",
  robots: { index: false, follow: false },
};

export default async function AdminNewsPage() {
  let items: News[] = [];
  let loadFailed = false;

  try {
    const cookie = await getRequestCookieHeader();
    items = await listNewsAdmin(cookie);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={1}>News</Heading>
          <Text muted>Создание и редактирование новостей.</Text>
        </div>
        <Link href="/admin/news/new" className={styles.createLink}>
          Новая новость
        </Link>
      </header>

      {loadFailed ? (
        <ErrorState
          title="Не удалось загрузить новости"
          description="Проверьте соединение и попробуйте обновить страницу."
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="Пока нет новостей"
          description="Создайте первую новость."
          action={
            <Link href="/admin/news/new" className={styles.createLink}>
              Создать
            </Link>
          }
        />
      ) : (
        <NewsTable items={items} />
      )}
    </div>
  );
}
