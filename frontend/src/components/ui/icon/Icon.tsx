import clsx from "clsx";
import { memo, type SVGAttributes } from "react";
import styles from "./Icon.module.css";

export type IconProps = Omit<SVGAttributes<SVGSVGElement>, "children"> & {
  /** Symbol `id` from `/public/icons/sprite.svg` (built via `npm run build:icons`). */
  name: string;
};

function IconComponent({ name, className, ...props }: IconProps) {
  const href = `/icons/sprite.svg#${encodeURIComponent(name)}`;

  return (
    <svg
      className={clsx(styles.icon, className)}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <use href={href} />
    </svg>
  );
}

export const Icon = memo(IconComponent);
