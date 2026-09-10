import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { Container } from "@/components/ui/Container/Container";
import { PRIVACY_POLICY_SECTIONS } from "@/constants/legal/privacy-policy-sections";
import { buildPageMetadata } from "@/lib/seo";
import { resolveLegalPage } from "@/lib/resolve-legal-page";
import { getSiteSettings } from "@/services/settings";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata({
    title: `Политика обработки персональных данных | ${settings.site.name}`,
    description:
      "Информация о том, какие персональные данные могут обрабатываться на сайте, с какой целью и какие права есть у пользователя.",
    path: "/privacy-policy",
    absoluteTitle: true,
    siteName: settings.site.name,
  });
}

export default async function PrivacyPolicyPage() {
  const legal = await resolveLegalPage({
    slug: "privacy-policy",
    fallbackTitle: "Политика обработки персональных данных",
    fallbackSections: PRIVACY_POLICY_SECTIONS,
  });

  return (
    <>
      <Container className={styles.breadcrumbsWrap}>
        <Breadcrumbs items={[{ label: legal.title }]} />
      </Container>
      <LegalDocument
        title={legal.title}
        intro="Здесь описаны принципы обработки персональных данных посетителей сайта, оформляющих заказ или отправляющих обращение через форму контактов."
        sections={legal.sections}
      />
    </>
  );
}
