"use client";

import Link from "next/link";
import { QuantityControls } from "@/components/product/QuantityControls";
import { Button } from "@/components/ui/Button/Button";
import { MIN_QUANTITY } from "@/constants/cart";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";
import styles from "./ProductPurchaseControls.module.css";

const KEYBOARD_COMMIT_DELAY_MS = 300;

type ProductPurchaseControlsProps = {
  product: Pick<
    Product,
    "id" | "name" | "price" | "mainPhoto" | "alias"
  >;
};

export function ProductPurchaseControls({
  product,
}: ProductPurchaseControlsProps) {
  const { items, isHydrated, addItem, updateQuantity } = useCart();

  const cartItem = items.find((item) => item.productId === product.id);
  const inCart = Boolean(cartItem);

  function handleAdd() {
    addItem({
      productId: product.id,
      quantity: MIN_QUANTITY,
      name: product.name,
      price: product.price,
      mainPhoto: product.mainPhoto,
      alias: product.alias,
    });
  }

  if (!isHydrated) {
    return (
      <div className={styles.actions} aria-hidden="true">
        <div className={styles.placeholder} />
      </div>
    );
  }

  if (inCart && cartItem) {
    return (
      <div className={styles.actions}>
        <QuantityControls
          value={cartItem.quantity}
          onChange={(quantity) => updateQuantity(product.id, quantity)}
          allowRemove
          editable
          commitDelayMs={KEYBOARD_COMMIT_DELAY_MS}
          id={`product-cart-qty-${product.id}`}
        />
        <Link href="/cart" className={styles.goLink}>
          Перейти
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <Button type="button" variant="primary" onClick={handleAdd}>
        В корзину
      </Button>
    </div>
  );
}
