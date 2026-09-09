import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Heading.module.css";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level: HeadingLevel;
  children: ReactNode;
};

const TAG_BY_LEVEL = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

const LEVEL_CLASS: Record<HeadingLevel, string> = {
  1: styles.h1,
  2: styles.h2,
  3: styles.h3,
  4: styles.h4,
  5: styles.h5,
  6: styles.h6,
};

export function Heading({
  level,
  children,
  className,
  ...rest
}: HeadingProps) {
  const Tag = TAG_BY_LEVEL[level];

  return (
    <Tag
      className={clsx(styles.heading, LEVEL_CLASS[level], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
