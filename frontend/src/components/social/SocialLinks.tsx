import type { Social } from "@/types/social";
import styles from "./SocialLinks.module.css";

type SocialLinksProps = {
  socials: Social[];
};

/**
 * Public social link list. Renders plain-text icon labels (never HTML).
 * Server Component — pass data from getSocials().
 */
export function SocialLinks({ socials }: SocialLinksProps) {
  if (socials.length === 0) {
    return null;
  }

  return (
    <ul className={styles.list}>
      {socials.map((social) => (
        <li key={social.id}>
          <a
            href={social.link}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={styles.icon} aria-hidden="true">
              {social.icon}
            </span>
            <span className={styles.name}>{social.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
