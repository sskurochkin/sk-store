import type { Metadata } from "next";
import Link from "next/link";
import { SocialForm } from "@/components/admin/socials/SocialForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import styles from "../../settings-admin.module.css";

export const metadata: Metadata = {
  title: "New social",
  robots: { index: false, follow: false },
};

export default function AdminNewSocialPage() {
  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>Новая соцсеть</Heading>
        <Text muted>
          Укажите название, ссылку (http/https) и icon (имя / URL / ключ).
        </Text>
      </header>
      <SocialForm mode="create" />
    </div>
  );
}
