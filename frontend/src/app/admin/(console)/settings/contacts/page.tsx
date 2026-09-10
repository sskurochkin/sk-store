import type { Metadata } from "next";
import Link from "next/link";
import { SiteSettingsContactsForm } from "@/components/admin/settings/SiteSettingsContactsForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getSettingsAdmin } from "@/services/admin-settings";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../settings-admin.module.css";

export const metadata: Metadata = {
  title: "Contact settings",
  robots: { index: false, follow: false },
};

export default async function AdminContactsSettingsPage() {
  const cookie = await getRequestCookieHeader();
  const settings = await getSettingsAdmin(cookie);

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>Контакты</Heading>
        <Text muted>
          Контактные данные для footer и страницы контактов, placeholders для
          политики ПДн.
        </Text>
      </header>
      <SiteSettingsContactsForm settings={settings} />
    </div>
  );
}
