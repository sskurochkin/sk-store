import type { Metadata } from "next";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { SITE_NAME } from "@/constants/site";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: "Bakery showcase and ordering website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={styles.body}>
        <ToastProvider>
          <CartProvider>
            <Header />
            <main id="main-content" className={styles.main}>
              {children}
            </main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
