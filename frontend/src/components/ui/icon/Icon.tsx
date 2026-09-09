import { memo, type SVGAttributes } from "react";
import styles from "./Icon.module.css";

export type IconProps = Omit<SVGAttributes<SVGSVGElement>, "children"> & {
  /** Symbol `id` from `/public/icons/sprite.svg` (built via `npm run build:icons`). */
  name: string;
};

function IconComponent({ name, className, ...props }: IconProps) {
  const classes = [styles.icon, className].filter(Boolean).join(" ");
  const href = `/icons/sprite.svg#${encodeURIComponent(name)}`;

  return (
    <svg className={classes} aria-hidden="true" focusable="false" {...props}>
      <use href={href} />
    </svg>
  );
}

export const Icon = memo(IconComponent);
