import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchaseControls } from "@/components/product/ProductPurchaseControls";
import { Container } from "@/components/ui/Container/Container";
import { Heading } from "@/components/ui/Heading/Heading";
import { Section } from "@/components/ui/Section/Section";
import { Text } from "@/components/ui/Text/Text";
import { formatPrice } from "@/lib/format-price";
import { getProductByAlias } from "@/services/products";
import styles from "./page.module.css";

type ProductDetailPageProps = {
  params: Promise<{ alias: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { alias } = await params;
  const product = await getProductByAlias(alias);

  if (!product) {
    return { title: "Товар не найден" };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { alias } = await params;
  const product = await getProductByAlias(alias);

  if (!product) {
    notFound();
  }

  return (
    <Section
      spacing="lg"
      className={styles.section}
      aria-labelledby="product-heading"
    >
      <Container>
        <div className={styles.layout}>
          <ProductGallery
            name={product.name}
            mainPhoto={product.mainPhoto}
            gallery={product.gallery}
          />

          <div className={styles.info}>
            <Heading id="product-heading" level={1}>
              {product.name}
            </Heading>
            <Text>{product.description}</Text>
            <p className={styles.price}>{formatPrice(product.price)}</p>
            <ProductPurchaseControls
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                mainPhoto: product.mainPhoto,
                alias: product.alias,
              }}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
