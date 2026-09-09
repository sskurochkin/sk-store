import type { Metadata } from "next";
import { ContactRequestForm } from "@/components/contact/ContactRequestForm";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SocialLinks } from "@/components/social/SocialLinks";
import { Container } from "@/components/ui/Container/Container";
import { EmptyState } from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { SITE_NAME } from "@/constants/site";
import { buildPageMetadata } from "@/lib/seo";
import { getSocials } from "@/services/socials";
import styles from "./page.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Контакты",
  description: `Свяжитесь с ${SITE_NAME}: форма заявки и социальные сети`,
  path: "/contacts",
});

export default async function ContactsPage() {
  const socials = await getSocials();

  return (
    <Section
      spacing="lg"
      className={styles.section}
      aria-labelledby="contacts-heading"
    >
      <Container>
        <Breadcrumbs items={[{ label: "Контакты" }]} />

        <header className={styles.header}>
          <Heading id="contacts-heading" level={1}>
            Контакты
          </Heading>
          <Text muted className={styles.intro}>
            Оставьте заявку через форму или свяжитесь с нами в социальных сетях.
          </Text>
        </header>

        <div className={styles.stack}>
          <section
            className={styles.socials}
            aria-labelledby="contacts-socials-heading"
          >
            <Heading
              id="contacts-socials-heading"
              level={2}
              className={styles.subheading}
            >
              Мы в сети
            </Heading>

            {socials.length > 0 ? (
              <SocialLinks socials={socials} variant="cards" />
            ) : (
              <EmptyState
                title="Социальные сети пока не указаны"
                description="Ссылки появятся здесь, когда администратор добавит их."
              />
            )}
          </section>

          <section
            className={styles.mapSection}
            aria-labelledby="contacts-map-heading"
          >
            <Heading
              id="contacts-map-heading"
              level={2}
              className={styles.subheading}
            >
              Карта
            </Heading>
            <div className={styles.mapPlaceholder}>
              <Text muted>
                Карта появится здесь позже. Адрес и координаты пока не
                опубликованы.
              </Text>
            </div>
          </section>

          <section
            className={styles.formSection}
            aria-labelledby="contact-request-heading"
          >
            <ContactRequestForm />
          </section>
        </div>
      </Container>
    </Section>
  );
}
