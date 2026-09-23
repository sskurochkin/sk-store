import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getRequestCookieHeader } from "@/services/auth-server";
import { listMediaAdmin } from "@/services/admin-media";
import type { Media } from "@/types/media";
import styles from "./media-admin.module.css";

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  let items: Media[] = [];
  let loadFailed = false;

  try {
    const cookie = await getRequestCookieHeader();
    items = await listMediaAdmin(cookie);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={1}>Media</Heading>
          <Text muted>
            Загрузка и управление изображениями для каталога и новостей.
          </Text>
        </div>
      </header>

      <MediaLibrary initialItems={items} initialLoadFailed={loadFailed} />
    </div>
  );
}
