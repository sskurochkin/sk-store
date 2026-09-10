import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HomeBenefitForm } from "@/components/admin/home-benefits/HomeBenefitForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { listHomeBenefitsAdmin } from "@/services/admin-home-benefits";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../../../settings-admin.module.css";

export const metadata: Metadata = {
  title: "Edit home benefit",
  robots: { index: false, follow: false },
};

type AdminEditHomeBenefitPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditHomeBenefitPage({
  params,
}: AdminEditHomeBenefitPageProps) {
  const { id } = await params;
  const cookie = await getRequestCookieHeader();
  const benefits = await listHomeBenefitsAdmin(cookie);
  const benefit = benefits.find((item) => item.id === id);

  if (!benefit) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>Редактирование преимущества</Heading>
        <Text muted>{benefit.title}</Text>
      </header>
      <HomeBenefitForm mode="edit" benefit={benefit} />
    </div>
  );
}
