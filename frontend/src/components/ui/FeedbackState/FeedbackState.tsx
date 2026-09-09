import clsx from "clsx";
import type { ReactNode } from "react";
import { Text } from "../Text/Text";
import styles from "./FeedbackState.module.css";

type BaseStateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function LoadingState({
  title = "Loading…",
  description,
  className,
}: Partial<BaseStateProps> & { title?: string }) {
  return (
    <div
      className={clsx(styles.state, className)}
      role="status"
      aria-live="polite"
    >
      <span className={styles.spinner} aria-hidden="true" />
      <p className={styles.title}>{title}</p>
      {description ? (
        <Text muted size="sm">
          {description}
        </Text>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: BaseStateProps) {
  return (
    <div className={clsx(styles.state, className)}>
      <p className={styles.title}>{title}</p>
      {description ? (
        <Text muted size="sm">
          {description}
        </Text>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
  className,
}: BaseStateProps) {
  return (
    <div
      className={clsx(styles.state, styles.error, className)}
      role="alert"
    >
      <p className={styles.title}>{title}</p>
      {description ? (
        <Text muted size="sm">
          {description}
        </Text>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
