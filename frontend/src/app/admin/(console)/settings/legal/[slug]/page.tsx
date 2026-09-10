import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LegalPageForm } from "@/components/admin/legal/LegalPageForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getLegalPageAdmin } from "@/services/admin-legal-pages";
import { getRequestCookieHeader } from "@/services/auth-server";
import styles from "../../settings-admin.module.css";

const ALLOWED_SLUGS = new Set(["privacy-policy", "cookie-policy"]);

type AdminLegalPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: AdminLegalPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Legal: ${slug}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminLegalPage({ params }: AdminLegalPageProps) {
  const { slug } = await params;

  if (!ALLOWED_SLUGS.has(slug)) {
    notFound();
  }

  const cookie = await getRequestCookieHeader();
  const page = await getLegalPageAdmin(slug, cookie);

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>{page.title}</Heading>
        <Text muted>Редактирование юридического документа /{slug}</Text>
      </header>
      <LegalPageForm page={page} />
    </div>
  );
}
