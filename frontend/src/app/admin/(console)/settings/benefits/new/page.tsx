import type { Metadata } from "next";
import Link from "next/link";
import { HomeBenefitForm } from "@/components/admin/home-benefits/HomeBenefitForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import styles from "../../settings-admin.module.css";

export const metadata: Metadata = {
  title: "New home benefit",
  robots: { index: false, follow: false },
};

export default function AdminNewHomeBenefitPage() {
  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>Новое преимущество</Heading>
        <Text muted>Блок «Почему выбирают нас» на главной странице.</Text>
      </header>
      <HomeBenefitForm mode="create" />
    </div>
  );
}
