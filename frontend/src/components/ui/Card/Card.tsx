import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

export type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: "article" | "div" | "section" | "li";
  padded?: boolean;
};

export function Card({
  children,
  className,
  as: Tag = "article",
  padded = true,
  ...rest
}: CardProps) {
  const classes = [
    styles.card,
    padded ? styles.padded : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
