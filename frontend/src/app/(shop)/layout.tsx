import { CartProvider } from "@/components/cart/CartProvider";
import { CookieConsentBanner } from "@/components/cookie-consent/CookieConsentBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteAnalytics } from "@/components/site/SiteAnalytics";
import { getSiteSettings } from "@/services/settings";
import styles from "../layout.module.css";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <CartProvider>
      <Header />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      <Footer />
      <CookieConsentBanner />
      {settings.seo.googleAnalyticsId || settings.seo.yandexMetrikaId ? (
        <SiteAnalytics
          googleAnalyticsId={settings.seo.googleAnalyticsId}
          yandexMetrikaId={settings.seo.yandexMetrikaId}
        />
      ) : null}
    </CartProvider>
  );
}
