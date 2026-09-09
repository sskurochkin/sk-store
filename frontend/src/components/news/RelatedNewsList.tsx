import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { formatDisplayDate } from "@/lib/format-date";
import type { News } from "@/types/news";
import styles from "./RelatedNewsList.module.css";

type RelatedNewsListProps = {
  items: News[];
};

export function RelatedNewsList({ items }: RelatedNewsListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <aside className={styles.aside} aria-labelledby="related-news-heading">
      <h2 id="related-news-heading" className={styles.heading}>
        Похожие новости
      </h2>
      <ul className={styles.list}>
        {items.map((item) => {
          const dateLabel = formatDisplayDate(item.createdAt);
          return (
            <li key={item.id}>
              <Link href={`/news/${item.alias}`} className={styles.card}>
                <div className={styles.media}>
                  <MediaImage
                    src={item.mainPhoto}
                    alt={item.title}
                    aspectRatio="4/3"
                    sizes="(max-width: 60rem) 100vw, 240px"
                  />
                </div>
                <div className={styles.body}>
                  {dateLabel ? (
                    <time className={styles.date} dateTime={item.createdAt}>
                      {dateLabel}
                    </time>
                  ) : null}
                  <span className={styles.title}>{item.title}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
