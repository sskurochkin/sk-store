import type { Metadata } from "next";
import { ContactRequestForm } from "@/components/contact/ContactRequestForm";
import { ContactsMap } from "@/components/contacts/ContactsMap";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SocialLinks } from "@/components/social/SocialLinks";
import { SiteContactsDetails } from "@/components/site/SiteContactsDetails";
import { Container } from "@/components/ui/Container/Container";
import { EmptyState } from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { buildPageMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/services/settings";
import { getSocials } from "@/services/socials";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildPageMetadata({
    title: "Контакты",
    description: `Свяжитесь с ${settings.site.name}: форма заявки, контакты и социальные сети`,
    path: "/contacts",
    siteName: settings.site.name,
  });
}

export default async function ContactsPage() {
  const [socials, settings] = await Promise.all([getSocials(), getSiteSettings()]);

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
            Оставьте заявку через форму или свяжитесь с нами напрямую.
          </Text>
        </header>

        <div className={styles.stack}>
          <section
            className={styles.contactDetails}
            aria-labelledby="contacts-details-heading"
          >
            <Heading
              id="contacts-details-heading"
              level={2}
              className={styles.subheading}
            >
              Как с нами связаться
            </Heading>
            <SiteContactsDetails contacts={settings.contacts} variant="page" />
          </section>

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
            <ContactsMap map={settings.map} />
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
