import { Text } from "@/components/ui/Text/Text";
import type { SiteSettingsPublic } from "@/types/site-settings";
import styles from "./SiteContactsDetails.module.css";

type SiteContactsDetailsProps = {
  contacts: SiteSettingsPublic["contacts"];
  variant?: "footer" | "page";
};

export function SiteContactsDetails({
  contacts,
  variant = "page",
}: SiteContactsDetailsProps) {
  const hasAny =
    contacts.phone || contacts.email || contacts.address || contacts.workingHours;

  if (!hasAny) {
    return variant === "footer" ? (
      <Text muted size="sm">
        Контактная информация — скоро.
      </Text>
    ) : null;
  }

  return (
    <dl className={styles.list} data-variant={variant}>
      {contacts.phone ? (
        <div className={styles.item}>
          <dt className={styles.term}>Телефон</dt>
          <dd className={styles.value}>
            <a href={`tel:${contacts.phone.replace(/\s/g, "")}`}>
              {contacts.phone}
            </a>
          </dd>
        </div>
      ) : null}
      {contacts.email ? (
        <div className={styles.item}>
          <dt className={styles.term}>Email</dt>
          <dd className={styles.value}>
            <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
          </dd>
        </div>
      ) : null}
      {contacts.address ? (
        <div className={styles.item}>
          <dt className={styles.term}>Адрес</dt>
          <dd className={styles.value}>{contacts.address}</dd>
        </div>
      ) : null}
      {contacts.workingHours ? (
        <div className={styles.item}>
          <dt className={styles.term}>Часы работы</dt>
          <dd className={styles.value}>{contacts.workingHours}</dd>
        </div>
      ) : null}
    </dl>
  );
}
