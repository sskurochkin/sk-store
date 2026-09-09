import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./IconButton.module.css";

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> & {
  /** Required for accessibility when the button has no visible text. */
  "aria-label": string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

export function IconButton({
  children,
  className,
  size = "md",
  type = "button",
  disabled,
  "aria-label": ariaLabel,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={clsx(styles.iconButton, styles[size], className)}
      disabled={disabled}
      aria-label={ariaLabel}
      {...rest}
    >
      {children}
    </button>
  );
}
