import Link from "next/link";
import { SocialLinks } from "@/components/social/SocialLinks";
import { Container } from "@/components/ui/Container/Container";
import { Text } from "@/components/ui/Text/Text";
import { MAIN_NAV_LINKS } from "@/constants/navigation";
import { SITE_NAME } from "@/constants/site";
import { getSocials } from "@/services/socials";
import styles from "./Footer.module.css";

export async function Footer() {
  const socials = await getSocials();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.grid}>
        <div className={styles.brandBlock}>
          <p className={styles.brand}>{SITE_NAME}</p>
          <Text muted size="sm" className={styles.blurb}>
            Пекарня и витрина заказов. Подробности появятся на страницах каталога
            и контактов.
          </Text>
          <div className={styles.contactPlaceholder}>
            <Text muted size="sm">
              Контактная информация — скоро.
            </Text>
          </div>
        </div>

        <nav aria-label="Footer navigation">
          <p className={styles.heading}>Разделы</p>
          <ul className={styles.navList}>
            {MAIN_NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {socials.length > 0 ? (
          <div>
            <p className={styles.heading}>Мы в сети</p>
            <SocialLinks socials={socials} variant="footer" />
          </div>
        ) : null}
      </Container>

      <Container>
        <p className={styles.copy}>
          © {year} {SITE_NAME}
        </p>
      </Container>
    </footer>
  );
}
