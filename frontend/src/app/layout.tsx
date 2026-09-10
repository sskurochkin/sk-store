import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { getSiteUrl } from "@/constants/site";
import { isAbsoluteHttpUrl } from "@/lib/seo";
import { resolveSiteSeo } from "@/lib/resolve-site-seo";
import { getSiteSettings } from "@/services/settings";
import "./globals.css";
import styles from "./layout.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = resolveSiteSeo(settings);
  const imageUrl =
    seo.ogImageUrl && isAbsoluteHttpUrl(seo.ogImageUrl)
      ? seo.ogImageUrl
      : undefined;
  const images = imageUrl ? [{ url: imageUrl }] : undefined;

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: seo.siteName,
      template: `%s · ${seo.siteName}`,
    },
    description: seo.description,
    ...(seo.keywords ? { keywords: seo.keywords } : {}),
    robots: seo.robots,
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: seo.siteName,
      title: seo.ogTitle,
      description: seo.ogDescription,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: seo.ogTitle,
      description: seo.ogDescription,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={styles.body}>
        <NextTopLoader
          color="#4a3728"
          height={3}
          showSpinner={false}
          crawlSpeed={200}
          speed={200}
          easing="ease"
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
