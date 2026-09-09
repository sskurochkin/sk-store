import clsx from "clsx";
import { Icon } from "@/components/ui/icon/Icon";
import type { Social } from "@/types/social";
import styles from "./SocialLinks.module.css";

export type SocialLinksVariant = "footer" | "cards" | "inline" | "preview";

type SocialLinksProps = {
  socials: Social[];
  /**
   * Visual modifier:
   * - `footer` — compact vertical list (site footer)
   * - `cards` — card grid (contacts page)
   * - `inline` — horizontal wrap
   * - `preview` — icon + sprite key (admin tables)
   */
  variant?: SocialLinksVariant;
  /** Override label visibility (defaults depend on variant). */
  showName?: boolean;
  className?: string;
  "aria-label"?: string;
};

const VARIANT_SHOW_NAME: Record<SocialLinksVariant, boolean> = {
  footer: true,
  cards: true,
  inline: true,
  preview: false,
};

/**
 * Shared social links list. `social.icon` is a sprite symbol id (e.g. `i-instagram`).
 */
export function SocialLinks({
  socials,
  variant = "cards",
  showName,
  className,
  "aria-label": ariaLabel = "Социальные сети",
}: SocialLinksProps) {
  if (socials.length === 0) {
    return null;
  }

  const withName = showName ?? VARIANT_SHOW_NAME[variant];
  const showKey = variant === "preview";

  return (
    <ul
      className={clsx(styles.list, styles[variant], className)}
      aria-label={ariaLabel}
    >
      {socials.map((social) => (
        <li key={social.id} className={styles.item}>
          <a
            href={social.link}
            className={clsx(styles.link, styles[`${variant}Link`])}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              withName
                ? undefined
                : `${social.name} (откроется в новой вкладке)`
            }
          >
            <span className={styles.iconWrap} aria-hidden="true">
              <Icon name={social.icon} className={styles.icon} />
            </span>
            {withName ? (
              <span className={styles.name}>{social.name}</span>
            ) : null}
            {showKey ? (
              <span className={styles.key}>{social.icon}</span>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
