import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./Container.module.css";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** Narrow readable column for long-form content */
  narrow?: boolean;
  as?: "div" | "main" | "article" | "section";
};

export function Container({
  children,
  className,
  narrow = false,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag className={clsx(styles.container, narrow && styles.narrow, className)}>
      {children}
    </Tag>
  );
}
