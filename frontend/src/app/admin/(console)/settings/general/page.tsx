import type { Metadata } from "next";
import Link from "next/link";
import { SiteSettingsGeneralForm } from "@/components/admin/settings/SiteSettingsGeneralForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getSettingsAdmin } from "@/services/admin-settings";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../settings-admin.module.css";

export const metadata: Metadata = {
  title: "General settings",
  robots: { index: false, follow: false },
};

export default async function AdminGeneralSettingsPage() {
  const cookie = await getRequestCookieHeader();
  const settings = await getSettingsAdmin(cookie);

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>Общие настройки</Heading>
        <Text muted>
          Название сайта, логотип, слоган, описание и текст в подвале.
        </Text>
      </header>
      <SiteSettingsGeneralForm settings={settings} />
    </div>
  );
}
