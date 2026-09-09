import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDeleteButton } from "@/components/admin/products/ProductDeleteButton";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Heading } from "@/components/ui/Heading/Heading";
import { Text } from "@/components/ui/Text/Text";
import { getRequestCookieHeader } from "@/services/auth-server";
import { listProductsAdmin } from "@/services/admin-products";
import styles from "../../products-admin.module.css";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit product · ${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const cookie = await getRequestCookieHeader();
  let product;

  try {
    const products = await listProductsAdmin(cookie);
    product = products.find((item) => item.id === id);
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <header className={styles.headerText}>
        <Link href="/admin/products" className={styles.backLink}>
          ← К списку
        </Link>
        <Heading level={1}>Редактирование</Heading>
        <Text muted>{product.name}</Text>
      </header>

      <ProductForm mode="edit" product={product} />

      <section className={styles.dangerZone} aria-labelledby="delete-heading">
        <h2 id="delete-heading" className={styles.dangerTitle}>
          Удаление
        </h2>
        <Text muted size="sm">
          Удаление необратимо. Публичная страница товара исчезнет после
          обновления кэша каталога.
        </Text>
        <ProductDeleteButton
          productId={product.id}
          productName={product.name}
        />
      </section>
    </div>
  );
}
