import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NewsCard } from "@/components/news/NewsCard";
import { Container } from "@/components/ui/Container/Container";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { getNewsList } from "@/services/news";
import type { News } from "@/types/news";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Новости",
  description: "Новости и объявления пекарни SK Store",
};

export default async function NewsPage() {
  let newsItems: News[] = [];
  let loadFailed = false;

  try {
    newsItems = await getNewsList();
  } catch {
    loadFailed = true;
  }

  return (
    <Section
      spacing="lg"
      className={styles.section}
      aria-labelledby="news-heading"
    >
      <Container>
        <Breadcrumbs items={[{ label: "Новости" }]} />
        <header className={styles.header}>
          <Heading id="news-heading" level={1}>
            Новости
          </Heading>
          <Text muted>Объявления и события SK Store.</Text>
        </header>

        {loadFailed ? (
          <ErrorState
            title="Не удалось загрузить новости"
            description="Проверьте соединение и попробуйте обновить страницу."
          />
        ) : newsItems.length === 0 ? (
          <EmptyState
            title="Пока нет новостей"
            description="Скоро здесь появятся объявления пекарни."
          />
        ) : (
          <ul className={styles.grid}>
            {newsItems.map((item) => (
              <li key={item.id}>
                <NewsCard news={item} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
