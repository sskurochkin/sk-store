import type { Metadata } from "next";
import Link from "next/link";
import { NewsForm } from "@/components/admin/news/NewsForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import styles from "../news-admin.module.css";

export const metadata: Metadata = {
  title: "New news",
  robots: { index: false, follow: false },
};

export default function AdminNewNewsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/news" className={styles.backLink}>
          ← К списку
        </Link>
        <Heading level={1}>Новая новость</Heading>
        <Text muted>
          Content — HTML (сервер очистит опасные теги). Main photo — URL или
          storage key.
        </Text>
      </header>
      <NewsForm mode="create" />
    </div>
  );
}
