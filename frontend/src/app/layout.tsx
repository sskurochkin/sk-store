import type { Metadata } from "next";
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
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
