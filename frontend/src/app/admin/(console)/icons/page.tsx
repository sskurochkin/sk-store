import type { Metadata } from "next";
import { IconCatalog } from "@/components/admin/icons/IconCatalog";
import { EmptyState } from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { listSpriteIconNames } from "@/lib/list-sprite-icons";
import styles from "./icons-admin.module.css";

export const metadata: Metadata = {
  title: "Icons",
  robots: { index: false, follow: false },
};

export default async function AdminIconsPage() {
  const names = await listSpriteIconNames();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={1}>Icons</Heading>
          <Text muted>
            Справочник иконок из спрайта. Имя нужно для{" "}
            <code className={styles.code}>{`<Icon name="…" />`}</code>. Клик
            копирует имя в буфер.
          </Text>
        </div>
        <Text muted size="sm" className={styles.meta}>
          {names.length > 0
            ? `${names.length} иконок · public/icons/sprite.svg`
            : "Спрайт не найден"}
        </Text>
      </header>

      {names.length === 0 ? (
        <EmptyState
          title="Иконки не найдены"
          description="Положите SVG в src/assets/icons и выполните npm run build:icons."
        />
      ) : (
        <IconCatalog names={names} />
      )}
    </div>
  );
}
