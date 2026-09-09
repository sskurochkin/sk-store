import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { formatDisplayDate } from "@/lib/format-date";
import type { News } from "@/types/news";
import styles from "./NewsCard.module.css";

type NewsCardProps = {
  news: News;
  /** Heading level for the news title (default `2`). Use `3` under a page section `h2`. */
  headingLevel?: 2 | 3;
};

export function NewsCard({ news, headingLevel = 2 }: NewsCardProps) {
  const dateLabel = formatDisplayDate(news.createdAt);
  const TitleTag = headingLevel === 3 ? "h3" : "h2";

  return (
    <Link href={`/news/${news.alias}`} className={styles.link}>
      <Card as="article" padded={false} className={styles.card}>
        <MediaImage
          src={news.mainPhoto}
          alt={news.title}
          aspectRatio="16/9"
          sizes="(max-width: 40rem) 100vw, (max-width: 60rem) 50vw, 33vw"
        />
        <div className={styles.body}>
          {dateLabel ? (
            <time className={styles.date} dateTime={news.createdAt}>
              {dateLabel}
            </time>
          ) : null}
          <TitleTag className={styles.title}>{news.title}</TitleTag>
          <p className={styles.excerpt}>{news.description}</p>
          {news.tags.length > 0 ? (
            <ul className={styles.tags}>
              {news.tags.map((tag) => (
                <li key={tag}>
                  <Badge tone="accent">{tag}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
