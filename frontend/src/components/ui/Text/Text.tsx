import clsx from "clsx";
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
  return (
    <Tag
      className={clsx(
        styles.text,
        styles[size],
        muted && styles.muted,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
