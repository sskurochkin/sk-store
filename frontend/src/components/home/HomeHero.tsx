import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import type { SiteSettingsPublic } from "@/types/site-settings";
import styles from "./HomeHero.module.css";

const HOME_INTRO =
  "Пекарня с каталогом свежей выпечки, новостями и удобной заявкой онлайн. Выберите любимые изделия или напишите нам — поможем с заказом.";

type HomeHeroProps = {
  formTargetId: string;
  settings: SiteSettingsPublic;
};

export function HomeHero({ formTargetId, settings }: HomeHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="home-brand">
      <div className={styles.media} aria-hidden="true">
        <div className={styles.mediaPlaceholder}>
          <span className={styles.mediaLabel}>Изображение баннера</span>
        </div>
      </div>

      <div className={styles.content}>
        <Container className={styles.contentInner}>
          <Heading id="home-brand" level={1} className={styles.brand}>
            {settings.site.name}
          </Heading>
          <Text size="lg" className={styles.tagline}>
            {settings.site.tagline ?? settings.site.description}
          </Text>
          <Text muted className={styles.description}>
            {HOME_INTRO}
          </Text>
          <a href={`#${formTargetId}`} className={styles.cta}>
            Оставить заявку
          </a>
        </Container>
      </div>
    </section>
  );
}
