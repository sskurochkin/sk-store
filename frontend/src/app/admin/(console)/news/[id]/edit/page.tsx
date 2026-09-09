import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsDeleteButton } from "@/components/admin/news/NewsDeleteButton";
import { NewsForm } from "@/components/admin/news/NewsForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { listNewsAdmin } from "@/services/admin-news";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../../news-admin.module.css";

type EditNewsPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditNewsPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit news · ${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditNewsPage({
  params,
}: EditNewsPageProps) {
  const { id } = await params;
  const cookie = await getRequestCookieHeader();
  let item;

  try {
    const items = await listNewsAdmin(cookie);
    item = items.find((entry) => entry.id === id);
  } catch {
    notFound();
  }

  if (!item) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/news" className={styles.backLink}>
          ← К списку
        </Link>
        <Heading level={1}>Редактирование</Heading>
        <Text muted>{item.title}</Text>
      </header>

      <NewsForm mode="edit" news={item} />

      <section className={styles.dangerZone} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.dangerTitle}>
          Удаление
        </h2>
        <Text muted size="sm">
          Удаление необратимо. Публичная страница новости обновится сразу
          после сброса кэша.
        </Text>
        <NewsDeleteButton
          newsId={item.id}
          newsTitle={item.title}
          newsAlias={item.alias}
        />
      </section>
    </div>
  );
}
