import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SocialDeleteButton } from "@/components/admin/socials/SocialDeleteButton";
import { SocialForm } from "@/components/admin/socials/SocialForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getRequestCookieHeader } from "@/services/auth-server";
import { listSocialsAdmin } from "@/services/admin-socials";
import styles from "../../../settings-admin.module.css";

type EditSocialPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditSocialPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit social · ${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditSocialPage({
  params,
}: EditSocialPageProps) {
  const { id } = await params;
  const cookie = await getRequestCookieHeader();
  let social;

  try {
    const socials = await listSocialsAdmin(cookie);
    social = socials.find((item) => item.id === id);
  } catch {
    notFound();
  }

  if (!social) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/settings" className={styles.backLink}>
          ← К настройкам
        </Link>
        <Heading level={1}>Редактирование</Heading>
        <Text muted>{social.name}</Text>
      </header>

      <SocialForm mode="edit" social={social} />

      <section className={styles.dangerZone} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.dangerTitle}>
          Удаление
        </h2>
        <Text muted size="sm">
          Удаление необратимо. Ссылка исчезнет из футера и контактов после
          сброса кэша.
        </Text>
        <SocialDeleteButton socialId={social.id} socialName={social.name} />
      </section>
    </div>
  );
}
