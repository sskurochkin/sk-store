import type { Metadata } from "next";
import Link from "next/link";
import { SiteSettingsSeoForm } from "@/components/admin/settings/SiteSettingsSeoForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getSettingsAdmin } from "@/services/admin-settings";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../settings-admin.module.css";

export const metadata: Metadata = {
  title: "SEO settings",
  robots: { index: false, follow: false },
};

export default async function AdminSeoSettingsPage() {
  const cookie = await getRequestCookieHeader();
  const settings = await getSettingsAdmin(cookie);

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>SEO</Heading>
        <Text muted>
          Meta description, robots, Open Graph и счётчики аналитики (GA / Яндекс.Метрика).
        </Text>
      </header>
      <SiteSettingsSeoForm settings={settings} />
    </div>
  );
}
