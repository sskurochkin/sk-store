import styles from "./NewsArticleContent.module.css";

type NewsArticleContentProps = {
  /** Backend-sanitized HTML from GET /api/news/:alias only. */
  html: string;
  className?: string;
};

/**
 * Renders server-fetched News.content HTML.
 * Do not pass client/user-controlled HTML into this component.
 */
export function NewsArticleContent({
  html,
  className,
}: NewsArticleContentProps) {
  const classes = [styles.content, className].filter(Boolean).join(" ");

  return <div className={classes} dangerouslySetInnerHTML={{ __html: html }} />;
}
