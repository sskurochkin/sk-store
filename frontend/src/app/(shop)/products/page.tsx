import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container/Container";
import { EmptyState, ErrorState } from "@/components/ui/FeedbackState/FeedbackState";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { buildPageMetadata } from "@/lib/seo";
import { getProducts } from "@/services/products";
import type { Product } from "@/types/product";
import styles from "./page.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "Продукты",
  description: "Каталог свежей выпечки SK Store",
  path: "/products",
});

export default async function ProductsPage() {
  let products: Product[] = [];
  let loadFailed = false;

  try {
    products = await getProducts();
  } catch {
    loadFailed = true;
  }

  return (
    <Section spacing="lg" className={styles.section} aria-labelledby="products-heading">
      <Container>
        <Breadcrumbs items={[{ label: "Продукты" }]} />
        <header className={styles.header}>
          <Heading id="products-heading" level={1}>
            Продукты
          </Heading>
          <Text muted>Свежая выпечка из нашей пекарни.</Text>
        </header>

        {loadFailed ? (
          <ErrorState
            title="Не удалось загрузить продукты"
            description="Проверьте соединение и попробуйте обновить страницу."
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="Пока нет продуктов"
            description="Скоро здесь появится каталог выпечки."
          />
        ) : (
          <ul className={styles.grid}>
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
}
