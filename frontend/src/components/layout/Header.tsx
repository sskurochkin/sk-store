import Link from "next/link";
import { Container } from "@/components/ui/Container/Container";
import { MAIN_NAV_LINKS } from "@/constants/navigation";
import { SITE_NAME } from "@/constants/site";
import { MobileNav } from "./MobileNav";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link href="/" className={styles.brand}>
          {SITE_NAME}
        </Link>

        <nav className={styles.desktopNav} aria-label="Main navigation">
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

        <MobileNav links={MAIN_NAV_LINKS} />
      </Container>
    </header>
  );
}
