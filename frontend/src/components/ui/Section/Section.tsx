import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./Section.module.css";

export type SectionProps = {
  children: ReactNode;
  className?: string;
  /** Vertical spacing density */
  spacing?: "sm" | "md" | "lg";
  as?: "section" | "div" | "header" | "footer" | "main";
  "aria-labelledby"?: string;
};

export function Section({
  children,
  className,
  spacing = "md",
  as: Tag = "section",
  "aria-labelledby": ariaLabelledBy,
}: SectionProps) {
  return (
    <Tag
      className={clsx(styles.section, styles[spacing], className)}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Tag>
  );
}
