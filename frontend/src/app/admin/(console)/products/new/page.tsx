import type { Metadata } from "next";
import Link from "next/link";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import styles from "../products-admin.module.css";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default function AdminNewProductPage() {
  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/products" className={styles.backLink}>
          ← К списку
        </Link>
        <Heading level={1}>Новый продукт</Heading>
        <Text muted>
          Заполните поля. Main photo и gallery — URL или storage key.
        </Text>
      </header>
      <ProductForm mode="create" />
    </div>
  );
}
