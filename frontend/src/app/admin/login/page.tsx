import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { SITE_NAME } from "@/constants/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Вход в админку",
  robots: { index: false, follow: false },
};

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const rawNext = params.next;
  const nextPath = Array.isArray(rawNext) ? rawNext[0] : rawNext;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p className={styles.brand}>{SITE_NAME}</p>
          <Heading id="admin-login-heading" level={1} className={styles.title}>
            Вход в админ-панель
          </Heading>
          <Text muted>Введите учётные данные администратора.</Text>
        </header>
        <AdminLoginForm nextPath={nextPath} />
        <p className={styles.footer}>
          <Link href="/" className={styles.siteLink}>
            ← На главную
          </Link>
        </p>
      </div>
    </div>
  );
}
