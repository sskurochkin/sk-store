import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CookieSettingsButton } from "@/components/cookie-consent/CookieSettingsButton";
import { LegalDocument } from "@/components/legal/LegalDocument";
import legalStyles from "@/components/legal/LegalDocument.module.css";
import { Container } from "@/components/ui/Container/Container";
import { COOKIE_POLICY_SECTIONS } from "@/constants/legal/cookie-policy-sections";
import { buildPageMetadata } from "@/lib/seo";
import { resolveLegalPage } from "@/lib/resolve-legal-page";
import { getSiteSettings } from "@/services/settings";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata({
    title: `Обработка файлов cookie | ${settings.site.name}`,
    description:
      "Как сайт использует cookie и localStorage, какие категории существуют и как изменить свой выбор.",
    path: "/cookie-policy",
    absoluteTitle: true,
    siteName: settings.site.name,
  });
}

export default async function CookiePolicyPage() {
  const legal = await resolveLegalPage({
    slug: "cookie-policy",
    fallbackTitle: "Обработка файлов cookie",
    fallbackSections: COOKIE_POLICY_SECTIONS,
  });

  return (
    <>
      <Container className={styles.breadcrumbsWrap}>
        <Breadcrumbs items={[{ label: legal.title }]} />
      </Container>
      <LegalDocument
        title={legal.title}
        intro="На этой странице описаны категории cookie и аналогичных технологий, которые может использовать сайт, и способы управления вашим выбором."
        sections={legal.sections}
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
