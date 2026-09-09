import type { Metadata } from "next";
import Link from "next/link";
import { ProductsTable } from "@/components/admin/products/ProductsTable";
import { EmptyState, ErrorState } from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getRequestCookieHeader } from "@/services/auth-server";
import { listProductsAdmin } from "@/services/admin-products";
import type { Product } from "@/types/product";
import styles from "./products-admin.module.css";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  let products: Product[] = [];
  let loadFailed = false;

  try {
    const cookie = await getRequestCookieHeader();
    products = await listProductsAdmin(cookie);
  } catch {
    loadFailed = true;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <Heading level={1}>Products</Heading>
          <Text muted>Создание и редактирование товаров каталога.</Text>
        </div>
        <Link href="/admin/products/new" className={styles.createLink}>
          Новый продукт
        </Link>
      </header>

      {loadFailed ? (
        <ErrorState
          title="Не удалось загрузить продукты"
          description="Проверьте соединение и попробуйте обновить страницу."
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Пока нет продуктов"
          description="Создайте первый товар для каталога."
          action={
            <Link href="/admin/products/new" className={styles.createLink}>
              Создать
            </Link>
          }
        />
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  );
}
