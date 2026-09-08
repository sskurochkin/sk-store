import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
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
        <Header />
        <main id="main-content" className={styles.main}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
