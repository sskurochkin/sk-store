import { Button } from "@/components/ui/Button/Button";
import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { SITE_NAME } from "@/constants/site";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main>
      <Section spacing="lg" className={styles.hero} aria-labelledby="home-brand">
        <Container className={styles.heroInner}>
          <Heading id="home-brand" level={1} className={styles.brand}>
            {SITE_NAME}
          </Heading>
          <Text size="lg" muted className={styles.lead}>
            Свежая выпечка к вашему столу.
          </Text>
          <div className={styles.actions}>
            <Button type="button" variant="primary" size="lg" disabled>
              Каталог скоро
            </Button>
            <Button type="button" variant="ghost" size="lg" disabled>
              Новости
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  );
}
