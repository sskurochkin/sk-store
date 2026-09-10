import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CookieSettingsButton } from "@/components/cookie-consent/CookieSettingsButton";
import { LegalDocument } from "@/components/legal/LegalDocument";
import legalStyles from "@/components/legal/LegalDocument.module.css";
import { Container } from "@/components/ui/Container/Container";
import { COOKIE_POLICY_SECTIONS } from "@/constants/legal/cookie-policy-sections";
import { SITE_NAME } from "@/constants/site";
import { buildPageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: `Обработка файлов cookie | ${SITE_NAME}`,
  description:
    "Как SK Store использует cookie и localStorage, какие категории существуют и как изменить свой выбор.",
  path: "/cookie-policy",
  absoluteTitle: true,
});

export default function CookiePolicyPage() {
  return (
    <>
      <Container className={styles.breadcrumbsWrap}>
        <Breadcrumbs items={[{ label: "Обработка файлов cookie" }]} />
      </Container>
      <LegalDocument
        title="Обработка файлов cookie"
        intro="На этой странице описаны категории cookie и аналогичных технологий, которые может использовать сайт, и способы управления вашим выбором."
        sections={COOKIE_POLICY_SECTIONS}
        footer={
          <>
            <CookieSettingsButton variant="secondary">
              Настройки cookie
            </CookieSettingsButton>
            <Link href="/privacy-policy" className={legalStyles.inlineLink}>
              Политика обработки персональных данных
            </Link>
          </>
        }
      />
    </>
  );
}
