import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";
import { Icon } from "@/components/ui/icon/Icon";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { HOME_BENEFITS } from "@/constants/home-benefits";
import styles from "./HomeBenefits.module.css";

export function HomeBenefits() {
  return (
    <Section
      spacing="lg"
      className={styles.section}
      aria-labelledby="home-benefits-heading"
    >
      <Container>
        <header className={styles.header}>
          <Heading id="home-benefits-heading" level={2}>
            Почему выбирают нас
          </Heading>
          <Text muted>
            Коротко о том, чем удобна пекарня SK Store — данные пока демонстрационные.
          </Text>
        </header>

        <ul className={styles.grid}>
          {HOME_BENEFITS.map((benefit) => (
            <li key={benefit.id} className={styles.item}>
              <span className={styles.iconWrap}>
                <Icon name={benefit.icon} className={styles.icon} />
              </span>
              <div className={styles.copy}>
                <h3 className={styles.title}>{benefit.title}</h3>
                <p className={styles.description}>{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
