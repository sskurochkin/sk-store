import type { Metadata } from "next";
import "@/styles/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SK Store",
  description: "Bakery showcase and ordering website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
