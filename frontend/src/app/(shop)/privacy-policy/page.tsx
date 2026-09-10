import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { Container } from "@/components/ui/Container/Container";
import { PRIVACY_POLICY_SECTIONS } from "@/constants/legal/privacy-policy-sections";
import { SITE_NAME } from "@/constants/site";
import { buildPageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: `Политика обработки персональных данных | ${SITE_NAME}`,
  description:
    "Информация о том, какие персональные данные могут обрабатываться на SK Store, с какой целью и какие права есть у пользователя.",
  path: "/privacy-policy",
  absoluteTitle: true,
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <Container className={styles.breadcrumbsWrap}>
        <Breadcrumbs
          items={[{ label: "Политика обработки персональных данных" }]}
        />
      </Container>
      <LegalDocument
        title="Политика обработки персональных данных"
        intro="Здесь описаны принципы обработки персональных данных посетителей сайта, оформляющих заказ или отправляющих обращение через форму контактов."
        sections={PRIVACY_POLICY_SECTIONS}
      />
    </>
  );
}
