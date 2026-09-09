import Link from "next/link";
import { Card } from "@/components/ui/Card/Card";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { formatPrice } from "@/lib/format-price";
import type { Product } from "@/types/product";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
  /** Heading level for the product name (default `2`). Use `3` under a page section `h2`. */
  headingLevel?: 2 | 3;
};

export function ProductCard({
  product,
  headingLevel = 2,
}: ProductCardProps) {
  const TitleTag = headingLevel === 3 ? "h3" : "h2";

  return (
    <Link href={`/products/${product.alias}`} className={styles.link}>
      <Card as="article" padded={false} className={styles.card}>
        <MediaImage
          src={product.mainPhoto}
          alt={product.name}
          aspectRatio="4/3"
          sizes="(max-width: 40rem) 100vw, (max-width: 60rem) 50vw, 33vw"
        />
        <div className={styles.body}>
          <TitleTag className={styles.name}>{product.name}</TitleTag>
          <p className={styles.price}>{formatPrice(product.price)}</p>
        </div>
      </Card>
    </Link>
  );
}
