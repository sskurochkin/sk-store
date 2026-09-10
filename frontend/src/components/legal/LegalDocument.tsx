import type { LegalSection } from "@/types/legal-page";
import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import styles from "./LegalDocument.module.css";

type LegalDocumentProps = {
  title: string;
  intro: string;
  sections: LegalSection[];
  /** Optional content below sections (e.g. cookie settings button). */
  footer?: React.ReactNode;
};

export function LegalDocument({
  title,
  intro,
  sections,
  footer,
}: LegalDocumentProps) {
  return (
    <Section spacing="lg" className={styles.section} aria-labelledby="legal-doc-heading">
      <Container narrow>
        <header className={styles.header}>
          <Heading id="legal-doc-heading" level={1}>
            {title}
          </Heading>
          <Text muted className={styles.intro}>
            {intro}
          </Text>
          <Text muted size="sm" className={styles.paragraphMuted}>
            Документ носит информационный характер и требует проверки юристом
            оператора сайта перед публикацией в production.
          </Text>
        </header>

        <div className={styles.body}>
          {sections.map((block) => (
            <section
              key={block.id}
              id={block.id}
              className={styles.block}
              aria-labelledby={`${block.id}-heading`}
            >
              <h2 id={`${block.id}-heading`} className={styles.blockTitle}>
                {block.title}
              </h2>
              {block.paragraphs.map((paragraph, index) => (
                <p key={index} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          {footer ? <div className={styles.actions}>{footer}</div> : null}
        </div>
      </Container>
    </Section>
  );
}
