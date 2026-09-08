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
  const classes = [
    styles.section,
    styles[spacing],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} aria-labelledby={ariaLabelledBy}>
      {children}
    </Tag>
  );
}
