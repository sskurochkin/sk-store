import Link from "next/link";
import { FooterCookieSettingsLink } from "@/components/layout/FooterCookieSettingsLink";
import { SocialLinks } from "@/components/social/SocialLinks";
import { SiteContactsDetails } from "@/components/site/SiteContactsDetails";
import { Container } from "@/components/ui/Container/Container";
import { Text } from "@/components/ui/Text/Text";
import { FOOTER_LEGAL_LINKS } from "@/constants/legal-links";
import { MAIN_NAV_LINKS } from "@/constants/navigation";
import { getSiteSettings } from "@/services/settings";
import { getSocials } from "@/services/socials";
import styles from "./Footer.module.css";

export async function Footer() {
  const [socials, settings] = await Promise.all([getSocials(), getSiteSettings()]);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.grid}>
        <div className={styles.brandBlock}>
          <p className={styles.brand}>{settings.site.name}</p>
          {settings.site.footerBlurb ? (
            <Text muted size="sm" className={styles.blurb}>
              {settings.site.footerBlurb}
            </Text>
          ) : null}
          <div className={styles.contactPlaceholder}>
            <SiteContactsDetails contacts={settings.contacts} variant="footer" />
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

        <nav aria-label="Документы">
          <p className={styles.heading}>Документы</p>
          <ul className={styles.navList}>
            {FOOTER_LEGAL_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <FooterCookieSettingsLink />
            </li>
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
          © {year} {settings.site.name}
        </p>
      </Container>
    </footer>
  );
}
