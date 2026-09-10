import Link from "next/link";
import { Text } from "@/components/ui/Text/Text";
import type { SiteSettingsPublic } from "@/types/site-settings";
import styles from "./ContactsMap.module.css";

type ContactsMapProps = {
  map: SiteSettingsPublic["map"];
};

export function ContactsMap({ map }: ContactsMapProps) {
  if (!map.enabled) {
    return (
      <div className={styles.placeholder}>
        <Text muted>
          Карта появится здесь позже. Адрес и координаты пока не
          опубликованы.
        </Text>
      </div>
    );
  }

  if (map.embedUrl) {
    return (
      <div className={styles.embedWrap}>
        <iframe
          title="Карта"
          src={map.embedUrl}
          className={styles.embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        {map.linkUrl ? (
          <p className={styles.linkRow}>
            <Link href={map.linkUrl} className={styles.externalLink} target="_blank" rel="noopener noreferrer">
              Открыть в картах
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  if (map.linkUrl) {
    return (
      <div className={styles.placeholder}>
        <Link href={map.linkUrl} className={styles.externalLink} target="_blank" rel="noopener noreferrer">
          Открыть адрес в картах
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.placeholder}>
      <Text muted>Карта включена, но URL embed или ссылка не заданы в настройках.</Text>
    </div>
  );
}
