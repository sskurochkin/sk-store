import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Text.module.css";

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "div";
  size?: "xs" | "sm" | "md" | "lg";
  muted?: boolean;
  children: ReactNode;
};

export function Text({
  as: Tag = "p",
  size = "md",
  muted = false,
  children,
  className,
  ...rest
}: TextProps) {
  const classes = [
    styles.text,
    styles[size],
    muted ? styles.muted : undefined,
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
