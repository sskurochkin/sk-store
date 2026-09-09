import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { formatDisplayDate } from "@/lib/format-date";
import type { News } from "@/types/news";
import styles from "./NewsCard.module.css";

type NewsCardProps = {
  news: News;
};

export function NewsCard({ news }: NewsCardProps) {
  const dateLabel = formatDisplayDate(news.createdAt);

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
          <h2 className={styles.title}>{news.title}</h2>
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
