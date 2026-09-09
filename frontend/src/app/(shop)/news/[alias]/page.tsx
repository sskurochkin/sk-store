import clsx from "clsx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { NewsArticleContent } from "@/components/news/NewsArticleContent";
import { RelatedNewsList } from "@/components/news/RelatedNewsList";
import { Badge } from "@/components/ui/Badge/Badge";
import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { formatDisplayDate } from "@/lib/format-date";
import { buildPageMetadata } from "@/lib/seo";
import {
  getNewsByAlias,
  getNewsList,
  getRelatedNewsByTags,
} from "@/services/news";
import styles from "./page.module.css";

type NewsDetailPageProps = {
  params: Promise<{ alias: string }>;
};

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { alias } = await params;
  const news = await getNewsByAlias(alias);

  if (!news) {
    return { title: "Новость не найдена" };
  }

  return buildPageMetadata({
    title: news.title,
    description: news.description,
    path: `/news/${news.alias}`,
    image: news.mainPhoto,
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { alias } = await params;
  const news = await getNewsByAlias(alias);

  if (!news) {
    notFound();
  }

  let related: Awaited<ReturnType<typeof getRelatedNewsByTags>> = [];
  try {
    const allNews = await getNewsList();
    related = getRelatedNewsByTags(news, allNews);
  } catch {
    related = [];
  }

  const dateLabel = formatDisplayDate(news.createdAt);
  const hasSidebar = related.length > 0;

  return (
    <Section
      spacing="lg"
      className={styles.section}
      aria-labelledby="news-article-heading"
    >
      <Container>
        <Breadcrumbs
          items={[
            { label: "Новости", href: "/news" },
            { label: news.title },
          ]}
        />

        <div
          className={clsx(
            styles.layout,
            hasSidebar && styles.layoutWithSidebar,
          )}
        >
          <article className={styles.article}>
            <header className={styles.header}>
              {dateLabel ? (
                <time className={styles.date} dateTime={news.createdAt}>
                  {dateLabel}
                </time>
              ) : null}
              <Heading id="news-article-heading" level={1}>
                {news.title}
              </Heading>
              <Text muted className={styles.lead}>
                {news.description}
              </Text>
              {news.tags.length > 0 ? (
                <ul className={styles.tags}>
                  {news.tags.map((tag) => (
                    <li key={tag}>
                      <Badge tone="accent">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
            </header>

            <div className={styles.hero}>
              <MediaImage
                src={news.mainPhoto}
                alt={news.title}
                aspectRatio="16/9"
                sizes={
                  hasSidebar
                    ? "(max-width: 60rem) 100vw, 70vw"
                    : "(max-width: 60rem) 100vw, 48rem"
                }
                priority
              />
            </div>

            <NewsArticleContent html={news.content} />
          </article>

          {hasSidebar ? <RelatedNewsList items={related} /> : null}
        </div>
      </Container>
    </Section>
  );
}
