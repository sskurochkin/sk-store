import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import {
  HOME_BENEFITS,
  type HomeBenefit,
} from "@/constants/home-benefits";
import styles from "./HomeBenefits.module.css";

function BenefitIcon({ icon }: { icon: HomeBenefit["icon"] }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "fresh":
      return (
        <svg {...common}>
          <path
            d="M12 3c2.8 3.2 4.5 6 4.5 8.6A4.5 4.5 0 0 1 12 16.1a4.5 4.5 0 0 1-4.5-4.5C7.5 9 9.2 6.2 12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 16.1V21"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "quality":
      return (
        <svg {...common}>
          <path
            d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8L12 3Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "order":
      return (
        <svg {...common}>
          <path
            d="M7 7h13l-1.4 7.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6 4H3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="20" r="1.2" fill="currentColor" />
          <circle cx="17" cy="20" r="1.2" fill="currentColor" />
        </svg>
      );
    case "delivery":
      return (
        <svg {...common}>
          <path
            d="M3 7h11v9H3V7Zm11 3h4.2L21 13.2V16h-7v-6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="17" cy="18.5" r="1.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
  }
}

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
              <span className={styles.icon}>
                <BenefitIcon icon={benefit.icon} />
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
