"use client";

import Link from "next/link";
import { QuantityControls } from "@/components/product/QuantityControls";
import { Button } from "@/components/ui/Button/Button";
import { MediaImage } from "@/components/ui/MediaImage/MediaImage";
import { formatPrice } from "@/lib/format-price";
import type { CartItem } from "@/types/cart";
import styles from "./MiniCartLine.module.css";

type MiniCartLineProps = {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function MiniCartLine({
  item,
  onQuantityChange,
  onRemove,
}: MiniCartLineProps) {
  return (
    <li className={styles.item}>
      <div className={styles.media}>
        <MediaImage
          src={item.mainPhoto}
          alt={item.name}
          aspectRatio="1/1"
          sizes="56px"
        />
      </div>
      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.info}>
            <Link href={`/products/${item.alias}`} className={styles.name}>
              {item.name}
            </Link>
            <p className={styles.unitPrice}>{formatPrice(item.price)}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            Удалить
          </Button>
        </div>
        <div>
          <QuantityControls
            value={item.quantity}
            onChange={onQuantityChange}
            id={`mini-cart-qty-${item.productId}`}
            allowRemove
            compact
          />
        </div>
      </div>
    </li>
  );
}
