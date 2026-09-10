import Link from "next/link";
import { AdminPanelLink } from "@/components/layout/AdminPanelLink";
import { MiniCart } from "@/components/cart/MiniCart";
import { Container } from "@/components/ui/Container/Container";
import { MAIN_NAV_LINKS } from "@/constants/navigation";
import { getCurrentUser } from "@/services/auth-server";
import { getSiteSettings } from "@/services/settings";
import { MobileNav } from "./MobileNav";
import styles from "./Header.module.css";

export async function Header() {
  const [admin, settings] = await Promise.all([
    getCurrentUser(),
    getSiteSettings(),
  ]);

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link href="/" className={styles.brand}>
          {settings.site.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin-provided arbitrary logo URL
            <img
              src={settings.site.logoUrl}
              alt={settings.site.name}
              className={styles.logo}
            />
          ) : (
            settings.site.name
          )}
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

        <div className={styles.actions}>
          {admin ? <AdminPanelLink /> : null}
          <MiniCart />
          <MobileNav links={MAIN_NAV_LINKS} />
        </div>
      </Container>
    </header>
  );
}
