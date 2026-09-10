import type { Metadata } from "next";
import Link from "next/link";
import { SiteSettingsMapForm } from "@/components/admin/settings/SiteSettingsMapForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getSettingsAdmin } from "@/services/admin-settings";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../settings-admin.module.css";

export const metadata: Metadata = {
  title: "Map settings",
  robots: { index: false, follow: false },
};

export default async function AdminMapSettingsPage() {
  const cookie = await getRequestCookieHeader();
  const settings = await getSettingsAdmin(cookie);

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>Карта</Heading>
        <Text muted>
          Включение карты на странице контактов, URL embed и внешняя ссылка.
        </Text>
      </header>
      <SiteSettingsMapForm settings={settings} />
    </div>
  );
}
